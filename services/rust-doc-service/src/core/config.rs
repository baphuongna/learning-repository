use std::{collections::HashSet, env, path::PathBuf};

use jsonwebtoken::{EncodingKey, Header};
use serde::Serialize;

const DEFAULT_ALLOWED_CONTENT_TYPES: [&str; 6] = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg",
];

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub jwt_secret: String,
    pub max_file_size_bytes: usize,
    pub allowed_content_types: HashSet<String>,
    pub database_url: String,
    pub database_max_connections: u32,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let host = env::var("RUST_DOC_SERVICE_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("RUST_DOC_SERVICE_PORT")
            .ok()
            .and_then(|value| value.parse::<u16>().ok())
            .unwrap_or(4001);
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());
        let max_file_size_bytes = env::var("RUST_DOC_SERVICE_MAX_FILE_SIZE_BYTES")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(10 * 1024 * 1024);

        let allowed_content_types = env::var("RUST_DOC_SERVICE_ALLOWED_CONTENT_TYPES")
            .ok()
            .map(|value| {
                value
                    .split(',')
                    .map(str::trim)
                    .filter(|item| !item.is_empty())
                    .map(ToOwned::to_owned)
                    .collect::<HashSet<_>>()
            })
            .filter(|items| !items.is_empty())
            .unwrap_or_else(default_allowed_content_types);

        let database_url = env::var("RUST_DOC_SERVICE_DATABASE_URL")
            .or_else(|_| env::var("DATABASE_URL"))
            .map(|value| normalize_database_url(&value))
            .unwrap_or_else(|_| default_sqlite_database_url());

        let database_max_connections = env::var("RUST_DOC_SERVICE_DATABASE_MAX_CONNECTIONS")
            .ok()
            .and_then(|value| value.parse::<u32>().ok())
            .unwrap_or(5);

        Self {
            host,
            port,
            jwt_secret,
            max_file_size_bytes,
            allowed_content_types,
            database_url,
            database_max_connections,
        }
    }

    pub fn socket_address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

#[derive(Serialize)]
struct JwtPayload<'a> {
    sub: &'a str,
    email: &'a str,
    role: &'a str,
    exp: usize,
}

fn default_allowed_content_types() -> HashSet<String> {
    DEFAULT_ALLOWED_CONTENT_TYPES
        .iter()
        .map(|value| (*value).to_string())
        .collect()
}

fn default_sqlite_database_url() -> String {
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|path| path.parent())
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));

    let sqlite_path = repo_root.join("packages").join("data").join("prisma").join("dev.db");
    let normalized = sqlite_path.to_string_lossy().replace('\\', "/");

    format!("sqlite://{normalized}")
}

fn normalize_database_url(value: &str) -> String {
    if let Some(path) = value.strip_prefix("file:") {
        let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .and_then(|current| current.parent())
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("."));

        let normalized_path = repo_root
            .join("packages")
            .join("data")
            .join("prisma")
            .join(path.trim_start_matches("./"))
            .to_string_lossy()
            .replace('\\', "/");

        return format!("sqlite://{normalized_path}");
    }

    value.to_string()
}

impl AppConfig {
    pub fn sign_jwt(&self, user_id: &str, email: &str, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiration = (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize;
        let payload = JwtPayload {
            sub: user_id,
            email,
            role,
            exp: expiration,
        };

        jsonwebtoken::encode(
            &Header::default(),
            &payload,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )
    }
}
