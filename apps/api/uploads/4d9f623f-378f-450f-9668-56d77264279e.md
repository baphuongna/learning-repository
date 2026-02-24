# 📚 Kho Học Liệu Số - Learning Repository

Hệ thống quản lý tài liệu học tập được xây dựng với **NestJS** (Backend) và **Next.js** (Frontend).

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
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
│                    BACKEND (NestJS 10)                      │
│  - RESTful API                                              │
│  - JWT Authentication                                       │
│  - Prisma ORM                                               │
│  - Multer for file upload                                   │
│  - Swagger documentation                                    │
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

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Docker (optional - cho PostgreSQL/MinIO)

### Bước 1: Clone và cài đặt

```bash
# Vào thư mục project
cd learning-repository

# Cài đặt dependencies
pnpm install
```

### Bước 2: Cấu hình môi trường

```bash
# Copy file cấu hình cho API
cp apps/api/.env.example apps/api/.env

# Copy file cấu hình cho Web
cp apps/web/.env.example apps/web/.env
```

### Bước 3: Khởi tạo database

```bash
# Generate Prisma client
pnpm db:generate

# Tạo database và tables
pnpm db:push

# (Optional) Seed dữ liệu mẫu
pnpm --filter api db:seed
```

### Bước 4: Chạy development servers

```bash
# Chạy cả API và Web
pnpm dev

# Hoặc chạy riêng lẻ
pnpm dev:api   # Backend trên port 3001
pnpm dev:web   # Frontend trên port 3000
```

### Truy cập ứng dụng

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |

---

## 📁 Cấu trúc project

```
learning-repository/
├── apps/
│   ├── api/                              # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Database schema
│   │   │   ├── seed.ts                   # Dữ liệu mẫu
│   │   │   └── dev.db                    # SQLite database
│   │   ├── src/
│   │   │   ├── main.ts                   # Entry point
│   │   │   ├── app.module.ts             # Root module
│   │   │   ├── modules/
│   │   │   │   ├── auth/                 # Authentication module
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── register.dto.ts
│   │   │   │   ├── documents/            # Documents CRUD module
│   │   │   │   │   ├── documents.module.ts
│   │   │   │   │   ├── documents.controller.ts
│   │   │   │   │   ├── documents.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── create-document.dto.ts
│   │   │   │   └── upload/               # File upload module
│   │   │   │       ├── upload.module.ts
│   │   │   │       ├── upload.controller.ts
│   │   │   │       └── upload.service.ts
│   │   │   └── common/
│   │   │       ├── guards/               # Auth guards
│   │   │       │   └── jwt-auth.guard.ts
│   │   │       ├── decorators/           # Custom decorators
│   │   │       │   ├── current-user.decorator.ts
│   │   │       │   └── public.decorator.ts
│   │   │       ├── filters/              # Exception filters
│   │   │       │   └── http-exception.filter.ts
│   │   │       └── services/             # Shared services
│   │   │           ├── prisma.service.ts
│   │   │           └── prisma.module.ts
│   │   ├── .env                          # Environment variables
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                              # Next.js Frontend
│       ├── app/
│       │   ├── (auth)/                   # Auth pages group
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── register/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── (dashboard)/              # Dashboard pages group
│       │   │   ├── documents/
│       │   │   │   ├── page.tsx          # Document list
│       │   │   │   ├── upload/
│       │   │   │   │   └── page.tsx      # Upload form
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx      # Document detail
│       │   │   ├── page.tsx              # Dashboard home
│       │   │   └── layout.tsx
│       │   ├── globals.css               # Global styles
│       │   ├── layout.tsx                # Root layout
│       │   ├── page.tsx                  # Home redirect
│       │   └── providers.tsx             # Auth context provider
│       ├── components/
│       │   ├── ui/                       # shadcn/ui components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── input.tsx
│       │   │   ├── label.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── textarea.tsx
│       │   │   └── switch.tsx
│       │   ├── documents/                # Document components
│       │   │   ├── DocumentCard.tsx
│       │   │   ├── DocumentList.tsx
│       │   │   ├── DocumentUpload.tsx
│       │   │   └── DocumentDetail.tsx
│       │   └── layout/                   # Layout components
│       │       ├── Header.tsx
│       │       └── Sidebar.tsx
│       ├── lib/
│       │   ├── api.ts                    # API client
│       │   └── utils.ts                  # Utility functions
│       ├── hooks/                        # Custom hooks
│       ├── types/                        # TypeScript types
│       ├── .env                          # Environment variables
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── next.config.js
│
├── storage/                              # File storage
│   └── documents/
│
├── docker-compose.yml                    # Docker services
├── pnpm-workspace.yaml                   # pnpm workspace config
├── turbo.json                            # Turborepo config
├── package.json                          # Root package.json
└── README.md
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:3001/api
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
| GET | `/search?q={keyword}` | Tìm kiếm tài liệu | ✅ |

#### Upload

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/upload` | Upload file | ✅ |
| GET | `/upload/:filename` | Download file | ❌ |

### Chi tiết API

Xem đầy đủ tại Swagger UI: **http://localhost:3001/api/docs**

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

### Backend (apps/api/.env)

```env
# Database
DATABASE_URL="file:./dev.db"                    # SQLite
# DATABASE_URL="postgresql://user:pass@localhost:5432/db"  # PostgreSQL

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGINS="http://localhost:3000"

# Storage
UPLOAD_DIR="./uploads"
```

### Frontend (apps/web/.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📜 Scripts

### Root level

```bash
pnpm dev           # Chạy cả API và Web
pnpm build         # Build cả hai apps
pnpm lint          # Kiểm tra code style
pnpm test          # Chạy tests
```

### Backend (apps/api)

```bash
pnpm dev           # Chạy development server
pnpm build         # Build production
pnpm start         # Chạy production server
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
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
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
| Backend | NestJS 10, TypeScript |
| ORM | Prisma |
| Auth | JWT, Passport.js |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Storage | Local / MinIO |
| Cache | Redis (optional) |
| Docs | Swagger/OpenAPI |

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
