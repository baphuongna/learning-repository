use axum::{extract::{Path, Query, State}, Json};
use std::collections::HashMap;

use crate::{
    app_state::AppState,
    auth::{ensure_can_access_document, ensure_can_manage_document, CurrentUser},
    error::{AppError, AppResult},
    folders::{CreateFolderPayload, FolderResponse, UpdateFolderPayload},
    repository::{
        create_folder, find_folder_by_id, get_folder_breadcrumbs, is_descendant_folder, list_folders,
        soft_delete_folder, update_folder,
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

    Ok(Json(items.into_iter().map(|item| item.into_response()).collect()))
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
    let tree = build_folder_tree(folders, query.parent_id.as_deref());

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

    Ok(Json(folder.into_response()))
}

pub async fn get_folder_breadcrumbs_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let breadcrumbs = get_folder_breadcrumbs(&state.db_pool, &id).await?;

    for folder in &breadcrumbs {
        ensure_can_access_document(&current_user, &folder.user_id, folder.is_public)?;
    }

    Ok(Json(breadcrumbs.into_iter().map(|item| item.into_response()).collect()))
}

pub async fn get_folder_children_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<Vec<FolderResponse>>> {
    let current_user = current_user.user();
    let items = list_folders(&state.db_pool, &current_user.id, &current_user.role, Some(&id)).await?;

    Ok(Json(items.into_iter().map(|item| item.into_response()).collect()))
}

pub async fn create_folder_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateFolderPayload>,
) -> AppResult<(axum::http::StatusCode, Json<FolderResponse>)> {
    let current_user = current_user.user();

    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên thư mục không được để trống".to_string()));
    }

    if let Some(parent_id) = payload.parent_id.as_deref() {
        let parent = find_folder_by_id(&state.db_pool, parent_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Thư mục cha không tồn tại".to_string()))?;
        ensure_can_manage_document(&current_user, &parent.user_id)?;
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
) -> Vec<FolderResponse> {
    let mut by_parent: HashMap<Option<String>, Vec<crate::folders::FolderRecord>> = HashMap::new();

    for folder in folders {
        by_parent.entry(folder.parent_id.clone()).or_default().push(folder);
    }

    fn assemble(
        by_parent: &mut HashMap<Option<String>, Vec<crate::folders::FolderRecord>>,
        parent_id: Option<String>,
    ) -> Vec<FolderResponse> {
        let mut items = by_parent.remove(&parent_id).unwrap_or_default();
        items.sort_by(|a, b| a.name.cmp(&b.name));

        items
            .into_iter()
            .map(|folder| {
                let folder_id = folder.id.clone();
                let mut response = folder.into_response();
                response.children = Some(assemble(by_parent, Some(folder_id)));
                response
            })
            .collect()
    }

    assemble(&mut by_parent, parent_id.map(ToOwned::to_owned))
}
