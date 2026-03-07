mod core {
    pub mod app_state;
    pub mod config;
    pub mod database;
    pub mod error;
    pub mod models;
    pub mod repository;
    pub mod storage;
}

mod domains {
    pub mod auth {
        pub mod models;
        pub mod service;
    }

    pub mod documents {
        pub mod models;
    }

    pub mod folders {
        pub mod models;
    }

    pub mod inspection {
        pub mod service;
    }

    pub mod news {
        pub mod models;
    }
}

mod http {
    pub mod routes;
}

pub use core::app_state as app_state;
pub use core::config as config;
pub use core::database as database;
pub use core::error as error;
pub use core::models as models;
pub use core::repository as repository;
pub use core::storage as storage;
pub use domains::auth::models as accounts;
pub use domains::auth::service as auth;
pub use domains::documents::models as documents;
pub use domains::folders::models as folders;
pub use domains::inspection::service as inspection;
pub use domains::news::models as news;
pub use http::routes as routes;
#[cfg(test)]
mod tests;

use app_state::AppState;
use config::AppConfig;
use database::{create_pool, run_migrations};
use routes::create_router;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    init_tracing();

    let config = AppConfig::from_env();
    let db_pool = create_pool(&config).await?;
    run_migrations(&db_pool).await?;
    let address = config.socket_address();
    let listener = tokio::net::TcpListener::bind(&address).await?;
    let app = create_router(AppState::new(config.clone(), db_pool));

    info!(
        host = %config.host,
        port = config.port,
        max_file_size_bytes = config.max_file_size_bytes,
        "rust-doc-service started"
    );
    info!(allowed_content_types = ?config.allowed_content_types, "loaded file validation config");
    info!(database_max_connections = config.database_max_connections, "database config loaded");

    axum::serve(listener, app).await?;

    Ok(())
}

fn init_tracing() {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("rust_doc_service=debug,tower_http=info"));

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(env_filter)
        .init();
}
