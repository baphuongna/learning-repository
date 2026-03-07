use axum::{
    extract::multipart::MultipartError,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use tracing::error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Forbidden(String),
    NotFound(String),
    Internal(String),
    PayloadTooLarge { limit_bytes: usize, actual_bytes: usize },
    UnsupportedContentType { received: String },
    Multipart(MultipartError),
    Database(sqlx::Error),
}

#[derive(Serialize)]
struct ErrorEnvelope {
    error: ErrorBody,
}

#[derive(Serialize)]
struct ErrorBody {
    code: &'static str,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            Self::BadRequest(message) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", message),
            Self::Forbidden(message) => (StatusCode::FORBIDDEN, "FORBIDDEN", message),
            Self::NotFound(message) => (StatusCode::NOT_FOUND, "NOT_FOUND", message),
            Self::Internal(message) => {
                error!(message = %message, "internal application error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "Internal server error".to_string(),
                )
            }
            Self::PayloadTooLarge {
                limit_bytes,
                actual_bytes,
            } => (
                StatusCode::PAYLOAD_TOO_LARGE,
                "PAYLOAD_TOO_LARGE",
                format!(
                    "File size {actual_bytes} bytes exceeds limit {limit_bytes} bytes"
                ),
            ),
            Self::UnsupportedContentType { received } => (
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                "UNSUPPORTED_CONTENT_TYPE",
                format!("Unsupported content type: {received}"),
            ),
            Self::Multipart(error) => {
                error!(error = %error, "multipart parsing failed");
                (
                    StatusCode::BAD_REQUEST,
                    "MULTIPART_ERROR",
                    "Invalid multipart payload".to_string(),
                )
            }
            Self::Database(error) => {
                error!(error = %error, "database operation failed");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DATABASE_ERROR",
                    "Database operation failed".to_string(),
                )
            }
        };

        (status, Json(ErrorEnvelope { error: ErrorBody { code, message } })).into_response()
    }
}

impl From<MultipartError> for AppError {
    fn from(value: MultipartError) -> Self {
        Self::Multipart(value)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(value: sqlx::Error) -> Self {
        Self::Database(value)
    }
}
