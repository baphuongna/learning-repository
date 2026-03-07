use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct FolderRecord {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<String>,
    pub user_id: String,
    pub is_public: bool,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub user_name: String,
    pub user_email: Option<String>,
    pub documents_count: i64,
    pub children_count: i64,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct FolderUserSummary {
    pub id: String,
    pub fullName: String,
    pub email: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct FolderCountSummary {
    pub documents: i64,
    pub children: i64,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct FolderResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub parentId: Option<String>,
    pub userId: String,
    pub isPublic: bool,
    pub status: String,
    pub createdAt: String,
    pub updatedAt: String,
    pub user: Option<FolderUserSummary>,
    pub children: Option<Vec<FolderResponse>>,
    pub _count: FolderCountSummary,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateFolderPayload {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<String>,
    pub is_public: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateFolderPayload {
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
    pub parent_id: Option<String>,
    pub is_public: Option<bool>,
}

impl FolderRecord {
    pub fn into_response(self) -> FolderResponse {
        FolderResponse {
            id: self.id,
            name: self.name,
            description: self.description,
            color: self.color,
            parentId: self.parent_id,
            userId: self.user_id.clone(),
            isPublic: self.is_public,
            status: self.status,
            createdAt: self.created_at,
            updatedAt: self.updated_at,
            user: Some(FolderUserSummary {
                id: self.user_id,
                fullName: self.user_name,
                email: self.user_email,
            }),
            children: None,
            _count: FolderCountSummary {
                documents: self.documents_count,
                children: self.children_count,
            },
        }
    }
}
