# 📚 Kho Học Liệu Số - Learning Repository

Hệ thống quản lý tài liệu học tập được xây dựng với **Rust/Axum** (Backend), **Next.js** (Frontend), và `packages/data` cho Prisma schema + SQLite data dùng chung.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-18%20or%2020%20LTS-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#-kiến-trúc)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc project](#-cấu-trúc-project)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Scripts](#-scripts)
- [Triển khai Production](#-triển-khai-production)

---

## ✨ Tính năng

### Quản lý người dùng
- [x] Đăng ký tài khoản mới
- [x] Đăng nhập với JWT
- [x] Phân quyền: Admin / User
- [x] Xem thông tin cá nhân

### Quản lý tài liệu
- [x] Upload tài liệu (đa định dạng)
- [x] Download tài liệu
- [x] Xem danh sách tài liệu
- [x] Xem chi tiết tài liệu
- [x] Cập nhật metadata
- [x] Xóa tài liệu (soft delete)

### Metadata (Dublin Core)
- [x] Tiêu đề (Title)
- [x] Mô tả (Description)
- [x] Tác giả (Author)
- [x] Môn học / Chủ đề (Subject)
- [x] Từ khóa (Keywords/Tags)
- [x] Ngôn ngữ (Language)

### Tìm kiếm
- [x] Tìm kiếm theo tiêu đề
- [x] Tìm kiếm theo mô tả
- [x] Tìm kiếm theo tác giả
- [x] Tìm kiếm theo chủ đề

### Phân quyền
- [x] Admin: Xem tất cả tài liệu
- [x] User: Xem tài liệu của mình + tài liệu công khai
- [x] Public/Private access

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                    │
│  - App Router với Server Components                         │
│  - Tailwind CSS + shadcn/ui components                      │
│  - React Hook Form + Zod validation                         │
│  - Axios cho API calls                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Rust Doc Service)                  │
│  - Axum HTTP server                                         │
│  - JWT Authentication                                       │
│  - sqlx + SQLite/PostgreSQL                                 │
│  - Local file storage                                       │
│  - Domain-oriented modules                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  - SQLite (development) / PostgreSQL (production)           │
│  - Local filesystem / MinIO (file storage)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt

### Yêu cầu hệ thống

- Node.js 18 hoặc 20 LTS
- pnpm >= 9.0.0
- Docker (optional - cho PostgreSQL/MinIO)

> Khuyến nghị: dùng Node.js 20 LTS cho `apps/web`. Thực tế môi trường Node 24 có thể làm `next lint` lỗi ở bước verify TypeScript/runtime của Next.js 14.1.

> Trạng thái hiện tại đã verify: sau khi cài lại dependencies bằng `pnpm install`, cả `pnpm --filter web lint` và `pnpm --filter web build` đều chạy thành công.

### Bước 1: Clone và cài đặt dependencies

```bash
# Vào thư mục project
cd learning-repository

# Cài đặt dependencies
pnpm install
```

### Bước 2: Cấu hình môi trường

```bash
# Copy file cấu hình cho Web
cp apps/web/.env.example apps/web/.env
```

### Bước 3: Khởi tạo database

Đây là bước nên làm đầu tiên sau khi cài dependencies và cấu hình môi trường, trước khi chạy app hoặc verify các bước khác.

```bash
# Generate Prisma client
pnpm db:generate

# Tạo database và tables
pnpm db:push

# (Optional) Seed dữ liệu mẫu
pnpm --filter data db:seed
```

Nếu database dev bị lỗi và cần tạo lại từ đầu:

```bash
# macOS / Linux / Git Bash
rm packages/data/prisma/dev.db
pnpm db:generate
pnpm db:push
pnpm --filter data db:seed
```

```powershell
# PowerShell
Remove-Item .\packages\data\prisma\dev.db -Force
pnpm db:generate
pnpm db:push
pnpm --filter data db:seed
```

### Bước 4: Chạy development servers

```bash
# Chạy frontend
pnpm dev:web

# Chạy backend runtime
pnpm dev:rust

# Chạy và lưu log vào tmp/logs/
pnpm dev:web:log
pnpm dev:rust:log
```

### Truy cập ứng dụng

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Rust V2 API | http://localhost:4001 |

---

## 📁 Cấu trúc project

```
learning-repository/
├── apps/
│   └── web/                              # Next.js frontend
│       ├── app/                          # App Router pages/layouts
│       ├── components/                   # Shared + feature components
│       ├── lib/                          # API clients, helpers, utils
│       ├── hooks/                        # Custom hooks
│       └── package.json
├── packages/
│   └── data/                             # Prisma schema + SQLite data package
│       ├── prisma/
│       │   ├── schema.prisma             # Database schema
│       │   ├── seed.ts                   # Seed dữ liệu mẫu
│       │   └── dev.db                    # SQLite database (dev)
│       └── package.json
├── services/
│   └── rust-doc-service/                 # Rust/Axum backend runtime
│       ├── src/
│       │   ├── core/                     # config, db, errors, repository
│       │   ├── domains/                  # auth, folders, news, inspection
│       │   ├── http/routes/              # Axum route handlers
│       │   ├── tests.rs                  # Crate tests
│       │   └── main.rs
│       ├── data/uploads/                 # Runtime upload storage
│       └── Cargo.toml
├── docs/
│   ├── GETTING_STARTED.md
│   └── rust-service/
├── tmp/logs/                             # Runtime logs from *:log scripts
├── scripts/                              # Utility scripts (logging, cleanup)
├── docker-compose.yml                    # Optional local services
├── pnpm-workspace.yaml                   # pnpm workspace config
├── turbo.json                            # Turborepo config
├── package.json                          # Root package.json
└── README.md
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:4001
```

### Authentication
Sử dụng JWT Bearer token trong header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/auth/login` | Đăng nhập | ❌ |
| GET | `/auth/me` | Lấy thông tin user hiện tại | ✅ |

#### Documents

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/documents` | Danh sách tài liệu | ✅ |
| GET | `/documents/my` | Tài liệu của tôi | ✅ |
| GET | `/documents/:id` | Chi tiết tài liệu | ✅ |
| POST | `/documents` | Tạo tài liệu mới | ✅ |
| PUT | `/documents/:id` | Cập nhật tài liệu | ✅ |
| DELETE | `/documents/:id` | Xóa tài liệu (soft) | ✅ |

#### Search

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/inspections?limit={n}` | Lịch sử inspect | ✅ |

#### Upload

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/upload` | Upload file | ✅ |
| GET | `/upload/:filename` | Download file | ❌ |

### Chi tiết API

Xem thêm trong `docs/rust-service/API.md`.

---

## 🗄️ Database Schema

### User (Người dùng)

| Field | Type | Mô tả |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Email (unique) |
| fullName | String | Họ và tên |
| passwordHash | String | Mật khẩu đã hash (bcrypt) |
| role | String | Vai trò: ADMIN, USER |
| avatarUrl | String | URL ảnh đại diện |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

### Document (Tài liệu)

| Field | Type | Mô tả |
|-------|------|-------|
| id | UUID | Primary key |
| userId | UUID | Foreign key → User |
| title | String | Tiêu đề |
| description | String | Mô tả |
| author | String | Tác giả |
| subject | String | Môn học / Chủ đề |
| keywords | String | Từ khóa (JSON array) |
| language | String | Ngôn ngữ (default: vi) |
| fileName | String | Tên file |
| filePath | String | Đường dẫn file |
| fileSize | Int | Kích thước (bytes) |
| mimeType | String | MIME type |
| status | String | Trạng thái: ACTIVE, ARCHIVED, DELETED |
| isPublic | Boolean | Công khai hoặc riêng tư |
| createdAt | DateTime | Ngày tạo |
| updatedAt | DateTime | Ngày cập nhật |

---

## ⚙️ Cấu hình môi trường

### Shared Prisma data (`packages/data/prisma/dev.db`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
```

### Frontend (apps/web/.env)

```env
NEXT_PUBLIC_RUST_V2_URL=http://localhost:4001
```

### Rust backend runtime

```env
RUST_DOC_SERVICE_HOST=127.0.0.1
RUST_DOC_SERVICE_PORT=4001
JWT_SECRET="your-super-secret-jwt-key"
```

---

## 📜 Scripts

### Root level

```bash
pnpm dev:web       # Chạy frontend
pnpm dev:web:log   # Chạy frontend và ghi log vào tmp/logs/
pnpm dev:rust      # Chạy Rust backend runtime
pnpm dev:rust:log  # Chạy backend và ghi log vào tmp/logs/
pnpm clean:tmp     # Dọn temp files / logs cũ
pnpm --filter web build
pnpm --filter web lint
cargo test --manifest-path services/rust-doc-service/Cargo.toml
```

Frontend hiện có ESLint config tại `apps/web/.eslintrc.json`, nên `pnpm --filter web lint` chạy non-interactive.

### Kiểm tra nhanh theo phạm vi thay đổi

```bash
# Frontend
pnpm --filter web lint
pnpm --filter web build

# Rust backend
cargo build --manifest-path services/rust-doc-service/Cargo.toml
cargo test --manifest-path services/rust-doc-service/Cargo.toml

# Một Rust test cụ thể
cargo test --manifest-path services/rust-doc-service/Cargo.toml creates_user_and_reads_profile_count -- --exact
```

Lưu ý:
- Frontend hiện chưa có `vitest`, `jest`, hoặc `playwright` config chính thức trong repo.
- Nếu `pnpm --filter web lint` lỗi trên Node 24, hãy đổi sang Node 18 hoặc 20 LTS trước khi kết luận lỗi thuộc code ứng dụng.
- Ở trạng thái workspace hiện tại, frontend đã verify pass với `pnpm --filter web lint` và `pnpm --filter web build`.

### Shared data package (`packages/data`)

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema lên database
pnpm db:migrate    # Tạo migration
pnpm db:studio     # Mở Prisma Studio
pnpm db:seed       # Seed dữ liệu mẫu
```

### Frontend (apps/web)

```bash
pnpm dev           # Chạy development server
pnpm build         # Build production
pnpm start         # Chạy production server
pnpm lint          # Kiểm tra code style
```

---

## 🚢 Triển khai Production

### 1. Sử dụng Docker

```bash
# Khởi động PostgreSQL, Redis, MinIO
docker-compose up -d postgres redis minio

# Cập nhật .env với DATABASE_URL PostgreSQL
# Chạy migrations
pnpm db:migrate

# Build và chạy
pnpm build
pnpm start
```

### 2. Biến môi trường Production

```env
# Backend
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-random-string-at-least-32-chars"

# Frontend
NEXT_PUBLIC_RUST_V2_URL="https://api.yourdomain.com"
```

### 3. Khuyến nghị

- Sử dụng HTTPS
- Cấu hình CORS cho domain production
- Sử dụng CDN cho static files
- Setup monitoring và logging
- Backup database định kỳ

---

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Forms | React Hook Form, Zod |
| Backend | Rust, Axum, sqlx |
| ORM | Prisma |
| Auth | JWT |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Storage | Local / MinIO |
| Cache | Redis (optional) |
| Docs | Markdown docs |

---

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👥 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue tại repository hoặc liên hệ team phát triển.
