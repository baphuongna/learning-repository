# Hướng Dẫn Bắt Đầu Với Project Kho Học Liệu Số

Tài liệu này là điểm khởi đầu cho người mới tìm hiểu về project.

---

## Giới Thiệu Nhanh

**Kho Học Liệu Số** là hệ thống quản lý tài liệu học tập với:

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | Next.js 14 + React 18 | 3000 |
| Backend | NestJS 10 + Prisma | 3001 |
| Database | SQLite (dev) / PostgreSQL (prod) | - |

---

## Tài Liệu Hướng Dẫn Chi Tiết

### Cho người mới bắt đầu

| File | Nội dung |
|------|----------|
| [01-prerequisites.md](./guides/01-prerequisites.md) | Kiến thức cần có (JS, TS, React, NestJS) |
| [02-tech-stack.md](./guides/02-tech-stack.md) | Chi tiết công nghệ sử dụng |
| [03-project-structure.md](./guides/03-project-structure.md) | Cấu trúc project chi tiết |
| [04-setup-guide.md](./guides/04-setup-guide.md) | Hướng dẫn cài đặt từng bước |
| [05-learning-path.md](./guides/05-learning-path.md) | Lộ trình học tập 14 tuần |
| [06-resources.md](./guides/06-resources.md) | Tài nguyên học tập |
| [07-faq.md](./guides/07-faq.md) | Câu hỏi thường gặp |

---

## Quick Start

### 1. Cài đặt

```bash
# Clone project
git clone <repository-url>
cd learning-repository

# Cài đặt dependencies
pnpm install

# Cấu hình môi trường
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Khởi tạo database
pnpm db:generate
pnpm db:push
```

### 2. Chạy development

```bash
# Chạy cả API và Web
pnpm dev
```

### 3. Truy cập

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |

---

## Kiến Thức Cần Có

### Bắt buộc
- JavaScript ES6+ (variables, functions, async/await)
- TypeScript cơ bản (types, interfaces)
- HTML/CSS cơ bản
- Git

### Quan trọng
- React Hooks (useState, useEffect)
- REST API concepts
- Database basics (SQL)

### Khuyến nghị
- Next.js App Router
- NestJS framework
- Prisma ORM
- Tailwind CSS

Chi tiết tại [01-prerequisites.md](./guides/01-prerequisites.md)

---

## Cấu Trúc Project

```
learning-repository/
├── apps/
│   ├── api/          # NestJS Backend
│   │   ├── prisma/   # Database schema
│   │   └── src/
│   │       ├── modules/    # Auth, Documents, Upload
│   │       └── common/     # Guards, Decorators, Services
│   │
│   └── web/          # Next.js Frontend
│       ├── app/      # Pages (App Router)
│       ├── components/
│       └── lib/
│
├── docs/             # Documentation
└── storage/          # File storage
```

Chi tiết tại [03-project-structure.md](./guides/03-project-structure.md)

---

## Các Lệnh Thường Dùng

```bash
# Development
pnpm dev            # Chạy cả API và Web
pnpm dev:api        # Chỉ Backend
pnpm dev:web        # Chỉ Frontend

# Database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema lên DB
pnpm db:studio      # Mở Prisma Studio

# Build
pnpm build          # Build tất cả
pnpm lint           # Kiểm tra code style
```

---

## Lộ Trình Học Tập

| Giai đoạn | Thời gian | Nội dung |
|-----------|-----------|----------|
| 1. Nền tảng | 3 tuần | JS ES6+, TypeScript, Git |
| 2. Frontend | 3 tuần | React, Next.js, Tailwind |
| 3. Backend | 4 tuần | NestJS, Prisma, JWT |
| 4. Thực hành | 4 tuần | Đọc code, thêm features |

Chi tiết tại [05-learning-path.md](./guides/05-learning-path.md)

---

## Gặp Vấn Đề?

1. Xem [07-faq.md](./guides/07-faq.md) cho các lỗi thường gặp
2. Tìm kiếm trên Stack Overflow
3. Đọc documentation của công nghệ tương ứng
4. Tạo issue trên GitHub

---

## Tiếp Theo

1. Đọc [01-prerequisites.md](./guides/01-prerequisites.md) để biết kiến thức cần có
2. Thực hành theo [04-setup-guide.md](./guides/04-setup-guide.md)
3. Theo dõi [05-learning-path.md](./guides/05-learning-path.md) để học có hệ thống
