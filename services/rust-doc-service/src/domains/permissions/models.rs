use serde::{Deserialize, Serialize};

/// Dòng dữ liệu từ bảng folder_permissions
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PermissionRecord {
    pub id: String,
    pub folder_id: String,
    pub user_id: String,
    pub can_upload: bool,
    pub granted_by: String,
    pub granted_at: String,
    pub user_name: String,
    pub user_email: Option<String>,
    pub granted_by_name: String,
}

#[derive(Debug, Serialize, Clone)]
#[allow(non_snake_case)]
pub struct UserPermissionSummary {
    pub canUpload: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrantPermissionPayload {
    pub user_id: String,
    pub can_upload: bool,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct PermissionResponse {
    pub id: String,
    pub folderId: String,
    pub user: PermissionUserSummary,
    pub canUpload: bool,
    pub grantedBy: PermissionUserSummary,
    pub grantedAt: String,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct PermissionUserSummary {
    pub id: String,
    pub fullName: String,
    pub email: Option<String>,
}

impl PermissionRecord {
    pub fn into_response(self) -> PermissionResponse {
        PermissionResponse {
            id: self.id,
            folderId: self.folder_id,
            user: PermissionUserSummary {
                id: self.user_id,
                fullName: self.user_name,
                email: self.user_email,
            },
            canUpload: self.can_upload,
            grantedBy: PermissionUserSummary {
                id: self.granted_by,
                fullName: self.granted_by_name,
                email: None,
            },
            grantedAt: self.granted_at,
        }
    }
}
