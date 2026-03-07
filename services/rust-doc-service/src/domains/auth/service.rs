use axum::{
    extract::{FromRef, FromRequestParts},
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::{core::app_state::AppState, core::error::AppError};

#[derive(Debug, Clone, Deserialize)]
struct JwtClaims {
    sub: String,
    email: String,
    role: String,
    exp: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub role: String,
}

pub struct CurrentUser(pub AuthUser);

#[derive(Serialize)]
struct AuthErrorEnvelope {
    error: AuthErrorBody,
}

#[derive(Serialize)]
struct AuthErrorBody {
    code: &'static str,
    message: &'static str,
}

impl IntoResponse for CurrentUser {
    fn into_response(self) -> Response {
        Json(self.0).into_response()
    }
}

impl<S> FromRequestParts<S> for CurrentUser
where
    AppState: axum::extract::FromRef<S>,
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);
        let Some(authorization) = parts.headers.get(header::AUTHORIZATION) else {
            return Err(unauthorized_response());
        };

        let Ok(authorization) = authorization.to_str() else {
            return Err(unauthorized_response());
        };

        let Some(token) = authorization.strip_prefix("Bearer ") else {
            return Err(unauthorized_response());
        };

        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;

        let claims = decode::<JwtClaims>(
            token,
            &DecodingKey::from_secret(app_state.config.jwt_secret.as_bytes()),
            &validation,
        )
        .map_err(|_| unauthorized_response())?
        .claims;

        let _ = claims.exp;

        Ok(Self(AuthUser {
            id: claims.sub,
            email: claims.email,
            role: claims.role,
        }))
    }
}

impl CurrentUser {
    pub fn user(self) -> AuthUser {
        self.0
    }
}

fn unauthorized_response() -> Response {
    (
        StatusCode::UNAUTHORIZED,
        Json(AuthErrorEnvelope {
            error: AuthErrorBody {
                code: "UNAUTHORIZED",
                message: "Bạn cần đăng nhập để truy cập",
            },
        }),
    )
        .into_response()
}

pub fn ensure_can_access_document(
    current_user: &AuthUser,
    owner_id: &str,
    is_public: bool,
) -> Result<(), AppError> {
    if current_user.role == "ADMIN" || current_user.id == owner_id || is_public {
        return Ok(());
    }

    Err(AppError::Forbidden("Access denied".to_string()))
}

pub fn ensure_can_manage_document(current_user: &AuthUser, owner_id: &str) -> Result<(), AppError> {
    if current_user.role == "ADMIN" || current_user.id == owner_id {
        return Ok(());
    }

    Err(AppError::Forbidden("Access denied".to_string()))
}
