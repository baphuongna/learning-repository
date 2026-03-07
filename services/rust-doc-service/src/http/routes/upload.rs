use std::path::Path;

use axum::{
    body::Body,
    extract::{Multipart, Path as AxumPath},
    http::{header, StatusCode},
    response::Response,
    Json,
};

use crate::{
    auth::CurrentUser,
    documents::join_repo_path,
    error::{AppError, AppResult},
    inspection::UploadedFile,
    storage::{infer_mime_type, persist_public_upload},
};

#[derive(serde::Serialize)]
pub struct UploadResponse {
    pub message: String,
    pub path: String,
    pub filename: String,
}

pub async fn upload_file_handler(
    _current_user: CurrentUser,
    mut multipart: Multipart,
) -> AppResult<(StatusCode, Json<UploadResponse>)> {
    while let Some(field) = multipart.next_field().await? {
        if field.name() != Some("file") {
            continue;
        }

        let stored = persist_public_upload(&UploadedFile {
            filename: field.file_name().map(ToOwned::to_owned),
            content_type: field.content_type().map(ToOwned::to_owned),
            bytes: field.bytes().await?,
        })?;

        return Ok((
            StatusCode::CREATED,
            Json(UploadResponse {
                message: "Upload thành công".to_string(),
                path: stored.relative_path,
                filename: stored.filename,
            }),
        ));
    }

    Err(AppError::BadRequest(
        "Expected multipart field named `file`".to_string(),
    ))
}

pub async fn get_uploaded_file_handler(
    AxumPath(filename): AxumPath<String>,
) -> AppResult<Response> {
    let file_path = join_repo_path(&format!("services/rust-doc-service/data/uploads/{filename}"));

    if !file_path.exists() {
        return Err(AppError::NotFound("File không tồn tại".to_string()));
    }

    let file_bytes = tokio::fs::read(&file_path)
        .await
        .map_err(|_| AppError::NotFound("File không tồn tại".to_string()))?;
    let extension = Path::new(&filename)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{value}"))
        .unwrap_or_default();
    let mime_type = infer_mime_type(&extension);

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename.replace('"', "")),
        )
        .body(Body::from(file_bytes))
        .map_err(|error| AppError::Internal(format!("Failed to build upload response: {error}")))
}
