use axum::{
    extract::{Path, Query, State},
    Json,
};

use crate::{
    accounts::{AdminUserResponse, UserSearchResult},
    app_state::AppState,
    auth::{AuthUser, CurrentUser},
    error::{AppError, AppResult},
    repository::{
        approve_user, find_user_by_id, list_users_for_admin, reject_user, search_users_by_email,
    },
};

#[derive(Debug, serde::Deserialize)]
pub struct ListUsersQuery {
    pub status: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct RejectUserPayload {
    pub reason: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct UserSearchQuery {
    pub q: Option<String>,
}

pub async fn search_users_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<UserSearchQuery>,
) -> AppResult<Json<Vec<UserSearchResult>>> {
    let current_user = current_user.user();
    let q = query.q.unwrap_or_default();
    let q = q.trim().to_string();

    let results = search_users_by_email(&state.db_pool, &q, &current_user.id)
        .await
        .map_err(AppError::Database)?;

    Ok(Json(results))
}

pub async fn list_users_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<ListUsersQuery>,
) -> AppResult<Json<Vec<AdminUserResponse>>> {
    let current_user = current_user.user();
    ensure_can_approve_users(&state, &current_user).await?;

    let status = normalize_status(query.status.as_deref())?;
    let search = query.search.as_deref().map(str::trim).filter(|value| !value.is_empty());

    let users = list_users_for_admin(&state.db_pool, status, search).await?;
    Ok(Json(users.into_iter().map(|item| item.to_admin_user()).collect()))
}

pub async fn approve_user_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(user_id): Path<String>,
) -> AppResult<Json<AdminUserResponse>> {
    let current_user = current_user.user();
    ensure_can_approve_users(&state, &current_user).await?;

    let user = approve_user(&state.db_pool, &user_id, &current_user.id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy người dùng".to_string()))?;

    Ok(Json(user.to_admin_user()))
}

pub async fn reject_user_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(user_id): Path<String>,
    Json(payload): Json<RejectUserPayload>,
) -> AppResult<Json<AdminUserResponse>> {
    let current_user = current_user.user();
    ensure_can_approve_users(&state, &current_user).await?;

    let reason = payload.reason.as_deref().map(str::trim).filter(|value| !value.is_empty());
    let user = reject_user(&state.db_pool, &user_id, &current_user.id, reason)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy người dùng".to_string()))?;

    Ok(Json(user.to_admin_user()))
}

async fn ensure_can_approve_users(state: &AppState, current_user: &AuthUser) -> AppResult<()> {
    if current_user.role == "ADMIN" {
        return Ok(());
    }

    let db_user = find_user_by_id(&state.db_pool, &current_user.id)
        .await?
        .ok_or_else(|| AppError::Forbidden("Bạn không có quyền phê duyệt người dùng".to_string()))?;

    if db_user.can_approve_users {
        return Ok(());
    }

    Err(AppError::Forbidden(
        "Bạn không có quyền phê duyệt người dùng".to_string(),
    ))
}

fn normalize_status(status: Option<&str>) -> AppResult<Option<&'static str>> {
    match status.map(str::trim).filter(|value| !value.is_empty()) {
        None => Ok(None),
        Some(raw) if raw.eq_ignore_ascii_case("PENDING") => Ok(Some("PENDING")),
        Some(raw) if raw.eq_ignore_ascii_case("ACTIVE") => Ok(Some("ACTIVE")),
        Some(raw) if raw.eq_ignore_ascii_case("REJECTED") => Ok(Some("REJECTED")),
        Some(_) => Err(AppError::BadRequest("Trạng thái không hợp lệ".to_string())),
    }
}
