# Rust Doc Service

Tài liệu này hướng dẫn trạng thái hiện tại của `rust-doc-service` như backend runtime chính của hệ thống, dùng chung SQLite và Prisma schema hiện có của project.

`packages/data` hiện giữ vai trò package dữ liệu dùng cho `prisma` và file SQLite chia sẻ, không còn là backend runtime của ứng dụng.

## 1. Mục tiêu

Service mới nằm ở `services/rust-doc-service` và hiện có 3 nhóm endpoint chính:

- `GET /health`: kiểm tra service có chạy hay không.
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/change-password`: auth V2 chạy trực tiếp trên Rust.
- `POST /upload`, `GET /upload/:filename`: upload/media V2 chạy trực tiếp trên Rust.
- `POST /inspect`, `GET /inspections`, `GET /inspections/:id`: flow inspect bằng Rust.
- `GET/POST/PUT/DELETE /v2/documents*`: documents V2 chạy trực tiếp trên Rust.
- `GET/POST/PUT/DELETE /v2/folders*`: folders V2 chạy trực tiếp trên Rust.
- `GET/POST/PUT/DELETE /news*` và `/news-categories*`: news/categories V2 chạy trực tiếp trên Rust.

`apps/web` cũng đã có UI dashboard để đi hết flow này tại route `/rust-docs`.

Mục tiêu hiện tại của service:

- học cách tổ chức một service Rust độc lập
- học `axum`, `tokio`, `serde`, `tracing`
- học cách xử lý lỗi theo kiểu Rust
- học cách validate file size và MIME type
- học cách tính hash `sha256`
- học cách kết nối SQLite bằng `sqlx`
- học migration và connection pool cơ bản
- gom toàn bộ runtime backend về Rust V2 nhưng vẫn tái sử dụng schema và dữ liệu hiện có

## 2. Vì sao chọn service này để học Rust

So với auth hoặc full CRUD documents, service inspect file có phạm vi nhỏ hơn nhưng vẫn đủ thực tế:

- không làm thay đổi luồng đăng nhập hoặc phân quyền hiện tại
- dễ test bằng `curl` hoặc Postman
- thể hiện rõ thế mạnh của Rust trong xử lý file
- có thể mở rộng sau này thành parse PDF, extract text, thumbnail, checksum service

## 3. Cấu trúc thư mục

```text
services/rust-doc-service/
├── Cargo.toml
├── migrations/
│   └── 0001_create_inspection_history.sql
├── data/
│   └── uploads/
└── src/
    ├── core/
    │   ├── app_state.rs
    │   ├── config.rs
    │   ├── database.rs
    │   ├── error.rs
    │   ├── models.rs
    │   ├── repository.rs
    │   └── storage.rs
    ├── domains/
    │   ├── auth/
    │   │   ├── models.rs
    │   │   └── service.rs
    │   ├── documents/
    │   │   └── models.rs
    │   ├── folders/
    │   │   └── models.rs
    │   ├── inspection/
    │   │   └── service.rs
    │   └── news/
    │       └── models.rs
    └── http/
        └── routes/
            ├── auth.rs
            ├── documents.rs
            ├── folders.rs
            ├── health.rs
            ├── inspect.rs
            ├── inspections.rs
            ├── mod.rs
            ├── news.rs
            └── upload.rs
    └── main.rs
```

Giải thích nhanh:

- `src/core/*`: phần dùng chung của service như config, DB, error, storage.
- `src/domains/inspection/service.rs`: business logic inspect file.
- `src/domains/*`: model/service theo từng nghiệp vụ auth, documents, folders, news.
- `src/http/routes/*`: HTTP handlers và router theo từng endpoint.
- `data/uploads/`: nơi lưu file upload runtime của Rust service.

## 4. Command cơ bản

Chạy từ `services/rust-doc-service`:

```bash
cargo run
cargo build
cargo test
```

Hoặc từ root repo:

```bash
cargo run --manifest-path services/rust-doc-service/Cargo.toml
cargo build --manifest-path services/rust-doc-service/Cargo.toml
cargo test --manifest-path services/rust-doc-service/Cargo.toml
```

## 5. Environment variables

Service dùng default an toàn cho local nếu bạn chưa khai báo env:

```env
RUST_DOC_SERVICE_HOST=127.0.0.1
RUST_DOC_SERVICE_PORT=4001
RUST_DOC_SERVICE_MAX_FILE_SIZE_BYTES=10485760
RUST_DOC_SERVICE_DATABASE_URL="file:./dev.db"
RUST_DOC_SERVICE_DATABASE_MAX_CONNECTIONS=5
RUST_DOC_SERVICE_ALLOWED_CONTENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg
```

Giải thích:

- `HOST`: địa chỉ bind server.
- `PORT`: cổng service Rust, mặc định `4001`.
- `MAX_FILE_SIZE_BYTES`: giới hạn kích thước file.
- `DATABASE_URL`: chuỗi kết nối DB cho Rust service. Nếu không khai báo, service sẽ tự trỏ về `packages/data/prisma/dev.db` để dùng chung SQLite hiện tại của repo.
- `DATABASE_MAX_CONNECTIONS`: số connection tối đa trong pool.
- `ALLOWED_CONTENT_TYPES`: danh sách MIME type cho phép, phân tách bằng dấu phẩy.

## 6. Cách học từng bước

### Bước 1: chạy health check

```bash
cargo run --manifest-path services/rust-doc-service/Cargo.toml
```

Sau đó gọi:

```bash
curl http://127.0.0.1:4001/health
```

Bạn sẽ thấy response kiểu:

```json
{
  "status": "ok",
  "service": "rust-doc-service",
  "version": "0.1.0"
}
```

### Bước 2: inspect một file

```bash
curl -X POST http://127.0.0.1:4001/inspect \
  -F "file=@./README.md;type=text/plain"
```

Ví dụ response:

```json
{
  "data": {
    "filename": "README.md",
    "content_type": "text/plain",
    "extension": "md",
    "size_bytes": 1234,
    "sha256": "...",
    "supported_content_type": true
  },
  "persisted": {
    "id": "uuid-string",
    "filename": "README.md",
    "content_type": "text/plain",
    "extension": "md",
    "size_bytes": 1234,
    "sha256": "...",
    "supported_content_type": true,
    "created_at": "2026-03-06T15:00:00Z"
  }
}
```

Mỗi lần inspect sẽ được lưu vào bảng `inspection_history` trong cùng file DB SQLite dùng chung của project.

### Bước 3: xem lịch sử inspect

```bash
curl http://127.0.0.1:4001/inspections?limit=5
```

Ví dụ response:

```json
{
  "data": [
    {
      "id": "uuid-string",
      "filename": "README.md",
      "content_type": "text/plain",
      "extension": "md",
      "size_bytes": 1234,
      "sha256": "...",
      "supported_content_type": true,
      "created_at": "2026-03-06T15:00:00Z"
    }
  ]
}
```

### Bước 4: gọi documents V2 trực tiếp trên Rust

Ví dụ tạo document trực tiếp bằng Rust V2:

```bash
curl -X POST http://localhost:4001/v2/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@./README.md;type=text/plain" \
  -F "title=README" \
  -F "keywords=rust,v2"
```

### Bước 5: mở giao diện trên frontend

Sau khi chạy `apps/web` và `rust-doc-service`, bạn có thể mở:

```text
http://localhost:3000/rust-docs
```

Trang này cho phép:

- chọn file từ browser
- gọi trực tiếp Rust V2
- xem kết quả inspect mới nhất
- xem lịch sử inspect lấy từ `GET /inspections`
- mở trang chi tiết cho từng inspection qua route `/rust-docs/[id]`

Ngoài màn hình riêng `/rust-docs`, flow inspect cũng đã được gắn vào trang upload tài liệu tại `/documents/upload`. Người dùng có thể inspect file trước khi bấm upload để xem metadata, hash, và inspection record id.

Khi upload tài liệu sau bước inspect, frontend sẽ gửi `inspectionId` sang Rust V2 để document record có thể trace ngược về inspection record tương ứng.

### Bước 6: đọc code theo thứ tự đúng

Để học dễ hơn, hãy đọc theo thứ tự:

1. `services/rust-doc-service/src/main.rs`
2. `services/rust-doc-service/src/http/routes/health.rs`
3. `services/rust-doc-service/src/http/routes/inspect.rs`
4. `services/rust-doc-service/src/domains/inspection/service.rs`
5. `services/rust-doc-service/src/core/database.rs`
6. `services/rust-doc-service/src/core/repository.rs`
7. `services/rust-doc-service/src/core/error.rs`
8. `services/rust-doc-service/src/core/config.rs`
9. `services/rust-doc-service/src/http/routes/documents.rs`
10. `services/rust-doc-service/src/http/routes/folders.rs`
11. `apps/web/components/features/rust-docs/RustDocInspector.tsx`

## 7. Mở rộng tiếp theo

Sau khi hiểu V2, bạn có thể mở rộng theo thứ tự:

1. thêm trích metadata PDF/DOCX
2. thêm text preview
3. tích hợp sâu hơn với quy trình upload tài liệu
4. thêm Dockerfile và production config
5. mở rộng thêm các flow mới trực tiếp trên Rust V2
