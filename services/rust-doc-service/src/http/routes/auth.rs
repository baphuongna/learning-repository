use axum::{extract::State, http::StatusCode, Json};
use bcrypt::{hash, verify};

use crate::{
    accounts::{AuthResponse, ChangePasswordPayload, LoginPayload, RegisterPayload, UpdateProfilePayload},
    app_state::AppState,
    auth::CurrentUser,
    error::{AppError, AppResult},
    repository::{
        create_user, find_user_by_email, find_user_by_id, get_profile_by_user_id, update_user_password,
        update_user_profile,
    },
};

pub async fn register_handler(
    State(state): State<AppState>,
    Json(payload): Json<RegisterPayload>,
) -> AppResult<(StatusCode, Json<AuthResponse>)> {
    let email = payload.email.trim().to_lowercase();
    let full_name = payload.fullName.trim().to_string();

    if email.is_empty() || !email.contains('@') {
        return Err(AppError::BadRequest("Email không hợp lệ".to_string()));
    }

    if full_name.len() < 2 {
        return Err(AppError::BadRequest("Họ tên phải có ít nhất 2 ký tự".to_string()));
    }

    if payload.password.len() < 6 {
        return Err(AppError::BadRequest("Mật khẩu phải có ít nhất 6 ký tự".to_string()));
    }

    if find_user_by_email(&state.db_pool, &email).await?.is_some() {
        return Err(AppError::BadRequest("Email đã được sử dụng".to_string()));
    }

    let password_hash = hash(&payload.password, 10)
        .map_err(|error| AppError::Internal(format!("Failed to hash password: {error}")))?;
    let user = create_user(&state.db_pool, &email, &full_name, &password_hash).await?;
    let access_token = state
        .config
        .sign_jwt(&user.id, &user.email, &user.role)
        .map_err(|error| AppError::Internal(format!("Failed to sign jwt: {error}")))?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            accessToken: access_token,
            user: user.to_auth_user(),
        }),
    ))
}

pub async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> AppResult<Json<AuthResponse>> {
    let email = payload.email.trim().to_lowercase();
    let Some(user) = find_user_by_email(&state.db_pool, &email).await? else {
        return Err(AppError::Forbidden("Email hoặc mật khẩu không đúng".to_string()));
    };

    let is_valid = verify(&payload.password, &user.password_hash)
        .map_err(|error| AppError::Internal(format!("Failed to verify password: {error}")))?;

    if !is_valid {
        return Err(AppError::Forbidden("Email hoặc mật khẩu không đúng".to_string()));
    }

    let access_token = state
        .config
        .sign_jwt(&user.id, &user.email, &user.role)
        .map_err(|error| AppError::Internal(format!("Failed to sign jwt: {error}")))?;

    Ok(Json(AuthResponse {
        accessToken: access_token,
        user: user.to_auth_user(),
    }))
}

pub async fn me_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> AppResult<Json<crate::accounts::ProfileResponse>> {
    let current_user = current_user.user();
    let profile = get_profile_by_user_id(&state.db_pool, &current_user.id)
        .await?
        .ok_or_else(|| AppError::Forbidden("Người dùng không tồn tại".to_string()))?;

    Ok(Json(profile))
}

pub async fn update_profile_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<UpdateProfilePayload>,
) -> AppResult<Json<crate::accounts::ProfileResponse>> {
    let current_user = current_user.user();
    let full_name = payload.fullName.as_deref().map(str::trim).filter(|value| !value.is_empty());
    let avatar_url = payload.avatarUrl.as_deref().map(str::trim).filter(|value| !value.is_empty());

    let profile = update_user_profile(&state.db_pool, &current_user.id, full_name, avatar_url)
        .await?
        .ok_or_else(|| AppError::Forbidden("Người dùng không tồn tại".to_string()))?;

    Ok(Json(profile))
}

pub async fn change_password_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<ChangePasswordPayload>,
) -> AppResult<Json<serde_json::Value>> {
    let current_user = current_user.user();
    let user = find_user_by_id(&state.db_pool, &current_user.id)
        .await?
        .ok_or_else(|| AppError::Forbidden("Người dùng không tồn tại".to_string()))?;

    let is_valid = verify(&payload.currentPassword, &user.password_hash)
        .map_err(|error| AppError::Internal(format!("Failed to verify current password: {error}")))?;

    if !is_valid {
        return Err(AppError::BadRequest("Mật khẩu hiện tại không đúng".to_string()));
    }

    if payload.newPassword.len() < 6 {
        return Err(AppError::BadRequest("Mật khẩu mới phải có ít nhất 6 ký tự".to_string()));
    }

    let is_same = verify(&payload.newPassword, &user.password_hash)
        .map_err(|error| AppError::Internal(format!("Failed to compare password: {error}")))?;
    if is_same {
        return Err(AppError::BadRequest("Mật khẩu mới phải khác mật khẩu hiện tại".to_string()));
    }

    let new_hash = hash(&payload.newPassword, 10)
        .map_err(|error| AppError::Internal(format!("Failed to hash new password: {error}")))?;
    update_user_password(&state.db_pool, &current_user.id, &new_hash).await?;

    Ok(Json(serde_json::json!({ "message": "Đổi mật khẩu thành công" })))
}
