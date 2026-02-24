# Hướng Dẫn Cài Đặt Chi Tiết

Tài liệu này hướng dẫn từng bước cài đặt và chạy project Kho Học Liệu Số.

---

## Mục Lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt công cụ cần thiết](#2-cài-đặt-công-cụ-cần-thiết)
3. [Clone và setup project](#3-clone-và-setup-project)
4. [Cấu hình môi trường](#4-cấu-hình-môi-trường)
5. [Khởi tạo database](#5-khởi-tạo-database)
6. [Chạy development server](#6-chạy-development-server)
7. [Kiểm tra hoạt động](#7-kiểm-tra-hoạt-động)
8. [Xử lý lỗi thường gặp](#8-xử-lỗi-thường-gặp)

---

## 1. Yêu cầu hệ thống

### 1.1. Hardware

| Yêu cầu | Tối thiểu | Khuyến nghị |
|---------|-----------|-------------|
| RAM | 4GB | 8GB+ |
| Storage | 5GB free | 10GB+ free |
| CPU | 2 cores | 4+ cores |

### 1.2. Software

| Phần mềm | Phiên bản | Kiểm tra |
|----------|-----------|----------|
| Node.js | >= 18.0.0 | `node --version` |
| pnpm | >= 9.0.0 | `pnpm --version` |
| Git | Latest | `git --version` |
| VS Code | Latest | - |
| Docker | Latest (optional) | `docker --version` |

---

## 2. Cài đặt công cụ cần thiết

### 2.1. Node.js

#### Windows
1. Truy cập [nodejs.org](https://nodejs.org/)
2. Download LTS version (>= 18.x)
3. Chạy installer, chọn tất cả default options
4. Mở terminal mới và kiểm tra:
   ```bash
   node --version
   # Output: v18.x.x hoặc cao hơn
   ```

#### macOS (với Homebrew)
```bash
brew install node@18
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2. pnpm

```bash
# Cài đặt pnpm globally
npm install -g pnpm

# Kiểm tra
pnpm --version
# Output: 9.x.x hoặc cao hơn
```

### 2.3. Git

#### Windows
1. Truy cập [git-scm.com](https://git-scm.com/)
2. Download và cài đặt
3. Kiểm tra:
   ```bash
   git --version
   ```

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt-get install git
```

### 2.4. VS Code Extensions

Cài đặt các extensions sau trong VS Code:

```
# Extensions cần cài
1. ES7+ React/Redux/React-Native snippets
2. TypeScript Importer
3. Prisma
4. Tailwind CSS IntelliSense
5. Auto Rename Tag
6. Bracket Pair Colorizer
7. GitLens
8. Thunder Client (hoặc dùng Postman)
```

### 2.5. Docker (Optional)

Docker cần thiết nếu bạn muốn chạy PostgreSQL, Redis, MinIO.

#### Windows
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Cài đặt và restart máy
3. Mở Docker Desktop và đợi start xong

#### macOS
```bash
brew install --cask docker
```

#### Linux
```bash
curl -fsSL https://get.docker.com | sh
```

---

## 3. Clone và setup project

### 3.1. Clone repository

```bash
# Clone project
git clone <repository-url> learning-repository

# Vào thư mục project
cd learning-repository
```

### 3.2. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies cho cả api và web
pnpm install
```

Lệnh này sẽ:
- Cài đặt dependencies cho root
- Cài đặt dependencies cho `apps/api`
- Cài đặt dependencies cho `apps/web`

---

## 4. Cấu hình môi trường

### 4.1. Backend (apps/api/.env)

```bash
# Copy template
cp apps/api/.env.example apps/api/.env
```

Nội dung file `.env`:
```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# SQLite (Development)
DATABASE_URL="file:./prisma/dev.db"

# PostgreSQL (Production - comment out SQLite when using)
# DATABASE_URL="postgresql://admin:password@localhost:5432/learning_repo"

# ===========================================
# JWT CONFIGURATION
# ===========================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# ===========================================
# APP CONFIGURATION
# ===========================================
PORT=3001
NODE_ENV=development

# ===========================================
# CORS CONFIGURATION
# ===========================================
CORS_ORIGINS="http://localhost:3000"

# ===========================================
# FILE STORAGE CONFIGURATION
# ===========================================
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
```

**Lưu ý quan trọng:**
- `JWT_SECRET`: Nên là string ngẫu nhiên dài >= 32 ký tự
- Không commit file `.env` vào git

### 4.2. Frontend (apps/web/.env)

```bash
# Copy template
cp apps/web/.env.example apps/web/.env
```

Nội dung file `.env`:
```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Lưu ý:**
- Biến môi trường Next.js phải bắt đầu với `NEXT_PUBLIC_` để accessible ở client

---

## 5. Khởi tạo database

### 5.1. Generate Prisma Client

```bash
# Generate Prisma client từ schema
pnpm db:generate
```

Output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### 5.2. Tạo database và tables

```bash
# Push schema lên database (tạo file dev.db)
pnpm db:push
```

Output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./prisma/dev.db"

Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client
```

### 5.3. (Optional) Seed dữ liệu mẫu

```bash
# Chạy seed script để tạo dữ liệu mẫu
pnpm --filter api db:seed
```

Dữ liệu mẫu bao gồm:
- 2 users: admin@example.com / user@example.com
- Password: password123
- Một số documents mẫu

### 5.4. (Optional) Mở Prisma Studio

```bash
# Mở GUI để xem và edit database
pnpm db:studio
```

Truy cập: http://localhost:5555

---

## 6. Chạy development server

### 6.1. Chạy cả API và Web cùng lúc

```bash
# Từ thư mục root
pnpm dev
```

Lệnh này sẽ chạy đồng thời:
- Backend API trên port **3001**
- Frontend Web trên port **3000**

### 6.2. Chạy riêng lẻ

```bash
# Terminal 1: Backend only
pnpm dev:api

# Terminal 2: Frontend only
pnpm dev:web
```

### 6.3. Output khi chạy thành công

**Backend:**
```
[Nest] 12345  - INFO [NestFactory] Starting Nest application...
[Nest] 12345  - INFO [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - INFO [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12345  - INFO [InstanceLoader] AuthModule dependencies initialized
[Nest] 12345  - INFO [InstanceLoader] DocumentsModule dependencies initialized
[Nest] 12345  - INFO [RoutesResolver] AuthController {/api/auth}
[Nest] 12345  - INFO [RouterExplorer] Mapped {/api/auth/register, POST} route
[Nest] 12345  - INFO [RouterExplorer] Mapped {/api/auth/login, POST} route
[Nest] 12345  - INFO Application is running on: http://localhost:3001/api
```

**Frontend:**
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.3s
```

---

## 7. Kiểm tra hoạt động

### 7.1. Kiểm tra Backend

#### Swagger UI
1. Mở browser: http://localhost:3001/api/docs
2. Bạn sẽ thấy API documentation

#### Test API với Thunder Client / Postman

**Đăng ký user mới:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Đăng nhập:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc-123",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

### 7.2. Kiểm tra Frontend

1. Mở browser: http://localhost:3000
2. Bạn sẽ được redirect đến trang login
3. Đăng nhập với user đã tạo
4. Truy cập được dashboard

### 7.3. Endpoints Summary

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Web application |
| Backend API | http://localhost:3001/api | REST API |
| Swagger Docs | http://localhost:3001/api/docs | API documentation |
| Prisma Studio | http://localhost:5555 | Database GUI |

---

## 8. Xử lý lỗi thường gặp

### 8.1. Lỗi: `pnpm: command not found`

**Nguyên nhân:** pnpm chưa được cài đặt

**Giải pháp:**
```bash
npm install -g pnpm
```

### 8.2. Lỗi: `Prisma Client could not be generated`

**Nguyên nhân:** Chưa generate Prisma client

**Giải pháp:**
```bash
pnpm db:generate
```

### 8.3. Lỗi: `EACCES: permission denied`

**Nguyên nhân:** Không có quyền ghi vào thư mục

**Giải pháp (Linux/macOS):**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### 8.4. Lỗi: `Port 3000/3001 already in use`

**Nguyên nhân:** Port đã được sử dụng bởi process khác

**Giải pháp:**

Windows:
```bash
# Tìm process sử dụng port
netstat -ano | findstr :3000

# Kill process (thay PID bằng process ID)
taskkill /PID <PID> /F
```

Linux/macOS:
```bash
# Tìm và kill process
lsof -ti:3000 | xargs kill -9
```

Hoặc đổi port trong `.env`:
```env
# apps/api/.env
PORT=3002

# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

### 8.5. Lỗi: `Cannot find module '@prisma/client'`

**Nguyên nhân:** Prisma client chưa được generate hoặc install

**Giải pháp:**
```bash
# Vào thư mục api
cd apps/api

# Cài đặt lại Prisma
pnpm add @prisma/client

# Generate client
pnpm db:generate

# Quay về root
cd ../..
```

### 8.6. Lỗi: Database locked (SQLite)

**Nguyên nhân:** Có nhiều connection đến SQLite cùng lúc

**Giải pháp:**
1. Đóng Prisma Studio nếu đang mở
2. Restart development server
3. Nếu vẫn lỗi, xóa file `dev.db` và chạy lại `pnpm db:push`

### 8.7. Lỗi: CORS error

**Nguyên nhân:** Frontend và Backend khác origin

**Giải pháp:**

Kiểm tra `apps/api/.env`:
```env
CORS_ORIGINS="http://localhost:3000"
```

### 8.8. Reset toàn bộ project

Nếu mọi thứ bị lỗi phức tạp:

```bash
# 1. Xóa node_modules
rm -rf node_modules apps/api/node_modules apps/web/node_modules

# 2. Xóa database
rm -f apps/api/prisma/dev.db

# 3. Cài đặt lại
pnpm install

# 4. Generate Prisma
pnpm db:generate

# 5. Tạo database mới
pnpm db:push

# 6. (Optional) Seed data
pnpm --filter api db:seed

# 7. Chạy lại
pnpm dev
```

---

## Tiếp theo

Sau khi setup thành công, hãy xem:

- [05-learning-path.md](./05-learning-path.md) - Lộ trình học tập chi tiết
