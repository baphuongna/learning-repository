use std::{path::Path, path::PathBuf};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct DocumentRecord {
    pub id: String,
    pub user_id: String,
    pub folder_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub file_name: Option<String>,
    pub file_path: Option<String>,
    pub file_size: Option<i64>,
    pub mime_type: Option<String>,
    pub inspection_id: Option<String>,
    pub status: String,
    pub is_public: bool,
    pub created_at: String,
    pub updated_at: String,
    pub user_name: String,
    pub user_email: String,
    pub folder_name: Option<String>,
    pub folder_color: Option<String>,
}

#[cfg(test)]
#[derive(Debug, Clone)]
pub struct DocumentInsertRecord {
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: Option<String>,
    pub inspection_id: Option<String>,
    pub is_public: bool,
    pub folder_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct DocumentUserSummary {
    pub id: String,
    pub fullName: String,
    pub email: String,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct DocumentFolderSummary {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct DocumentResponse {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Vec<String>,
    pub fileName: String,
    pub filePath: Option<String>,
    pub fileSize: Option<i64>,
    pub mimeType: Option<String>,
    pub inspectionId: Option<String>,
    pub status: String,
    pub isPublic: bool,
    pub folderId: Option<String>,
    pub folder: Option<DocumentFolderSummary>,
    pub createdAt: String,
    pub updatedAt: String,
    pub user: DocumentUserSummary,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct PaginationMeta {
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub totalPages: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedDocumentsResponse {
    pub data: Vec<DocumentResponse>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
pub struct ListDocumentsQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    #[serde(rename = "folderId")]
    pub folder_id: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Clone)]
pub struct CreateDocumentPayload {
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub is_public: bool,
    pub folder_id: Option<String>,
    pub inspection_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateDocumentPayload {
    pub title: Option<String>,
    pub description: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub is_public: Option<bool>,
    pub folder_id: Option<String>,
    pub inspection_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct UploadedDocumentFile {
    pub file_name: String,
    pub relative_path: String,
    pub size: i64,
    pub mime_type: Option<String>,
}

impl DocumentRecord {
    pub fn into_response(self) -> DocumentResponse {
        DocumentResponse {
            id: self.id,
            title: self.title,
            description: self.description,
            author: self.author,
            subject: self.subject,
            keywords: parse_keywords(self.keywords.as_deref()),
            fileName: self.file_name.unwrap_or_else(|| "unknown".to_string()),
            filePath: self.file_path.clone(),
            fileSize: self.file_size,
            mimeType: self.mime_type,
            inspectionId: self.inspection_id,
            status: self.status,
            isPublic: self.is_public,
            folderId: self.folder_id.clone(),
            folder: match (self.folder_id, self.folder_name) {
                (Some(id), Some(name)) => Some(DocumentFolderSummary {
                    id,
                    name,
                    color: self.folder_color,
                }),
                _ => None,
            },
            createdAt: self.created_at,
            updatedAt: self.updated_at,
            user: DocumentUserSummary {
                id: self.user_id,
                fullName: self.user_name,
                email: self.user_email,
            },
        }
    }
}

pub fn parse_bool(value: Option<&str>) -> bool {
    matches!(value, Some("true") | Some("1") | Some("on"))
}

pub fn parse_keywords(value: Option<&str>) -> Vec<String> {
    value
        .unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|item| !item.is_empty())
        .map(ToOwned::to_owned)
        .collect()
}

pub fn serialize_keywords(value: &[String]) -> Option<String> {
    if value.is_empty() {
        return Some("[]".to_string());
    }

    serde_json::to_string(value).ok()
}

pub fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value.and_then(|item| {
        let trimmed = item.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    })
}

pub fn file_storage_relative_path(file_name: &str) -> String {
    format!("uploads/{file_name}")
}

pub fn join_repo_path(relative_path: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|path| path.parent())
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."))
        .join(relative_path)
}

pub fn infer_download_name(record: &DocumentRecord) -> String {
    record
        .file_name
        .clone()
        .or_else(|| {
            record
                .file_path
                .as_ref()
                .and_then(|value| Path::new(value).file_name())
                .and_then(|value| value.to_str())
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| format!("{}.bin", record.id))
}
