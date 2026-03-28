use axum::{
    body::Body,
    extract::{Multipart, Path, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::Response,
    Json,
};
use tracing::{error, info};

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
        cascade_folder_private_if_empty, cascade_folder_public_status, create_document, find_document_by_id,
        insert_inspection_history, list_documents, soft_delete_document, update_document,
    },
    storage::persist_uploaded_file,
};

pub async fn create_document_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    current_user: CurrentUser,
    mut multipart: Multipart,
) -> AppResult<(StatusCode, Json<crate::documents::DocumentResponse>)> {
    let current_user = current_user.user();
    let upload_request_id = uuid::Uuid::new_v4().to_string();
    let client_request_id = headers
        .get("x-client-request-id")
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let content_length = headers
        .get(header::CONTENT_LENGTH)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let origin = headers
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);

    info!(
        request_id = %upload_request_id,
        client_request_id = ?client_request_id,
        user_id = %current_user.id,
        role = %current_user.role,
        content_length = ?content_length,
        user_agent = ?user_agent,
        origin = ?origin,
        "document upload started"
    );

    let mut title: Option<String> = None;
    let mut description: Option<String> = None;
    let mut author: Option<String> = None;
    let mut subject: Option<String> = None;
    let mut keywords_raw: Option<String> = None;
    let mut is_public = false;
    let mut folder_id: Option<String> = None;
    let mut inspection_id: Option<String> = None;
    let mut uploaded_file: Option<UploadedFile> = None;

    while let Some(field) = multipart.next_field().await.map_err(|error| {
        error!(
            request_id = %upload_request_id,
            client_request_id = ?client_request_id,
            stage = "next_field",
            error = %error,
            "document upload multipart read failed"
        );
        AppError::Multipart(error)
    })? {
        let field_name = field.name().map(ToOwned::to_owned);
        let file_name = field.file_name().map(ToOwned::to_owned);
        let content_type = field.content_type().map(ToOwned::to_owned);

        info!(
            request_id = %upload_request_id,
            client_request_id = ?client_request_id,
            field_name = ?field_name,
            file_name = ?file_name,
            content_type = ?content_type,
            "document upload field received"
        );

        match field_name.as_deref() {
            Some("file") => {
                let bytes = field.bytes().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        client_request_id = ?client_request_id,
                        stage = "file_bytes",
                        file_name = ?file_name,
                        content_type = ?content_type,
                        error = %error,
                        "document upload file bytes read failed"
                    );
                    AppError::Multipart(error)
                })?;

                info!(
                    request_id = %upload_request_id,
                    client_request_id = ?client_request_id,
                    file_name = ?file_name,
                    content_type = ?content_type,
                    file_size_bytes = bytes.len(),
                    "document upload file field parsed"
                );

                uploaded_file = Some(UploadedFile {
                    filename: file_name,
                    content_type,
                    bytes,
                });
            }
            Some("title") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "title_text",
                        error = %error,
                        "document upload title read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, title_length = value.len(), "document upload title parsed");
                title = Some(value);
            }
            Some("description") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "description_text",
                        error = %error,
                        "document upload description read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, description_length = value.len(), "document upload description parsed");
                description = Some(value);
            }
            Some("author") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "author_text",
                        error = %error,
                        "document upload author read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, author_length = value.len(), "document upload author parsed");
                author = Some(value);
            }
            Some("subject") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "subject_text",
                        error = %error,
                        "document upload subject read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, subject_length = value.len(), "document upload subject parsed");
                subject = Some(value);
            }
            Some("keywords") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "keywords_text",
                        error = %error,
                        "document upload keywords read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, keywords_length = value.len(), "document upload keywords parsed");
                keywords_raw = Some(value);
            }
            Some("isPublic") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "is_public_text",
                        error = %error,
                        "document upload isPublic read failed"
                    );
                    AppError::Multipart(error)
                })?;
                is_public = parse_bool(Some(&value));
                info!(request_id = %upload_request_id, raw_value = %value, parsed_value = is_public, "document upload isPublic parsed");
            }
            Some("folderId") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "folder_id_text",
                        error = %error,
                        "document upload folderId read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, folder_id = %value, "document upload folderId parsed");
                folder_id = Some(value);
            }
            Some("inspectionId") => {
                let value = field.text().await.map_err(|error| {
                    error!(
                        request_id = %upload_request_id,
                        stage = "inspection_id_text",
                        error = %error,
                        "document upload inspectionId read failed"
                    );
                    AppError::Multipart(error)
                })?;
                info!(request_id = %upload_request_id, inspection_id = %value, "document upload inspectionId parsed");
                inspection_id = Some(value);
            }
            _ => {}
        }
    }

    let title = title
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| AppError::BadRequest("Tiêu đề không được để trống".to_string()))?;

    let uploaded_file = uploaded_file
        .ok_or_else(|| AppError::BadRequest("Expected multipart field named `file`".to_string()))?;

    info!(
        request_id = %upload_request_id,
        client_request_id = ?client_request_id,
        file_name = ?uploaded_file.filename,
        file_content_type = ?uploaded_file.content_type,
        file_size_bytes = uploaded_file.bytes.len(),
        has_folder_id = folder_id.as_ref().is_some_and(|value| !value.trim().is_empty()),
        has_inspection_id = inspection_id.as_ref().is_some_and(|value| !value.trim().is_empty()),
        "document upload multipart parsing completed"
    );

    // Validate upload permission for selected folder
    let folder_id_normalized = normalize_optional_text(folder_id.clone());
    if let Some(ref fid) = folder_id_normalized {
        let can_upload = crate::repository::can_upload_to_folder(&state.db_pool, &current_user.id, fid)
            .await
            .map_err(AppError::Database)?;

        if !can_upload {
            return Err(AppError::Forbidden(
                "Bạn không có quyền upload file vào thư mục này".to_string(),
            ));
        }
    }

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

    info!(
        request_id = %upload_request_id,
        client_request_id = ?client_request_id,
        title = %document.title,
        file_name = %document.fileName,
        document_id = %document.id,
        "document upload completed successfully"
    );

    // Auto-share parent folders if document is created as public
    if is_public {
        if let Some(ref folder_id) = document.folderId {
            let _ = cascade_folder_public_status(&state.db_pool, folder_id, true).await;
        }
    }

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
    
    // Store folder_id before deletion for cascade check
    let folder_id = document.folder_id.clone();
    let was_public = document.is_public;
    
    soft_delete_document(&state.db_pool, &id).await?;

    // If deleted document was public, check if parent folders should become private
    if was_public {
        if let Some(fid) = folder_id {
            let _ = cascade_folder_private_if_empty(&state.db_pool, &fid).await;
        }
    }

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

    // Check if is_public is being changed
    let is_becoming_public = payload.is_public == Some(true) && !existing.is_public;
    let is_becoming_private = payload.is_public == Some(false) && existing.is_public;
    let existing_folder_id = existing.folder_id.clone();

    let updated = update_document(&state.db_pool, &id, &payload)
        .await?
        .ok_or_else(|| AppError::NotFound("Document not found".to_string()))?;

    // Auto-share parent folders if document is being shared
    if is_becoming_public {
        if let Some(ref folder_id) = updated.folder_id {
            let _ = cascade_folder_public_status(&state.db_pool, folder_id, true).await;
        }
    }

    // Cascade private to parent folders if document is becoming private
    if is_becoming_private {
        if let Some(folder_id) = existing_folder_id {
            let _ = cascade_folder_private_if_empty(&state.db_pool, &folder_id).await;
        }
    }

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
