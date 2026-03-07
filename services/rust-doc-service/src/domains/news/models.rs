use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct NewsCategoryRecord {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub order: i64,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub news_count: i64,
}

#[derive(Debug, Clone)]
pub struct NewsRecord {
    pub id: String,
    pub category_id: String,
    pub user_id: String,
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub content: String,
    pub thumbnail_url: Option<String>,
    pub is_published: bool,
    pub is_featured: bool,
    pub published_at: Option<String>,
    pub view_count: i64,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub category_name: String,
    pub category_slug: String,
    pub user_name: String,
    pub user_avatar_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct NewsCategoryResponse {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub order: i64,
    pub status: String,
    pub createdAt: String,
    pub updatedAt: String,
    pub _count: NewsCountSummary,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct NewsResponse {
    pub id: String,
    pub categoryId: String,
    pub category: NewsCategorySummary,
    pub userId: String,
    pub user: NewsUserSummary,
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub content: String,
    pub thumbnailUrl: Option<String>,
    pub isPublished: bool,
    pub isFeatured: bool,
    pub publishedAt: Option<String>,
    pub viewCount: i64,
    pub status: String,
    pub createdAt: String,
    pub updatedAt: String,
}

#[derive(Debug, Serialize)]
pub struct NewsCountSummary {
    pub news: i64,
}

#[derive(Debug, Serialize)]
pub struct NewsCategorySummary {
    pub id: String,
    pub name: String,
    pub slug: String,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct NewsUserSummary {
    pub id: String,
    pub fullName: String,
    pub avatarUrl: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCategoryPayload {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub order: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCategoryPayload {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub order: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNewsPayload {
    pub category_id: String,
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub content: String,
    pub thumbnail_url: Option<String>,
    pub is_featured: Option<bool>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNewsPayload {
    pub category_id: Option<String>,
    pub title: Option<String>,
    pub slug: Option<String>,
    pub summary: Option<String>,
    pub content: Option<String>,
    pub thumbnail_url: Option<String>,
    pub is_featured: Option<bool>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ListNewsQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub category: Option<String>,
    pub search: Option<String>,
}

impl NewsCategoryRecord {
    pub fn into_response(self) -> NewsCategoryResponse {
        NewsCategoryResponse {
            id: self.id,
            name: self.name,
            slug: self.slug,
            description: self.description,
            order: self.order,
            status: self.status,
            createdAt: self.created_at,
            updatedAt: self.updated_at,
            _count: NewsCountSummary { news: self.news_count },
        }
    }
}

impl NewsRecord {
    pub fn into_response(self) -> NewsResponse {
        NewsResponse {
            id: self.id,
            categoryId: self.category_id.clone(),
            category: NewsCategorySummary {
                id: self.category_id,
                name: self.category_name,
                slug: self.category_slug,
            },
            userId: self.user_id.clone(),
            user: NewsUserSummary {
                id: self.user_id,
                fullName: self.user_name,
                avatarUrl: self.user_avatar_url,
            },
            title: self.title,
            slug: self.slug,
            summary: self.summary,
            content: self.content,
            thumbnailUrl: self.thumbnail_url,
            isPublished: self.is_published,
            isFeatured: self.is_featured,
            publishedAt: self.published_at,
            viewCount: self.view_count,
            status: self.status,
            createdAt: self.created_at,
            updatedAt: self.updated_at,
        }
    }
}
