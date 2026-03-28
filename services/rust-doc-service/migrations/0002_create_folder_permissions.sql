-- Bảng quyền truy cập thư mục: cho phép owner cấp quyền cho user khác
CREATE TABLE IF NOT EXISTS folder_permissions (
    id TEXT PRIMARY KEY,
    folder_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    can_upload BOOLEAN NOT NULL DEFAULT 0,
    granted_by TEXT NOT NULL,
    granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(folder_id, user_id),
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_folder_permissions_folder_id
    ON folder_permissions (folder_id);

CREATE INDEX IF NOT EXISTS idx_folder_permissions_user_id
    ON folder_permissions (user_id);
