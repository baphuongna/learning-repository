CREATE TABLE IF NOT EXISTS inspection_history (
    id TEXT PRIMARY KEY,
    filename TEXT,
    content_type TEXT,
    extension TEXT,
    size_bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    supported_content_type BOOLEAN NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_history_created_at
    ON inspection_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inspection_history_sha256
    ON inspection_history (sha256);
