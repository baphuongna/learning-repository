use axum::body::Bytes;
use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::{core::config::AppConfig, core::error::AppError, core::error::AppResult};

#[derive(Debug)]
pub struct UploadedFile {
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub bytes: Bytes,
}

#[derive(Debug, Serialize)]
pub struct FileInspectionResult {
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub extension: Option<String>,
    pub size_bytes: usize,
    pub sha256: String,
    pub supported_content_type: bool,
}

pub fn inspect_uploaded_file(
    config: &AppConfig,
    uploaded_file: UploadedFile,
) -> AppResult<FileInspectionResult> {
    let size_bytes = uploaded_file.bytes.len();
    if size_bytes == 0 {
        return Err(AppError::BadRequest("Uploaded file is empty".to_string()));
    }

    if size_bytes > config.max_file_size_bytes {
        return Err(AppError::PayloadTooLarge {
            limit_bytes: config.max_file_size_bytes,
            actual_bytes: size_bytes,
        });
    }

    let supported_content_type = match uploaded_file.content_type.as_deref() {
        Some(content_type) => {
            if !config.allowed_content_types.contains(content_type) {
                return Err(AppError::UnsupportedContentType {
                    received: content_type.to_string(),
                });
            }
            true
        }
        None => false,
    };

    Ok(FileInspectionResult {
        extension: extract_extension(uploaded_file.filename.as_deref()),
        sha256: sha256_hex(&uploaded_file.bytes),
        filename: uploaded_file.filename,
        content_type: uploaded_file.content_type,
        size_bytes,
        supported_content_type,
    })
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hex::encode(hasher.finalize())
}

fn extract_extension(filename: Option<&str>) -> Option<String> {
    filename
        .and_then(|value| value.rsplit_once('.'))
        .map(|(_, extension)| extension.trim().to_ascii_lowercase())
        .filter(|value| !value.is_empty())
}

#[cfg(test)]
mod tests {
    use axum::body::Bytes;

    use super::{extract_extension, inspect_uploaded_file};
    use crate::{core::config::AppConfig, inspection::UploadedFile};

    fn test_config() -> AppConfig {
        AppConfig::from_env()
    }

    #[test]
    fn extracts_file_extension_in_lowercase() {
        let extension = extract_extension(Some("Lesson.Plan.PDF"));

        assert_eq!(extension.as_deref(), Some("pdf"));
    }

    #[test]
    fn returns_none_when_filename_has_no_extension() {
        let extension = extract_extension(Some("README"));

        assert!(extension.is_none());
    }

    #[test]
    fn computes_sha256_for_valid_file() {
        let config = test_config();
        let uploaded_file = UploadedFile {
            filename: Some("hello.txt".to_string()),
            content_type: Some("text/plain".to_string()),
            bytes: Bytes::from("hello"),
        };

        let result = inspect_uploaded_file(&config, uploaded_file).expect("inspection should pass");

        assert_eq!(
            result.sha256,
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        );
        assert_eq!(result.size_bytes, 5);
    }

    #[test]
    fn rejects_unsupported_content_type() {
        let config = test_config();
        let uploaded_file = UploadedFile {
            filename: Some("archive.zip".to_string()),
            content_type: Some("application/zip".to_string()),
            bytes: Bytes::from("zip-data"),
        };

        let result = inspect_uploaded_file(&config, uploaded_file);

        assert!(result.is_err());
    }
}
