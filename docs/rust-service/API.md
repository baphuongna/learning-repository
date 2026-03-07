# Rust Doc Service API

Tài liệu này mô tả API hiện tại của `services/rust-doc-service`.

Base URL local mặc định:

```text
http://127.0.0.1:4001
```

## 1. `GET /health`

Mục đích: kiểm tra service đang chạy.

### Request

```bash
curl http://127.0.0.1:4001/health
```

### Response `200 OK`

```json
{
  "status": "ok",
  "service": "rust-doc-service",
  "version": "0.1.0"
}
```

## 2. `POST /inspect`

Mục đích: inspect file upload qua multipart form-data.

### Request

Field bắt buộc:

- `file`: multipart field chứa file cần inspect

Ví dụ:

```bash
curl -X POST http://127.0.0.1:4001/inspect \
  -F "file=@./README.md;type=text/plain"
```

### Response `200 OK`

```json
{
  "data": {
    "filename": "README.md",
    "content_type": "text/plain",
    "extension": "md",
    "size_bytes": 15985,
    "sha256": "6b0f...",
    "supported_content_type": true
  },
  "persisted": {
    "id": "uuid",
    "filename": "README.md",
    "content_type": "text/plain",
    "extension": "md",
    "size_bytes": 15985,
    "sha256": "6b0f...",
    "supported_content_type": true,
    "created_at": "2026-03-06T15:00:00Z"
  }
}
```

### Ý nghĩa các field

- `filename`: tên file từ multipart metadata
- `content_type`: MIME type được gửi kèm
- `extension`: phần mở rộng suy ra từ filename
- `size_bytes`: kích thước file
- `sha256`: hash SHA-256 của nội dung file
- `supported_content_type`: `true` nếu MIME type nằm trong danh sách cho phép
- `persisted`: bản ghi đã lưu thành công trong SQLite hiện tại của project

## 3. `GET /inspections`

Mục đích: lấy lịch sử inspect gần nhất.

### Request

```bash
curl http://127.0.0.1:4001/inspections?limit=5
```

### Query Parameters

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| limit | int | 10 | Số lượng bản ghi muốn lấy, giới hạn 1-100 |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "filename": "README.md",
      "content_type": "text/plain",
      "extension": "md",
      "size_bytes": 15985,
      "sha256": "6b0f...",
      "supported_content_type": true,
      "created_at": "2026-03-06T15:00:00Z"
    }
  ]
}
```

## 4. `GET /inspections/:id`

Mục đích: lấy chi tiết một inspection record cụ thể.

### Request

```bash
curl http://127.0.0.1:4001/inspections/<inspection-id>
```

### Response `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "filename": "README.md",
    "content_type": "text/plain",
    "extension": "md",
    "size_bytes": 15985,
    "sha256": "6b0f...",
    "supported_content_type": true,
    "created_at": "2026-03-06T15:00:00Z"
  }
}
```

### Response `404 Not Found`

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Inspection `<inspection-id>` not found"
  }
}
```

## 5. Error responses

### Thiếu field `file`

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Expected multipart field named `file`"
  }
}
```

### File rỗng

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Uploaded file is empty"
  }
}
```

### File quá lớn

Status: `413 Payload Too Large`

```json
{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "File size 12000000 bytes exceeds limit 10485760 bytes"
  }
}
```

### MIME type không được hỗ trợ

Status: `415 Unsupported Media Type`

```json
{
  "error": {
    "code": "UNSUPPORTED_CONTENT_TYPE",
    "message": "Unsupported content type: application/zip"
  }
}
```

### Multipart payload không hợp lệ

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "MULTIPART_ERROR",
    "message": "Invalid multipart payload"
  }
}
```

### Database lỗi

Status: `500 Internal Server Error`

```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed"
  }
}
```

## 6. Danh sách MIME type mặc định

Nếu không cấu hình env riêng, service cho phép:

- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `text/plain`
- `image/png`
- `image/jpeg`

## 7. Gợi ý tích hợp với hệ thống hiện tại

Kiến trúc hiện tại đã dùng Rust V2 làm backend runtime chính:

```text
apps/web -> rust-doc-service (/auth/*, /inspect, /inspections, /v2/*)
```

Lý do:

- frontend đi thẳng vào Rust V2
- Rust dùng lại cùng JWT secret và cùng SQLite hiện tại
- `packages/data` chỉ còn giữ Prisma schema, seed và dữ liệu SQLite dùng chung

## 8. Auth V2 API

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/profile`
- `PUT /auth/change-password`

Các endpoint này dùng cùng `JWT_SECRET` của project để frontend giữ nguyên cơ chế Bearer token.

## 9. Documents V2 API

Nhóm endpoint chính hiện tại cho migration:

- `GET /v2/documents`
- `GET /v2/documents/my`
- `POST /v2/documents`
- `GET /v2/documents/:id`
- `PUT /v2/documents/:id`
- `DELETE /v2/documents/:id`
- `GET /v2/documents/:id/download`

## 10. Folders V2 API

- `GET /v2/folders`
- `GET /v2/folders/tree`
- `GET /v2/folders/:id`
- `GET /v2/folders/:id/breadcrumbs`
- `GET /v2/folders/:id/children`
- `POST /v2/folders`
- `PUT /v2/folders/:id`
- `DELETE /v2/folders/:id`

## 11. Inspect API

### `POST /inspect`

Mục đích:

- nhận file từ client
- inspect trực tiếp trong Rust
- trả kết quả inspect + persisted history

Ví dụ request:

```bash
curl -X POST http://localhost:4001/inspect \
  -H "Authorization: Bearer <token>" \
  -F "file=@./README.md;type=text/plain"
```

### `GET /inspections?limit=5`

Mục đích:

- lấy lịch sử inspect trực tiếp từ Rust V2

Ví dụ request:

```bash
curl "http://localhost:4001/inspections?limit=5" \
  -H "Authorization: Bearer <token>"
```

### `GET /inspections/:id`

Mục đích:

- lấy chi tiết một inspection record trực tiếp từ Rust V2

Ví dụ request:

```bash
curl "http://localhost:4001/inspections/<inspection-id>" \
  -H "Authorization: Bearer <token>"
```

Luồng hoàn chỉnh hiện tại:

```text
apps/web -> rust-doc-service (/inspect, /inspections, /v2/documents, /v2/folders) -> SQLite (`packages/data/prisma/dev.db`)
```
