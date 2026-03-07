use axum::{extract::{Multipart, State}, Json};
use serde::Serialize;

use crate::{
    app_state::AppState,
    error::{AppError, AppResult},
    inspection::{inspect_uploaded_file, UploadedFile},
    repository::insert_inspection_history,
};

#[derive(Debug, Serialize)]
pub struct InspectResponse {
    pub data: crate::inspection::FileInspectionResult,
    pub persisted: crate::models::InspectionHistory,
}

pub async fn inspect_file(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> AppResult<Json<InspectResponse>> {
    while let Some(field) = multipart.next_field().await? {
        if field.name() != Some("file") {
            continue;
        }

        let filename = field.file_name().map(ToOwned::to_owned);
        let content_type = field.content_type().map(ToOwned::to_owned);
        let bytes = field.bytes().await?;

        let inspection = inspect_uploaded_file(
            &state.config,
            UploadedFile {
                filename,
                content_type,
                bytes,
            },
        )?;

        let persisted = insert_inspection_history(&state.db_pool, &inspection).await?;

        return Ok(Json(InspectResponse {
            data: inspection,
            persisted,
        }));
    }

    Err(AppError::BadRequest(
        "Expected multipart field named `file`".to_string(),
    ))
}
