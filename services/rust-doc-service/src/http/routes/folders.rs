use axum::{extract::{Path, Query, State}, Json};
use std::collections::HashMap;

use crate::{
    app_state::AppState,
    auth::{ensure_can_access_document, ensure_can_manage_document, CurrentUser},
    error::{AppError, AppResult},
    folders::{CreateFolderPayload, FolderResponse, UpdateFolderPayload},
    permissions::UserPermissionSummary,
    repository::{
        create_folder, find_folder_by_id, find_folder_by_name_and_parent, get_folder_breadcrumbs,
        get_user_folder_permission, is_descendant_folder, list_folders, soft_delete_folder,
        update_folder,
    },
};

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderListQuery {
    pub parent_id: Option<String>,
}

pub async fn list_folders_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let items = list_folders(&state.db_pool, &current_user.id, &current_user.role, None).await?;
    let mut responses = Vec::with_capacity(items.len());

    for item in items {
        let folder_id = item.id.clone();
        let response = enrich_folder_with_permission(
            &state.db_pool,
            &current_user.id,
            &folder_id,
            item.into_response(),
        )
        .await;
        responses.push(response);
    }

    Ok(Json(responses))
}

pub async fn get_folder_tree_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<FolderListQuery>,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let folders = list_folders(
        &state.db_pool,
        &current_user.id,
        &current_user.role,
        None,
    )
    .await?;
    let mut permission_map: HashMap<String, UserPermissionSummary> = HashMap::new();
    for folder in &folders {
        if let Ok(Some(can_upload)) =
            get_user_folder_permission(&state.db_pool, &current_user.id, &folder.id).await
        {
            permission_map.insert(
                folder.id.clone(),
                UserPermissionSummary {
                    canUpload: can_upload,
                },
            );
        }
    }

    let tree = build_folder_tree(folders, query.parent_id.as_deref(), &permission_map);

    Ok(Json(tree))
}

pub async fn get_folder_detail_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<FolderResponse>> {
    let current_user = current_user.user();
    let folder = find_folder_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    if folder.status == "DELETED" {
        return Err(AppError::NotFound("Không tìm thấy thư mục".to_string()));
    }

    ensure_can_access_document(&current_user, &folder.user_id, folder.is_public)?;
    let folder_id = folder.id.clone();
    let response = enrich_folder_with_permission(
        &state.db_pool,
        &current_user.id,
        &folder_id,
        folder.into_response(),
    )
    .await;

    Ok(Json(response))
}

pub async fn get_folder_breadcrumbs_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let breadcrumbs = get_folder_breadcrumbs(&state.db_pool, &id).await?;
    let mut responses = Vec::with_capacity(breadcrumbs.len());

    for folder in breadcrumbs {
        ensure_can_access_document(&current_user, &folder.user_id, folder.is_public)?;
        let folder_id = folder.id.clone();
        let response = enrich_folder_with_permission(
            &state.db_pool,
            &current_user.id,
            &folder_id,
            folder.into_response(),
        )
        .await;
        responses.push(response);
    }

    Ok(Json(responses))
}

pub async fn get_folder_children_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let items = list_folders(&state.db_pool, &current_user.id, &current_user.role, Some(&id)).await?;
    let mut responses = Vec::with_capacity(items.len());

    for item in items {
        let folder_id = item.id.clone();
        let response = enrich_folder_with_permission(
            &state.db_pool,
            &current_user.id,
            &folder_id,
            item.into_response(),
        )
        .await;
        responses.push(response);
    }

    Ok(Json(responses))
}

pub async fn create_folder_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(mut payload): Json<CreateFolderPayload>,
) -> AppResult<(axum::http::StatusCode, Json<FolderResponse>)> {
    let current_user = current_user.user();

    // Validate name
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên thư mục không được để trống".to_string()));
    }

    // Force isPublic=false for new folders - folder chỉ public khi có content public
    payload.is_public = Some(false);

    // Check if parent exists and user has permission
    if let Some(parent_id) = payload.parent_id.as_deref() {
        let parent = find_folder_by_id(&state.db_pool, parent_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Thư mục cha không tồn tại".to_string()))?;
        ensure_can_manage_document(&current_user, &parent.user_id)?;
    }

    // Check for duplicate name in same parent
    let existing = find_folder_by_name_and_parent(
        &state.db_pool,
        &payload.name,
        payload.parent_id.as_deref(),
        &current_user.id,
    )
    .await
    .map_err(AppError::Database)?;

    if existing.is_some() {
        return Err(AppError::Conflict(
            "Đã tồn tại thư mục cùng tên trong thư mục cha".to_string(),
        ));
    }

    let folder = create_folder(&state.db_pool, &current_user.id, &payload).await?;
    Ok((axum::http::StatusCode::CREATED, Json(folder.into_response())))
}

pub async fn update_folder_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
    Json(payload): Json<UpdateFolderPayload>,
) -> AppResult<Json<FolderResponse>> {
    let current_user = current_user.user();
    let existing = find_folder_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    ensure_can_manage_document(&current_user, &existing.user_id)?;

    if let Some(parent_id) = payload.parent_id.as_deref() {
        if parent_id == id {
            return Err(AppError::Forbidden("Không thể đặt thư mục cha là chính nó".to_string()));
        }

        let parent = find_folder_by_id(&state.db_pool, parent_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Thư mục cha không tồn tại".to_string()))?;
        ensure_can_manage_document(&current_user, &parent.user_id)?;

        if is_descendant_folder(&state.db_pool, &id, parent_id).await? {
            return Err(AppError::Forbidden(
                "Không thể di chuyển thư mục vào thư mục con của nó".to_string(),
            ));
        }
    }

    let folder = update_folder(&state.db_pool, &id, &payload)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    Ok(Json(folder.into_response()))
}

pub async fn delete_folder_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<axum::http::StatusCode> {
    let current_user = current_user.user();
    let folder = find_folder_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy thư mục".to_string()))?;

    ensure_can_manage_document(&current_user, &folder.user_id)?;
    soft_delete_folder(&state.db_pool, &id).await?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}

fn build_folder_tree(
    folders: Vec<crate::folders::FolderRecord>,
    parent_id: Option<&str>,
    permissions: &HashMap<String, UserPermissionSummary>,
) -> Vec<FolderResponse> {
    let mut by_parent: HashMap<Option<String>, Vec<crate::folders::FolderRecord>> = HashMap::new();

    for folder in folders {
        by_parent.entry(folder.parent_id.clone()).or_default().push(folder);
    }

    fn assemble(
        by_parent: &mut HashMap<Option<String>, Vec<crate::folders::FolderRecord>>,
        parent_id: Option<String>,
        permissions: &HashMap<String, UserPermissionSummary>,
    ) -> Vec<FolderResponse> {
        let mut items = by_parent.remove(&parent_id).unwrap_or_default();
        items.sort_by(|a, b| a.name.cmp(&b.name));

        items
            .into_iter()
            .map(|folder| {
                let folder_id = folder.id.clone();
                let mut response = folder.into_response();
                if let Some(permission) = permissions.get(&folder_id) {
                    response.userPermission = Some(permission.clone());
                }
                response.children = Some(assemble(by_parent, Some(folder_id), permissions));
                response
            })
            .collect()
    }

    assemble(&mut by_parent, parent_id.map(ToOwned::to_owned), permissions)
}

async fn enrich_folder_with_permission(
    pool: &sqlx::SqlitePool,
    user_id: &str,
    folder_id: &str,
    mut response: FolderResponse,
) -> FolderResponse {
    if let Ok(Some(can_upload)) = get_user_folder_permission(pool, user_id, folder_id).await {
        response.userPermission = Some(UserPermissionSummary {
            canUpload: can_upload,
        });
    }

    response
}
