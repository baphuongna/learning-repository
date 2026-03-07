use std::time::Duration;

use sqlx::{migrate::MigrateError, sqlite::SqlitePoolOptions, SqlitePool};

use crate::core::config::AppConfig;

pub async fn create_pool(config: &AppConfig) -> Result<SqlitePool, sqlx::Error> {
    SqlitePoolOptions::new()
        .max_connections(config.database_max_connections)
        .acquire_timeout(Duration::from_secs(10))
        .connect(&config.database_url)
        .await
}

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), MigrateError> {
    sqlx::migrate!("./migrations").run(pool).await
}
