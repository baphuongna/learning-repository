# SQL Changelog - Folder Permissions

Tài liệu này ghi lại thay đổi SQL / database cho tính năng phân quyền upload theo thư mục.

## 1. Migration mới

File migration:

```text
services/rust-doc-service/migrations/0002_create_folder_permissions.sql
```

### Mục đích

Thêm bảng trung gian để owner của folder có thể cấp quyền upload cho user khác.

### SQL đã thêm

```sql
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
```

## 2. Ý nghĩa schema

- `id`: định danh bản ghi permission
- `folder_id`: thư mục được cấp quyền
- `user_id`: user được cấp quyền
- `can_upload`: hiện tại dùng để bật/tắt quyền upload
- `granted_by`: owner đã cấp quyền
- `granted_at`: thời điểm cấp quyền

## 3. Constraint quan trọng

### Unique key

```sql
UNIQUE(folder_id, user_id)
```

Ý nghĩa:

- một user chỉ có tối đa một permission record trên một folder
- khi grant lại cùng folder/user thì logic ứng dụng dùng `ON CONFLICT DO UPDATE`

### Foreign key cascade

```sql
FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
```

Ý nghĩa:

- xóa folder thì permission liên quan bị xóa theo
- xóa user được grant hoặc owner grant thì permission liên quan bị xóa theo

## 4. Runtime SQL fix sau khi test API thật

Sau khi chạy live API test, phát hiện 2 endpoint bị `500 DATABASE_ERROR`:

- `GET /v2/users/search`
- `POST /v2/folders/{id}/permissions`

### Root cause

SQLite thực tế của project đang dùng cột:

```text
users.fullName
```

nhưng query mới lại dùng:

```text
users.full_name
```

### SQL/query fix đã áp dụng trong `repository.rs`

- `SELECT id, full_name, email` → `SELECT id, "fullName" as full_name, email`
- `ORDER BY full_name` → `ORDER BY "fullName"`
- `u.full_name as user_name` → `u."fullName" as user_name`
- `g.full_name as granted_by_name` → `g."fullName" as granted_by_name`
- `ORDER BY u.full_name` → `ORDER BY u."fullName"`

## 5. Kết quả verify sau fix

### Verification kỹ thuật

- `cargo build --manifest-path services/rust-doc-service/Cargo.toml` ✅
- `cargo test --manifest-path services/rust-doc-service/Cargo.toml` ✅

### Live API verification

Đã test thật flow sau:

1. register owner + contributor
2. activate user trong SQLite local
3. login owner + contributor
4. search contributor qua `/v2/users/search`
5. owner tạo folder
6. contributor upload trước khi grant → `403 FORBIDDEN`
7. owner grant permission
8. list permissions → trả về 1 record
9. contributor upload sau khi grant → thành công

## 6. Ghi chú triển khai

- quyền upload được kiểm tra ở runtime bằng cách đi ngược parent chain
- grant trên folder cha có hiệu lực cho folder con
- ownership của document vẫn thuộc về user upload file
