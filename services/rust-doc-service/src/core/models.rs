use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct InspectionHistory {
    pub id: String,
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub extension: Option<String>,
    pub size_bytes: i64,
    pub sha256: String,
    pub supported_content_type: bool,
    pub created_at: String,
}
