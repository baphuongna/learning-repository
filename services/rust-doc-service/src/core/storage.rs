use std::{fs, path::PathBuf};

use uuid::Uuid;

use crate::{
    documents::{file_storage_relative_path, join_repo_path, UploadedDocumentFile},
    error::{AppError, AppResult},
    inspection::UploadedFile,
};

pub struct GenericStoredFile {
    pub filename: String,
    pub relative_path: String,
}

pub fn persist_uploaded_file(file: &UploadedFile) -> AppResult<UploadedDocumentFile> {
    let original_name = file
        .filename
        .clone()
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Uploaded file is missing filename".to_string()))?;

    let extension = PathBuf::from(&original_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{value}"))
        .unwrap_or_default();

    let generated_name = format!("{}{}", Uuid::new_v4(), extension);
    let relative_path = file_storage_relative_path(&generated_name);
    let absolute_path = join_repo_path(&relative_path);

    if let Some(parent) = absolute_path.parent() {
        fs::create_dir_all(parent).map_err(|error| {
            AppError::Internal(format!("Failed to prepare upload directory: {error}"))
        })?;
    }

    fs::write(&absolute_path, &file.bytes)
        .map_err(|error| AppError::Internal(format!("Failed to save uploaded file: {error}")))?;

    Ok(UploadedDocumentFile {
        file_name: original_name,
        relative_path,
        size: file.bytes.len() as i64,
        mime_type: file.content_type.clone(),
    })
}

pub fn persist_public_upload(file: &UploadedFile) -> AppResult<GenericStoredFile> {
    let original_name = file
        .filename
        .clone()
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Uploaded file is missing filename".to_string()))?;

    let extension = PathBuf::from(&original_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{value}"))
        .unwrap_or_default();

    let generated_name = format!("{}{}", Uuid::new_v4(), extension);
    let relative_path = format!("services/rust-doc-service/data/uploads/{generated_name}");
    let absolute_path = join_repo_path(&relative_path);

    if let Some(parent) = absolute_path.parent() {
        fs::create_dir_all(parent).map_err(|error| {
            AppError::Internal(format!("Failed to prepare upload directory: {error}"))
        })?;
    }

    fs::write(&absolute_path, &file.bytes)
        .map_err(|error| AppError::Internal(format!("Failed to save uploaded file: {error}")))?;

    Ok(GenericStoredFile {
        filename: generated_name,
        relative_path,
    })
}

pub fn infer_mime_type(extension: &str) -> String {
    match extension.to_lowercase().as_str() {
        ".pdf" => "application/pdf",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls" => "application/vnd.ms-excel",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".ppt" => "application/vnd.ms-powerpoint",
        ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".txt" => "text/plain",
        ".jpg" | ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".webp" => "image/webp",
        ".mp4" => "video/mp4",
        ".mp3" => "audio/mpeg",
        _ => "application/octet-stream",
    }
    .to_string()
}
