pub mod auth;
pub mod documents;
pub mod folders;
pub mod health;
pub mod inspect;
pub mod inspections;
pub mod news;
pub mod upload;
pub mod users;

use axum::{extract::DefaultBodyLimit, routing::{get, patch, post, put}, Router};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::core::app_state::AppState;

pub fn create_router(state: AppState) -> Router {
    let multipart_limit = state.config.max_file_size_bytes;

    Router::new()
        .route("/health", get(health::health_check))
        .route("/auth/register", post(auth::register_handler))
        .route("/auth/login", post(auth::login_handler))
        .route("/auth/me", get(auth::me_handler))
        .route("/auth/profile", put(auth::update_profile_handler))
        .route("/auth/change-password", put(auth::change_password_handler))
        .route("/admin/users", get(users::list_users_handler))
        .route("/admin/users/{id}/approve", patch(users::approve_user_handler))
        .route("/admin/users/{id}/reject", patch(users::reject_user_handler))
        .route("/upload", post(upload::upload_file_handler).layer(DefaultBodyLimit::max(multipart_limit)))
        .route("/upload/{filename}", get(upload::get_uploaded_file_handler))
        .route("/news-categories", get(news::list_categories_handler).post(news::create_category_handler))
        .route("/news-categories/admin", get(news::list_categories_admin_handler))
        .route("/news-categories/{id}", get(news::get_category_handler).put(news::update_category_handler).delete(news::delete_category_handler))
        .route("/news", get(news::list_news_handler).post(news::create_news_handler))
        .route("/news/featured", get(news::featured_news_handler))
        .route("/news/slug/{slug}", get(news::get_news_by_slug_handler))
        .route("/news/my", get(news::my_news_handler))
        .route("/news/{id}", get(news::get_news_by_id_handler).put(news::update_news_handler).delete(news::delete_news_handler))
        .route("/inspect", post(inspect::inspect_file).layer(DefaultBodyLimit::max(multipart_limit)))
        .route("/inspections", get(inspections::list_inspections))
        .route("/inspections/{id}", get(inspections::get_inspection_detail))
        .route(
            "/v2/documents",
            get(documents::list_documents_handler)
                .post(documents::create_document_handler)
                .layer(DefaultBodyLimit::max(multipart_limit)),
        )
        .route("/v2/documents/my", get(documents::list_my_documents_handler))
        .route("/v2/documents/{id}", get(documents::get_document_detail_handler).put(documents::update_document_handler).delete(documents::delete_document_handler))
        .route("/v2/documents/{id}/download", get(documents::download_document_handler))
        .route("/v2/folders", get(folders::list_folders_handler).post(folders::create_folder_handler))
        .route("/v2/folders/tree", get(folders::get_folder_tree_handler))
        .route("/v2/folders/{id}", get(folders::get_folder_detail_handler).put(folders::update_folder_handler).delete(folders::delete_folder_handler))
        .route("/v2/folders/{id}/breadcrumbs", get(folders::get_folder_breadcrumbs_handler))
        .route("/v2/folders/{id}/children", get(folders::get_folder_children_handler))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}
