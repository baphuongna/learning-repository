# Rust Doc Service Architecture

Tài liệu này giải thích kiến trúc của `services/rust-doc-service` theo cách dễ học, tập trung vào câu hỏi: mỗi file có trách nhiệm gì và request đi qua hệ thống như thế nào.

## 1. Tư duy thiết kế

Mục tiêu của service này không phải là làm quá nhiều thứ ngay từ đầu. Thay vào đó, nó được chia nhỏ theo trách nhiệm:

- route chỉ nhận request và gọi business logic hoặc repository phù hợp
- business logic chỉ xử lý dữ liệu file
- repository chỉ lo query database
- config chỉ đọc environment variables
- error chỉ lo chuyện map lỗi nội bộ sang HTTP response
- state giữ dữ liệu dùng chung như config và database pool

Đây là cách tổ chức rất tốt để học Rust theo clean architecture mức cơ bản.

## 2. Luồng request

```text
HTTP Request
   |
   v
Axum Router
   |
   +--> /health       -> health handler -> JSON response
   |
   +--> /inspect      -> inspect handler
   |                      |
   |                      v
   |                Multipart extractor
   |                      |
   |                      v
   |               inspection::inspect_uploaded_file
   |                      |
   |                      v
   |               repository::insert_inspection_history
   |                      |
   |                      v
   |                  JSON response
   |
   +--> /inspections  -> inspections handler
                          |
                          v
                    repository::list_recent_inspections
                          |
                          v
                      JSON response
```

Trong kiến trúc toàn hệ thống hiện tại, `rust-doc-service` là backend runtime chính của hệ thống:

```text
apps/web
   |
   v
rust-doc-service
   |
   v
SQLite (`packages/data/prisma/dev.db`)
```

Lợi ích của cách này:

- frontend dùng trực tiếp Rust V2
- Rust có toàn quyền xử lý documents/folders/inspect trong cùng service
- không còn phụ thuộc backend Node runtime cũ
- vẫn giữ được dữ liệu cũ vì dùng chung SQLite hiện tại

Hiện tại frontend đã có màn hình thật cho flow này tại `apps/web/app/(dashboard)/rust-docs/page.tsx`, dùng component `apps/web/components/features/rust-docs/RustDocInspector.tsx`.

## 3. Trách nhiệm từng file

### `main.rs`

Đây là entry point của service.

Nhiệm vụ chính:

- load `.env` nếu có
- khởi tạo tracing/logging
- đọc config từ env
- tạo router
- bind TCP listener và start HTTP server

Điểm cần học:

- `#[tokio::main]` để chạy async runtime
- `axum::serve(...)` để chạy server
- khởi tạo tracing cho debug và observability

### `config.rs`

File này gom toàn bộ runtime config vào struct `AppConfig`.

Lợi ích:

- không rải `std::env::var` khắp codebase
- dễ test
- dễ mở rộng khi thêm database hoặc external service

Bạn nên chú ý các pattern:

- parse env với default fallback
- transform chuỗi CSV thành `HashSet<String>`
- đóng gói thành method `socket_address()`
- fallback từ env riêng sang `DATABASE_URL` chung của repo

### `database.rs`

File này chỉ lo 2 việc:

- tạo SQLite connection pool bằng `sqlx`
- chạy migrations khi service khởi động

Lợi ích của việc tách riêng file này:

- không làm `main.rs` quá dài
- gom toàn bộ logic khởi tạo database vào một chỗ
- dễ thay đổi pool settings về sau

### `app_state.rs`

Axum cho phép chia sẻ state cho handler.

Hiện tại state đã có:

- `config`
- `db_pool`

Sau này có thể thêm tiếp:

- HTTP client
- metrics registry
- cache client

### `routes/health.rs`

Endpoint đơn giản nhất để xác nhận service còn sống.

Mục đích học tập:

- hiểu một handler Axum tối thiểu trông như thế nào
- hiểu cách trả `Json<T>`

### `routes/inspect.rs`

Đây là handler chính của service.

Nhiệm vụ:

- đọc multipart request
- tìm field tên `file`
- lấy `filename`, `content_type`, `bytes`
- gọi business logic ở `inspection.rs`
- lưu kết quả inspect xuống SQLite qua `repository.rs`
- trả response JSON

Điểm cần học:

- `State(...)` để lấy shared state
- `Multipart` extractor
- `while let Some(field) = ...` để duyệt multipart fields
- handler chỉ orchestration, không ôm business logic

### `routes/inspections.rs`

Đây là handler mới của V2 để lấy lịch sử inspect.

Nhiệm vụ:

- nhận query param `limit`
- clamp giá trị trong khoảng an toàn
- gọi repository để query SQLite
- trả danh sách JSON

Điểm cần học:

- `Query<T>` extractor
- `Option<i64>` cho query params optional
- `unwrap_or(...)` và `clamp(...)`

### `inspection.rs`

Đây là business logic thuần.

Nó xử lý:

- validate file rỗng
- validate file size
- validate MIME type
- tính hash SHA-256
- trích extension từ filename

Điểm rất quan trọng khi học Rust:

- business logic thuần nên test dễ hơn route
- đây là chỗ tốt để học `Result<T, E>`
- struct input/output rõ ràng giúp code ít bug hơn

### `models.rs`

File này chứa các struct đại diện cho dữ liệu đọc từ database.

Hiện tại có `InspectionHistory` với `#[derive(FromRow)]` để `sqlx` map trực tiếp từ row sang struct.

### `repository.rs`

File này chứa tầng persistence.

Nhiệm vụ:

- insert bản ghi mới vào `inspection_history`
- query lịch sử inspect gần nhất

Điểm quan trọng:

- SQL không nằm trong route
- route chỉ gọi hàm repository
- architecture rõ hơn khi service lớn dần

### `error.rs`

File này chuẩn hóa lỗi nội bộ thành HTTP response nhất quán.

Thay vì `panic!` hoặc trả string rời rạc, service dùng enum `AppError`.

Lợi ích:

- dễ kiểm soát status code
- response đồng nhất cho frontend
- mở rộng lỗi mới dễ dàng
- hỗ trợ cả lỗi multipart và lỗi database

## 4. Quy ước response

### Thành công

```json
{
  "data": {
    "filename": "example.pdf",
    "content_type": "application/pdf",
    "extension": "pdf",
    "size_bytes": 1024,
    "sha256": "...",
    "supported_content_type": true
  },
  "persisted": {
    "id": "uuid",
    "created_at": "2026-03-06T15:00:00Z"
  }
}
```

### Lỗi

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Expected multipart field named `file`"
  }
}
```

Ưu điểm của format này là frontend xử lý dễ, log cũng dễ đọc.

## 5. Nguyên tắc clean code đang áp dụng

- một file có một trách nhiệm chính
- handler mỏng, logic dồn về module riêng
- query SQL tách sang repository riêng
- lỗi được mô hình hóa rõ ràng bằng enum
- tránh magic values bằng config từ env
- test business logic trước khi test integration phức tạp hơn

## 6. Hướng mở rộng kiến trúc

Khi service lớn hơn, bạn có thể phát triển tiếp theo hướng này:

```text
src/
├── domain/
├── application/
├── infrastructure/
├── routes/
└── main.rs
```

Nhưng ở giai đoạn học Rust đầu tiên, cấu trúc hiện tại là đủ tốt và dễ hiểu hơn.
