# Hướng Dẫn Bắt Đầu Với Project Kho Học Liệu Số

Tài liệu này là điểm khởi đầu cho người mới tìm hiểu về project.

---

## Giới Thiệu Nhanh

**Kho Học Liệu Số** là hệ thống quản lý tài liệu học tập với:

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | Next.js 14 + React 18 | 3000 |
| Backend | Rust (Axum) + sqlx | 4001 |
| Database | SQLite (dev) / PostgreSQL (prod) | - |

---

## Tài Liệu Hướng Dẫn Chi Tiết

| File | Nội dung |
|------|----------|
| [../README.md](../README.md) | Tổng quan setup, kiến trúc hiện tại và lệnh chính |
| [./rust-service/README.md](./rust-service/README.md) | Tổng quan Rust service và cách chạy |
| [./rust-service/API.md](./rust-service/API.md) | API hiện tại của backend Rust |
| [./rust-service/ARCHITECTURE.md](./rust-service/ARCHITECTURE.md) | Kiến trúc backend và luồng xử lý chính |

---

## Quick Start

Khuyến nghị môi trường:
- Node.js 18 hoặc 20 LTS
- pnpm 9
- Sau một lần `pnpm install` sạch, repo hiện đã verify pass với frontend lint/build và Rust build/test

### 1. Cài đặt

```bash
# Clone project
git clone <repository-url>
cd learning-repository

# Cài đặt dependencies
pnpm install

# Cấu hình môi trường
cp apps/web/.env.example apps/web/.env
```

### 2. Khởi tạo database trước

Đây là bước nên chạy trước khi mở app, chạy verify, hoặc debug API/frontend.

```bash
# Khởi tạo database
pnpm db:generate
pnpm db:push

# (Optional) Seed dữ liệu mẫu
pnpm --filter data db:seed
```

Nếu database dev bị lỗi và cần tạo lại:

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

### 3. Chạy development

```bash
# Chạy frontend
pnpm dev:web

# Chạy Rust backend runtime
pnpm dev:rust

# Nếu cần lưu log vào thư mục riêng
pnpm dev:web:log
pnpm dev:rust:log
```

Ghi chú:
- Frontend hiện có ESLint config tại `apps/web/.eslintrc.json`, nên `pnpm --filter web lint` chạy non-interactive.
- Nếu gặp lỗi Next.js tooling trên Node 24, ưu tiên chuyển sang Node 18 hoặc 20 LTS trước khi debug code ứng dụng.

### 4. Truy cập

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Rust V2 API | http://localhost:4001 |

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
- Rust backend basics
- Prisma ORM
- Tailwind CSS

Chi tiết thêm về runtime và cấu trúc repo tại [README.md](../README.md)

---

## Cấu Trúc Project

```
learning-repository/
├── apps/
│   └── web/          # Next.js Frontend
│       ├── app/      # Pages (App Router)
│       ├── components/
│       └── lib/
│
├── packages/
│   └── data/         # Shared Prisma schema + SQLite data
│
├── services/
│   └── rust-doc-service/
│
├── docs/             # Documentation
└── services/rust-doc-service/data/  # Runtime storage
```

Chi tiết runtime hiện tại tại [README.md](../README.md)

---

## Các Lệnh Thường Dùng

```bash
# Development
pnpm dev:web        # Chỉ Frontend
pnpm dev:rust       # Chỉ Rust backend
pnpm dev:web:log    # Frontend + log vào tmp/logs/
pnpm dev:rust:log   # Rust backend + log vào tmp/logs/

# Database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema lên DB
pnpm --filter data db:seed   # Seed dữ liệu mẫu
pnpm db:studio      # Mở Prisma Studio

# Verify frontend
pnpm --filter web lint
pnpm --filter web build

# Verify Rust backend
cargo build --manifest-path services/rust-doc-service/Cargo.toml
cargo test --manifest-path services/rust-doc-service/Cargo.toml
```

Baseline verify hiện tại:
- `pnpm --filter web lint` pass
- `pnpm --filter web build` pass
- `cargo build --manifest-path services/rust-doc-service/Cargo.toml` pass
- `cargo test --manifest-path services/rust-doc-service/Cargo.toml` pass

---

## Lộ Trình Học Tập

| Giai đoạn | Thời gian | Nội dung |
|-----------|-----------|----------|
| 1. Nền tảng | 3 tuần | JS ES6+, TypeScript, Git |
| 2. Frontend | 3 tuần | React, Next.js, Tailwind |
| 3. Backend | 4 tuần | Rust, Axum, sqlx, JWT |
| 4. Thực hành | 4 tuần | Đọc code, thêm features |

Nếu cần hiểu sâu luồng backend, xem [ARCHITECTURE.md](./rust-service/ARCHITECTURE.md)

---

## Gặp Vấn Đề?

1. Xem [README.md](../README.md) cho trạng thái setup hiện tại
2. Tìm kiếm trên Stack Overflow
3. Đọc documentation của công nghệ tương ứng
4. Tạo issue trên GitHub

---

## Tiếp Theo

1. Đọc [README.md](../README.md) để nắm kiến trúc V2 hiện tại
2. Thực hành theo phần Quick Start trong tài liệu này
3. Đọc [ARCHITECTURE.md](./rust-service/ARCHITECTURE.md) nếu muốn hiểu sâu backend
