use axum::{extract::{Path, Query, State}, http::StatusCode, Json};

use crate::{
    app_state::AppState,
    auth::{CurrentUser, ensure_can_manage_document},
    error::{AppError, AppResult},
    news::{CreateCategoryPayload, CreateNewsPayload, ListNewsQuery, UpdateCategoryPayload, UpdateNewsPayload},
    repository::{
        archive_news, count_news_in_category, create_news, create_news_category, find_news_by_id,
        find_news_by_slug, find_news_category_by_id, find_news_category_by_slug, increment_news_view_count,
        list_featured_news, list_my_news, list_news, list_news_categories, slug_exists_in_news,
        update_news, update_news_category, inactivate_news_category,
    },
};

#[derive(serde::Serialize)]
#[allow(non_snake_case)]
pub struct PaginationMeta {
    total: i64,
    page: i64,
    limit: i64,
    totalPages: i64,
}

#[derive(serde::Serialize)]
pub struct PaginatedNewsResponse {
    data: Vec<crate::news::NewsResponse>,
    meta: PaginationMeta,
}

pub async fn list_categories_handler(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<crate::news::NewsCategoryResponse>>> {
    let items = list_news_categories(&state.db_pool, false).await?;
    Ok(Json(items.into_iter().map(|item| item.into_response()).collect()))
}

pub async fn list_categories_admin_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> AppResult<Json<Vec<crate::news::NewsCategoryResponse>>> {
    let current_user = current_user.user();
    if current_user.role != "ADMIN" {
        return Err(AppError::Forbidden("Chỉ Admin mới có quyền truy cập".to_string()));
    }

    let items = list_news_categories(&state.db_pool, true).await?;
    Ok(Json(items.into_iter().map(|item| item.into_response()).collect()))
}

pub async fn get_category_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<crate::news::NewsCategoryResponse>> {
    let item = find_news_category_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy danh mục".to_string()))?;
    Ok(Json(item.into_response()))
}

pub async fn create_category_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateCategoryPayload>,
) -> AppResult<(StatusCode, Json<crate::news::NewsCategoryResponse>)> {
    let current_user = current_user.user();
    if current_user.role != "ADMIN" {
        return Err(AppError::Forbidden("Chỉ Admin mới có quyền tạo danh mục".to_string()));
    }
    if find_news_category_by_slug(&state.db_pool, &payload.slug).await?.is_some() {
        return Err(AppError::BadRequest("Slug đã tồn tại".to_string()));
    }
    let item = create_news_category(&state.db_pool, &payload).await?;
    Ok((StatusCode::CREATED, Json(item.into_response())))
}

pub async fn update_category_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
    Json(payload): Json<UpdateCategoryPayload>,
) -> AppResult<Json<crate::news::NewsCategoryResponse>> {
    let current_user = current_user.user();
    if current_user.role != "ADMIN" {
        return Err(AppError::Forbidden("Chỉ Admin mới có quyền cập nhật danh mục".to_string()));
    }
    let existing = find_news_category_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy danh mục".to_string()))?;
    if let Some(slug) = payload.slug.as_deref() {
        let duplicate = find_news_category_by_slug(&state.db_pool, slug).await?;
        if let Some(duplicate) = duplicate {
            if duplicate.id != existing.id {
                return Err(AppError::BadRequest("Slug đã tồn tại".to_string()));
            }
        }
    }
    let item = update_news_category(&state.db_pool, &id, &payload)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy danh mục".to_string()))?;
    Ok(Json(item.into_response()))
}

pub async fn delete_category_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let current_user = current_user.user();
    if current_user.role != "ADMIN" {
        return Err(AppError::Forbidden("Chỉ Admin mới có quyền xóa danh mục".to_string()));
    }
    let count = count_news_in_category(&state.db_pool, &id).await?;
    if count > 0 {
        return Err(AppError::Forbidden(format!("Không thể xóa danh mục đang có {count} bài viết")));
    }
    inactivate_news_category(&state.db_pool, &id).await?;
    Ok(Json(serde_json::json!({ "message": "Đã xóa danh mục thành công" })))
}

pub async fn list_news_handler(
    State(state): State<AppState>,
    Query(query): Query<ListNewsQuery>,
) -> AppResult<Json<PaginatedNewsResponse>> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let (items, total) = list_news(&state.db_pool, &query).await?;
    Ok(Json(PaginatedNewsResponse {
        data: items.into_iter().map(|item| item.into_response()).collect(),
        meta: PaginationMeta { total, page, limit, totalPages: ((total + limit - 1) / limit).max(1) },
    }))
}

pub async fn featured_news_handler(
    State(state): State<AppState>,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> AppResult<Json<Vec<crate::news::NewsResponse>>> {
    let limit = query.get("limit").and_then(|value| value.parse::<i64>().ok()).unwrap_or(5);
    let items = list_featured_news(&state.db_pool, limit).await?;
    Ok(Json(items.into_iter().map(|item| item.into_response()).collect()))
}

pub async fn get_news_by_slug_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<crate::news::NewsResponse>> {
    let item = find_news_by_slug(&state.db_pool, &slug)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;
    if !item.is_published || item.status != "PUBLISHED" {
        return Err(AppError::NotFound("Không tìm thấy bài viết".to_string()));
    }
    increment_news_view_count(&state.db_pool, &item.id).await?;
    let mut response = item.into_response();
    response.viewCount += 1;
    Ok(Json(response))
}

pub async fn get_news_by_id_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<crate::news::NewsResponse>> {
    let item = find_news_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;
    Ok(Json(item.into_response()))
}

pub async fn my_news_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Query(query): Query<ListNewsQuery>,
) -> AppResult<Json<PaginatedNewsResponse>> {
    let current_user = current_user.user();
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let (items, total) = list_my_news(&state.db_pool, &current_user.id, page, limit).await?;
    Ok(Json(PaginatedNewsResponse {
        data: items.into_iter().map(|item| item.into_response()).collect(),
        meta: PaginationMeta { total, page, limit, totalPages: ((total + limit - 1) / limit).max(1) },
    }))
}

pub async fn create_news_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateNewsPayload>,
) -> AppResult<(StatusCode, Json<crate::news::NewsResponse>)> {
    let current_user = current_user.user();
    if slug_exists_in_news(&state.db_pool, &payload.slug, None).await? {
        return Err(AppError::BadRequest("Slug đã tồn tại".to_string()));
    }
    let category = find_news_category_by_id(&state.db_pool, &payload.category_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Danh mục không tồn tại".to_string()))?;
    if category.status != "ACTIVE" {
        return Err(AppError::BadRequest("Danh mục không khả dụng".to_string()));
    }
    let item = create_news(&state.db_pool, &current_user.id, &payload).await?;
    Ok((StatusCode::CREATED, Json(item.into_response())))
}

pub async fn update_news_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
    Json(payload): Json<UpdateNewsPayload>,
) -> AppResult<Json<crate::news::NewsResponse>> {
    let current_user = current_user.user();
    let existing = find_news_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;
    ensure_can_manage_document(&current_user, &existing.user_id)?;
    if let Some(slug) = payload.slug.as_deref() {
        if slug_exists_in_news(&state.db_pool, slug, Some(&id)).await? {
            return Err(AppError::BadRequest("Slug đã tồn tại".to_string()));
        }
    }
    if let Some(category_id) = payload.category_id.as_deref() {
        find_news_category_by_id(&state.db_pool, category_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Danh mục không tồn tại".to_string()))?;
    }
    let item = update_news(&state.db_pool, &id, &payload)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;
    Ok(Json(item.into_response()))
}

pub async fn delete_news_handler(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let current_user = current_user.user();
    let existing = find_news_by_id(&state.db_pool, &id)
        .await?
        .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;
    ensure_can_manage_document(&current_user, &existing.user_id)?;
    archive_news(&state.db_pool, &id).await?;
    Ok(Json(serde_json::json!({ "message": "Đã xóa bài viết thành công" })))
}
