use crate::core::config::AppConfig;
use sqlx::SqlitePool;

#[derive(Clone, Debug)]
pub struct AppState {
    pub config: AppConfig,
    pub db_pool: SqlitePool,
}

impl AppState {
    pub fn new(config: AppConfig, db_pool: SqlitePool) -> Self {
        Self { config, db_pool }
    }
}
