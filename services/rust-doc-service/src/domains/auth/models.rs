use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct UserRecord {
    pub id: String,
    pub email: String,
    pub full_name: String,
    pub password_hash: String,
    pub role: String,
    pub status: String,
    pub can_approve_users: bool,
    pub approved_by: Option<String>,
    pub approved_at: Option<String>,
    pub rejected_by: Option<String>,
    pub rejected_at: Option<String>,
    pub rejection_reason: Option<String>,
    pub avatar_url: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Clone)]
#[allow(non_snake_case)]
pub struct AuthUserResponse {
    pub id: String,
    pub email: String,
    pub fullName: String,
    pub role: String,
    pub status: String,
    pub canApproveUsers: bool,
    pub avatarUrl: Option<String>,
    pub createdAt: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct AuthResponse {
    pub accessToken: Option<String>,
    pub user: AuthUserResponse,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct ProfileResponse {
    pub id: String,
    pub email: String,
    pub fullName: String,
    pub role: String,
    pub status: String,
    pub canApproveUsers: bool,
    pub avatarUrl: Option<String>,
    pub createdAt: String,
    pub _count: ProfileCount,
}

#[derive(Debug, Serialize, Clone)]
#[allow(non_snake_case)]
pub struct AdminUserResponse {
    pub id: String,
    pub email: String,
    pub fullName: String,
    pub role: String,
    pub status: String,
    pub canApproveUsers: bool,
    pub approvedBy: Option<String>,
    pub approvedAt: Option<String>,
    pub rejectedBy: Option<String>,
    pub rejectedAt: Option<String>,
    pub rejectionReason: Option<String>,
    pub avatarUrl: Option<String>,
    pub createdAt: String,
}

#[derive(Debug, Serialize)]
pub struct ProfileCount {
    pub documents: i64,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
pub struct RegisterPayload {
    pub email: String,
    pub fullName: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
pub struct UpdateProfilePayload {
    pub fullName: Option<String>,
    pub avatarUrl: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
pub struct ChangePasswordPayload {
    pub currentPassword: String,
    pub newPassword: String,
}

impl UserRecord {
    pub fn to_auth_user(&self) -> AuthUserResponse {
        AuthUserResponse {
            id: self.id.clone(),
            email: self.email.clone(),
            fullName: self.full_name.clone(),
            role: self.role.clone(),
            status: self.status.clone(),
            canApproveUsers: self.can_approve_users,
            avatarUrl: self.avatar_url.clone(),
            createdAt: Some(self.created_at.clone()),
        }
    }

    pub fn to_admin_user(&self) -> AdminUserResponse {
        AdminUserResponse {
            id: self.id.clone(),
            email: self.email.clone(),
            fullName: self.full_name.clone(),
            role: self.role.clone(),
            status: self.status.clone(),
            canApproveUsers: self.can_approve_users,
            approvedBy: self.approved_by.clone(),
            approvedAt: self.approved_at.clone(),
            rejectedBy: self.rejected_by.clone(),
            rejectedAt: self.rejected_at.clone(),
            rejectionReason: self.rejection_reason.clone(),
            avatarUrl: self.avatar_url.clone(),
            createdAt: self.created_at.clone(),
        }
    }
}
