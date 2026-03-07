# Rust Doc Service V2 Walkthrough

Tài liệu này ghi lại chi tiết từng bước xây dựng trạng thái hoàn chỉnh hiện tại của `rust-doc-service`: inspect file, lưu lịch sử vào SQLite hiện tại của project bằng `sqlx`, và đọc lại lịch sử qua API.

Mục tiêu của tài liệu không chỉ là mô tả code đã thay đổi, mà còn giải thích rõ:

- đã làm gì
- vì sao cần làm như vậy
- syntax Rust đang dùng có ý nghĩa gì
- tư duy clean code đằng sau từng bước

---

## 1. Mục tiêu của phiên bản hiện tại

Phiên bản hiện tại của service có 2 khả năng chính ngoài health check:

1. mỗi lần gọi `POST /inspect`, kết quả được lưu xuống SQLite hiện tại của project
2. có thể gọi `GET /inspections` để xem lịch sử inspect gần nhất

Đây là bước rất quan trọng vì nó giúp bạn học thêm:

- kết nối SQLite trong Rust
- connection pool
- migration
- repository pattern mức cơ bản
- model mapping giữa SQL rows và Rust structs

---

## 2. Vì sao chọn `sqlx`

Trong Rust có nhiều cách làm việc với database như Diesel, SeaORM, hoặc SQLx.

Ở đây chọn `sqlx` vì:

- gần với SQL thuần nên dễ học
- ít “ma thuật” hơn ORM nặng
- hợp với microservice nhỏ
- rất tốt để hiểu rõ mapping giữa DB schema và struct Rust

Ta cố tình dùng `query_as::<_, T>(...)` + `FromRow` thay vì macro `query!` để giảm ràng buộc compile-time vào `DATABASE_URL` trong bước đầu học.

---

## 3. Bước 1 - thêm dependencies cho database

File sửa: `services/rust-doc-service/Cargo.toml`

Ta thêm:

- `sqlx`: giao tiếp SQLite
- `chrono`: map kiểu thời gian từ DB
- `uuid`: tạo id cho bản ghi lịch sử

Ví dụ:

```toml
sqlx = { version = "0.8", features = ["sqlite", "runtime-tokio-rustls", "chrono"] }
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["serde", "v4"] }
```

### Ý nghĩa syntax

- `features = [...]`: bật các tính năng cụ thể của crate
- `sqlite`: dùng SQLite driver
- `runtime-tokio-rustls`: dùng async runtime Tokio và TLS qua rustls
- `chrono`: cho phép map `TIMESTAMPTZ` sang `chrono::DateTime`
- `uuid`: vẫn dùng crate `uuid` để tạo chuỗi id cho inspection record

### Vì sao phải khai báo rõ features

Rust crate thường modular. Nếu không bật đúng feature, code compile sẽ lỗi dù crate đã được cài.

---

## 4. Bước 2 - thêm migration SQL

File mới: `services/rust-doc-service/migrations/0001_create_inspection_history.sql`

Ta tạo bảng `inspection_history`.

```sql
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
```

### Vì sao cần migration

Nếu schema database chỉ tồn tại “trong đầu” hoặc viết tay ngoài luồng, bạn sẽ rất khó:

- setup môi trường mới
- review thay đổi schema
- giữ code và DB đồng bộ

Migration giúp schema trở thành một phần của source code.

### Vì sao thêm index

Ta thêm index cho:

- `created_at DESC`: để lấy lịch sử mới nhất nhanh hơn
- `sha256`: để sau này có thể tra cứu file theo hash

---

## 5. Bước 3 - tạo module `database.rs`

File hiện tại: `services/rust-doc-service/src/core/database.rs`

File này có 2 trách nhiệm:

1. tạo `SqlitePool`
2. chạy migrations khi service khởi động

Code chính:

```rust
pub async fn create_pool(config: &AppConfig) -> Result<SqlitePool, sqlx::Error> {
    SqlitePoolOptions::new()
        .max_connections(config.database_max_connections)
        .acquire_timeout(Duration::from_secs(10))
        .connect(&config.database_url)
        .await
}
```

### Ý nghĩa syntax

- `SqlitePoolOptions::new()`: builder để cấu hình connection pool
- `.max_connections(...)`: số connection tối đa
- `.acquire_timeout(...)`: timeout khi đợi lấy connection
- `.connect(...)`: thực sự mở pool tới DB

### Vì sao dùng pool thay vì mở connection mỗi request

Nếu request nào cũng mở connection mới:

- chậm
- tốn tài nguyên
- dễ nghẽn khi concurrent cao

Connection pool là cách làm production chuẩn hơn.

Migration chạy bằng:

```rust
sqlx::migrate!("./migrations").run(pool).await
```

### Ý nghĩa syntax

- `sqlx::migrate!(...)` là macro nhúng migrations vào binary lúc compile
- `.run(pool)` thực thi các file SQL chưa chạy

Lợi ích:

- không cần chạy tay mỗi lần local boot service
- setup môi trường mới nhanh hơn

---

## 6. Bước 4 - mở rộng config cho database

File hiện tại: `services/rust-doc-service/src/core/config.rs`

Ta thêm vào `AppConfig`:

- `database_url`
- `database_max_connections`

Điểm đáng chú ý:

```rust
let database_url = env::var("RUST_DOC_SERVICE_DATABASE_URL")
    .or_else(|_| env::var("DATABASE_URL"))
    .unwrap_or_else(|_| {
        "file:./dev.db".to_string()
    });
```

### Vì sao làm fallback theo thứ tự này

1. ưu tiên env riêng cho Rust service
2. nếu chưa có thì tái sử dụng `DATABASE_URL` chung của repo
3. cuối cùng mới dùng default local

Đây là cách khá thực dụng để service mới dễ chạy thử trong monorepo.

### Ý nghĩa syntax `or_else`

`or_else` cho phép: nếu biểu thức trước lỗi thì thử biểu thức tiếp theo.

Tức là:

- lấy `RUST_DOC_SERVICE_DATABASE_URL` trước
- nếu không có thì thử `DATABASE_URL`

---

## 7. Bước 5 - đưa database pool vào `AppState`

File hiện tại: `services/rust-doc-service/src/core/app_state.rs`

Trước đây state chỉ có `config`.

Giờ ta thêm `db_pool`:

```rust
pub struct AppState {
    pub config: AppConfig,
    pub db_pool: SqlitePool,
}
```

### Vì sao thêm vào state

Trong Axum, handler cần lấy tài nguyên dùng chung thông qua `State<AppState>`.

Nếu không đưa pool vào state, bạn sẽ phải:

- tạo pool lại ở mỗi request, hoặc
- truyền pool thủ công rất rối

State là nơi hợp lý nhất để giữ shared dependency.

---

## 8. Bước 6 - tạo model `InspectionHistory`

File hiện tại: `services/rust-doc-service/src/core/models.rs`

Model:

```rust
#[derive(Debug, Serialize, FromRow)]
pub struct InspectionHistory {
    pub id: Uuid,
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub extension: Option<String>,
    pub size_bytes: i64,
    pub sha256: String,
    pub supported_content_type: bool,
    pub created_at: DateTime<Utc>,
}
```

### Ý nghĩa các derive

- `Debug`: hỗ trợ debug/log
- `Serialize`: trả JSON ra API
- `FromRow`: cho `sqlx` map row SQL sang struct Rust

### Vì sao `size_bytes` dùng `i64`

Trong SQLite, cột số nguyên kiểu `BIGINT` vẫn map tốt sang `i64` trong Rust.

Mặc dù ở logic inspect ta dùng `usize`, khi đi qua database nên map theo kiểu DB-friendly hơn.

---

## 9. Bước 7 - tạo `repository.rs`

File hiện tại: `services/rust-doc-service/src/core/repository.rs`

Mục tiêu: tách phần query SQL ra khỏi handler.

Ta có 2 hàm:

1. `insert_inspection_history(...)`
2. `list_recent_inspections(...)`

Ví dụ insert:

```rust
sqlx::query_as::<_, InspectionHistory>(
    r#"
    INSERT INTO inspection_history (...) VALUES (...) RETURNING ...
    "#,
)
```

### Vì sao dùng repository

Nếu viết SQL trực tiếp trong route handler:

- handler sẽ quá dài
- khó test từng lớp
- khó tái sử dụng query
- trộn HTTP concern với persistence concern

Repository giúp chia trách nhiệm rõ hơn.

### Ý nghĩa syntax `query_as::<_, InspectionHistory>`

- `_`: để Rust tự suy luận database backend cụ thể
- `InspectionHistory`: kiểu output mong muốn

Tức là: “hãy chạy query này và map row sang struct `InspectionHistory`”.

### Vì sao dùng `.bind(...)`

```rust
.bind(Uuid::new_v4())
.bind(inspection.filename.as_deref())
```

`bind` giúp truyền parameter an toàn vào SQL, tránh kiểu nối chuỗi nguy hiểm.

Nó tương đương prepared statement ở các stack khác.

---

## 10. Bước 8 - mở rộng error handling cho database

File hiện tại: `services/rust-doc-service/src/core/error.rs`

Ta thêm variant mới:

```rust
Database(sqlx::Error)
```

và thêm:

```rust
impl From<sqlx::Error> for AppError
```

### Vì sao quan trọng

Nhờ `From<sqlx::Error>`, mọi chỗ dùng `?` với query database có thể tự convert sang `AppError`.

Ví dụ trong route:

```rust
let persisted = insert_inspection_history(&state.db_pool, &inspection).await?;
```

Nếu DB lỗi, Rust tự đi theo luồng:

`sqlx::Error` -> `AppError::Database` -> `IntoResponse` -> HTTP 500 JSON

Đây là một pattern rất đẹp và rất “Rust”.

---

## 11. Bước 9 - sửa `main.rs` để khởi tạo DB

File hiện tại: `services/rust-doc-service/src/main.rs`

Ta thêm:

```rust
let db_pool = create_pool(&config).await?;
run_migrations(&db_pool).await?;
let app = create_router(AppState::new(config.clone(), db_pool));
```

### Thứ tự này có ý nghĩa gì

1. đọc config
2. tạo pool DB
3. chạy migration
4. tạo router với state đầy đủ
5. start HTTP server

Nếu migration fail, service fail ngay từ lúc boot. Đây là lựa chọn tốt vì:

- phát hiện lỗi schema sớm
- tránh service chạy nửa vời

---

## 12. Bước 10 - lưu lịch sử trong `POST /inspect`

File hiện tại: `services/rust-doc-service/src/http/routes/inspect.rs`

Sau khi inspect xong, ta gọi repository:

```rust
let persisted = insert_inspection_history(&state.db_pool, &inspection).await?;
```

và trả response gồm 2 phần:

- `data`: kết quả inspect logic
- `persisted`: bản ghi đã lưu trong DB

### Vì sao tách `data` và `persisted`

`data` biểu diễn kết quả xử lý nghiệp vụ hiện tại.

`persisted` biểu diễn bản ghi database sau khi insert thành công.

Tách vậy giúp bạn nhìn rõ 2 lớp:

- business result
- persistence result

Sau này nếu có thêm field do DB sinh ra như `created_at`, `id`, cách tách này rất có giá trị.

---

## 13. Bước 11 - thêm endpoint `GET /inspections`

File hiện tại: `services/rust-doc-service/src/http/routes/inspections.rs`

Endpoint này giúp xem lịch sử inspect mới nhất.

Nó nhận query param `limit`:

```rust
pub struct ListInspectionsQuery {
    pub limit: Option<i64>,
}
```

và xử lý:

```rust
let limit = query.limit.unwrap_or(10).clamp(1, 100);
```

### Ý nghĩa syntax

- `Option<i64>`: query param có thể có hoặc không
- `unwrap_or(10)`: nếu không truyền thì mặc định 10
- `clamp(1, 100)`: ép giá trị nằm trong khoảng an toàn

Đây là một pattern rất nên học vì nó giúp validation nhẹ nhàng mà không cần viết nhiều `if`.

---

## 14. Bước 12 - cập nhật env mẫu

File sửa: `.env.example`

Ta thêm các biến cho Rust service:

- `RUST_DOC_SERVICE_HOST`
- `RUST_DOC_SERVICE_PORT`
- `RUST_DOC_SERVICE_MAX_FILE_SIZE_BYTES`
- `RUST_DOC_SERVICE_DATABASE_URL`
- `RUST_DOC_SERVICE_DATABASE_MAX_CONNECTIONS`
- `RUST_DOC_SERVICE_ALLOWED_CONTENT_TYPES`

### Vì sao cập nhật `.env.example`

Vì đây là “hợp đồng cấu hình” của project.

Nếu code cần env mới mà tài liệu không phản ánh, người khác clone repo sẽ rất khó chạy.

---

## 15. Bước 13 - thêm test nhỏ cho logic hiện tại

File sửa: `services/rust-doc-service/src/inspection.rs`

Ta thêm test reject MIME type không hợp lệ.

### Vì sao chưa viết integration test DB ngay

Ở giai đoạn học này, mình ưu tiên:

- giữ test nhanh
- không phụ thuộc DB thật cho mọi test
- tập trung giúp bạn hiểu pure business logic trước

Khi sang bước tiếp theo, ta có thể thêm integration test cho repository hoặc endpoint.

---

## 16. Cấu trúc service hiện tại

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
    │   └── inspection/
    │       └── service.rs
    ├── http/
    │   └── routes/
    │       ├── health.rs
    │       ├── inspect.rs
    │       ├── inspections.rs
    │       └── mod.rs
    └── main.rs
```

Ở trạng thái hiện tại, service đã có shape khá giống một microservice thật.

---

## 17. Flow mới của request `POST /inspect`

```text
Client
  -> POST /inspect (multipart)
  -> route handler đọc file
  -> domains/inspection/service.rs validate + hash
  -> core/repository.rs insert vào SQLite
  -> trả JSON gồm data + persisted
```

Điểm học được ở đây là request bây giờ đi qua đủ 3 lớp:

- HTTP layer
- business layer
- persistence layer

---

## 18. API mới của V2

### `POST /inspect`

Ngoài `data`, response còn có `persisted` là record đã lưu.

### `GET /inspections?limit=10`

Trả danh sách lịch sử inspect gần nhất.

Ví dụ:

```bash
curl http://127.0.0.1:4001/inspections?limit=5
```

---

## 19. Tại sao V2 là bước học rất tốt

Sau bước này, bạn đã đi qua hầu hết các viên gạch nền của một Rust backend thực tế:

- Axum router
- extractors
- shared state
- custom error type
- config management
- SQL migrations
- SQLite pool
- repository pattern
- model mapping

Nói cách khác, từ đây bạn đã có nền đủ tốt để học tiếp các phần khó hơn như:

- auth giữa các service
- background jobs
- parse PDF thật
- queue hoặc event-driven processing

---

## 20. Các bài tập nên làm sau phần này

1. thêm trường `is_empty_file` hoặc `content_type_missing`
2. thêm `DELETE /inspections/:id`
3. thêm integration test cho repository với SQLite test database
4. thêm Dockerfile riêng cho `rust-doc-service`
5. tách tiếp docs walkthrough cho auth/documents/folders nếu muốn học sâu hơn

Bạn chưa cần làm ngay. Mục tiêu hiện tại là hiểu vững V2 trước.
