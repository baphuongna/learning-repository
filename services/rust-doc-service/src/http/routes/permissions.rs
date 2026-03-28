use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    app_state::AppState,
    auth::{ensure_can_manage_document, CurrentUser},
    error::{AppError, AppResult},
    permissions::{GrantPermissionPayload, PermissionResponse},
    repository::{
        find_folder_by_id, grant_folder_permission, list_folder_permissions,
        revoke_folder_permission,
    },
};

pub async fn grant_permission_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(folder_id): Path<String>,
    Json(payload): Json<GrantPermissionPayload>,
) -> AppResult<Json<PermissionResponse>> {
    let current_user = current_user.user();

    let folder = find_folder_by_id(&state.db_pool, &folder_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    ensure_can_manage_document(&current_user, &folder.user_id)?;

    if payload.user_id == current_user.id {
        return Err(AppError::BadRequest(
            "Không thể cấp quyền cho chính bạn".to_string(),
        ));
    }

    let permission =
        grant_folder_permission(&state.db_pool, &folder_id, &current_user.id, &payload).await?;
    Ok(Json(permission.into_response()))
}

pub async fn list_permissions_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(folder_id): Path<String>,
) -> AppResult<Json<Vec<PermissionResponse>>> {
    let current_user = current_user.user();

    let folder = find_folder_by_id(&state.db_pool, &folder_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    ensure_can_manage_document(&current_user, &folder.user_id)?;

    let permissions = list_folder_permissions(&state.db_pool, &folder_id).await?;
    Ok(Json(
        permissions.into_iter().map(|p| p.into_response()).collect(),
    ))
}

pub async fn revoke_permission_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path((folder_id, permission_id)): Path<(String, String)>,
) -> AppResult<axum::http::StatusCode> {
    let current_user = current_user.user();

    let folder = find_folder_by_id(&state.db_pool, &folder_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    ensure_can_manage_document(&current_user, &folder.user_id)?;

    let revoked = revoke_folder_permission(&state.db_pool, &permission_id).await?;
    if !revoked {
        return Err(AppError::NotFound("Không tìm thấy quyền này".to_string()));
    }

    Ok(axum::http::StatusCode::NO_CONTENT)
}
