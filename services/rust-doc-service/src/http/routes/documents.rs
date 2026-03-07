use axum::{
    body::Body,
    extract::{Multipart, Path, Query, State},
    http::{header, StatusCode},
    response::Response,
    Json,
};

use crate::{
    app_state::AppState,
    auth::{ensure_can_access_document, ensure_can_manage_document, CurrentUser},
    documents::{
        normalize_optional_text, parse_bool, parse_keywords, serialize_keywords,
        CreateDocumentPayload, ListDocumentsQuery, PaginatedDocumentsResponse, PaginationMeta,
        UpdateDocumentPayload,
    },
    error::{AppError, AppResult},
    inspection::{inspect_uploaded_file, UploadedFile},
    repository::{
        create_document, find_document_by_id, insert_inspection_history, list_documents,
        soft_delete_document, update_document,
    },
    storage::persist_uploaded_file,
};

pub async fn create_document_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    mut multipart: Multipart,
) -> AppResult<(StatusCode, Json<crate::documents::DocumentResponse>)> {
    let current_user = current_user.user();

    let mut title: Option<String> = None;
    let mut description: Option<String> = None;
    let mut author: Option<String> = None;
    let mut subject: Option<String> = None;
    let mut keywords_raw: Option<String> = None;
    let mut is_public = false;
    let mut folder_id: Option<String> = None;
    let mut inspection_id: Option<String> = None;
    let mut uploaded_file: Option<UploadedFile> = None;

    while let Some(field) = multipart.next_field().await? {
        let field_name = field.name().map(ToOwned::to_owned);

        match field_name.as_deref() {
            Some("file") => {
                let filename = field.file_name().map(ToOwned::to_owned);
                let content_type = field.content_type().map(ToOwned::to_owned);
                let bytes = field.bytes().await?;

                uploaded_file = Some(UploadedFile {
                    filename,
                    content_type,
                    bytes,
                });
            }
            Some("title") => title = Some(field.text().await?),
            Some("description") => description = Some(field.text().await?),
            Some("author") => author = Some(field.text().await?),
            Some("subject") => subject = Some(field.text().await?),
            Some("keywords") => keywords_raw = Some(field.text().await?),
            Some("isPublic") => {
                let value = field.text().await?;
                is_public = parse_bool(Some(&value));
            }
            Some("folderId") => folder_id = Some(field.text().await?),
            Some("inspectionId") => inspection_id = Some(field.text().await?),
            _ => {}
        }
    }

    let title = title
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| AppError::BadRequest("Tiêu đề không được để trống".to_string()))?;

    let uploaded_file = uploaded_file
        .ok_or_else(|| AppError::BadRequest("Expected multipart field named `file`".to_string()))?;

    let inspection = inspect_uploaded_file(&state.config, UploadedFile {
        filename: uploaded_file.filename.clone(),
        content_type: uploaded_file.content_type.clone(),
        bytes: uploaded_file.bytes.clone(),
    })?;

    let persisted_inspection = match inspection_id.clone() {
        Some(id) if !id.trim().is_empty() => Some(id),
        _ => Some(insert_inspection_history(&state.db_pool, &inspection).await?.id),
    };

    let stored_file = persist_uploaded_file(&uploaded_file)?;
    let keywords = parse_keywords(keywords_raw.as_deref());
    let payload = CreateDocumentPayload {
        title,
        description: normalize_optional_text(description),
        author: normalize_optional_text(author),
        subject: normalize_optional_text(subject),
        keywords: serialize_keywords(&keywords),
        is_public,
        folder_id: normalize_optional_text(folder_id),
        inspection_id: persisted_inspection,
    };

    let document = create_document(&state.db_pool, &current_user.id, &payload, &stored_file)
        .await?
        .into_response();

    Ok((StatusCode::CREATED, Json(document)))
}

pub async fn list_documents_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<ListDocumentsQuery>,
) -> AppResult<Json<PaginatedDocumentsResponse>> {
    let current_user = current_user.user();
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let search = query.q.as_deref().map(str::trim).filter(|value| !value.is_empty());
    let folder_id = query
        .folder_id
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty());

    let (documents, total) = list_documents(
        &state.db_pool,
        &current_user.id,
        &current_user.role,
        page,
        limit,
        folder_id,
        search,
        false,
    )
    .await?;

    Ok(Json(PaginatedDocumentsResponse {
        data: documents.into_iter().map(|item| item.into_response()).collect(),
        meta: PaginationMeta {
            total,
            page,
            limit,
            totalPages: ((total + limit - 1) / limit).max(1),
            query: search.map(ToOwned::to_owned),
        },
    }))
}

pub async fn list_my_documents_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<ListDocumentsQuery>,
) -> AppResult<Json<PaginatedDocumentsResponse>> {
    let current_user = current_user.user();
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let folder_id = query
        .folder_id
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty());

    let (documents, total) = list_documents(
        &state.db_pool,
        &current_user.id,
        &current_user.role,
        page,
        limit,
        folder_id,
        None,
        true,
    )
    .await?;

    Ok(Json(PaginatedDocumentsResponse {
        data: documents.into_iter().map(|item| item.into_response()).collect(),
        meta: PaginationMeta {
            total,
            page,
            limit,
            totalPages: ((total + limit - 1) / limit).max(1),
            query: None,
        },
    }))
}

pub async fn get_document_detail_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<crate::documents::DocumentResponse>> {
    let current_user = current_user.user();
    let document = find_document_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    if document.status == "DELETED" {
        return Err(AppError::NotFound("Document not found".to_string()));
    }

    ensure_can_access_document(&current_user, &document.user_id, document.is_public)?;

    Ok(Json(document.into_response()))
}

pub async fn delete_document_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<StatusCode> {
    let current_user = current_user.user();
    let document = find_document_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    if document.status == "DELETED" {
        return Err(AppError::NotFound("Document not found".to_string()));
    }

    ensure_can_manage_document(&current_user, &document.user_id)?;
    soft_delete_document(&state.db_pool, &id).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn update_document_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
    Json(mut payload): Json<UpdateDocumentPayload>,
) -> AppResult<Json<crate::documents::DocumentResponse>> {
    let current_user = current_user.user();
    let existing = find_document_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    if existing.status == "DELETED" {
        return Err(AppError::NotFound("Document not found".to_string()));
    }

    ensure_can_manage_document(&current_user, &existing.user_id)?;

    if let Some(title) = payload.title.as_ref() {
        if title.trim().is_empty() {
            return Err(AppError::BadRequest("Tiêu đề không được để trống".to_string()));
        }
        payload.title = Some(title.trim().to_string());
    }

    payload.description = normalize_optional_text(payload.description);
    payload.author = normalize_optional_text(payload.author);
    payload.subject = normalize_optional_text(payload.subject);
    payload.folder_id = normalize_optional_text(payload.folder_id);
    payload.inspection_id = normalize_optional_text(payload.inspection_id);

    if let Some(keywords) = payload.keywords.as_deref() {
        let parsed = parse_keywords(Some(keywords));
        payload.keywords = serialize_keywords(&parsed);
    }

    let updated = update_document(&state.db_pool, &id, &payload)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    Ok(Json(updated.into_response()))
}

pub async fn download_document_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Response> {
    let current_user = current_user.user();
    let document = find_document_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    if document.status == "DELETED" {
        return Err(AppError::NotFound("Document not found".to_string()));
    }

    ensure_can_access_document(&current_user, &document.user_id, document.is_public)?;

    let relative_path = document
        .file_path
        .clone()
        .ok_or_else(|| AppError::NotFound("File not found".to_string()))?;
    let absolute_path = crate::documents::join_repo_path(&relative_path);

    let file_bytes = tokio::fs::read(&absolute_path)
        .await
        .map_err(|_| AppError::NotFound("File not found".to_string()))?;

    let filename = crate::documents::infer_download_name(&document);
    let content_type = document
        .mime_type
        .clone()
        .unwrap_or_else(|| "application/octet-stream".to_string());

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, content_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename.replace('"', "")),
        )
        .body(Body::from(file_bytes))
        .map_err(|error| AppError::Internal(format!("Failed to build download response: {error}")))
}
