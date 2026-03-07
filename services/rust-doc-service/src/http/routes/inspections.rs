use axum::{extract::{Path, Query, State}, Json};
use serde::Deserialize;

use crate::{
    app_state::AppState,
    error::{AppError, AppResult},
    repository::{find_inspection_by_id, list_recent_inspections},
};

#[derive(Debug, Deserialize)]
pub struct ListInspectionsQuery {
    pub limit: Option<i64>,
}

#[derive(Debug, serde::Serialize)]
pub struct ListInspectionsResponse {
    pub data: Vec<crate::models::InspectionHistory>,
}

#[derive(Debug, serde::Serialize)]
pub struct InspectionDetailResponse {
    pub data: crate::models::InspectionHistory,
}

pub async fn list_inspections(
    State(state): State<AppState>,
    Query(query): Query<ListInspectionsQuery>,
) -> AppResult<Json<ListInspectionsResponse>> {
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let items = list_recent_inspections(&state.db_pool, limit).await?;

    Ok(Json(ListInspectionsResponse { data: items }))
}

pub async fn get_inspection_detail(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<InspectionDetailResponse>> {
    let inspection = find_inspection_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Inspection `{id}` not found")))?;

    Ok(Json(InspectionDetailResponse { data: inspection }))
}
