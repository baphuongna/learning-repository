# Câu Hỏi Thường Gặp (FAQ)

Tài liệu này trả lời các câu hỏi thường gặp khi làm việc với project.

---

## Mục Lục

1. [Câu hỏi về Project](#1-câu-hỏi-về-project)
2. [Câu hỏi về Setup](#2-câu-hỏi-về-setup)
3. [Câu hỏi về Backend](#3-câu-hỏi-về-backend)
4. [Câu hỏi về Frontend](#4-câu-hỏi-về-frontend)
5. [Câu hỏi về Database](#5-câu-hỏi-về-database)
6. [Câu hỏi về Errors](#6-câu-hỏi-về-errors)
7. [Câu hỏi về Best Practices](#7-câu-hỏi-về-best-practices)

---

## 1. Câu hỏi về Project

### Q: Project này làm gì?

**A:** Kho Học Liệu Số là một hệ thống quản lý tài liệu học tập với các tính năng:
- Quản lý tài liệu (upload, download, CRUD)
- Tìm kiếm tài liệu theo metadata
- Phân quyền người dùng (Admin/User)
- Lưu trữ metadata theo chuẩn Dublin Core

### Q: Tại sao dùng Monorepo?

**A:** Monorepo có nhiều lợi ích:
- **Shared code**: Dễ dàng chia sẻ types, utilities giữa frontend và backend
- **Consistent**: Cùng version của dependencies
- **Single PR**: Thay đổi cả frontend và backend trong 1 PR
- **Simplified CI/CD**: Build và deploy từ 1 repo

### Q: Tại sao dùng pnpm thay npm?

**A:** pnpm có ưu điểm:
- **Nhanh hơn**: Efficient disk usage với symlinks
- **Strict**: Tránh phantom dependencies
- **Monorepo support**: Built-in workspace support
- **Deterministic**: Lockfile chính xác hơn

### Q: Tại sao dùng SQLite trong development?

**A:**
- Không cần cài đặt database server
- Dễ setup và reset (chỉ xóa file .db)
- Đủ cho development và testing
- Dễ dàng chuyển sang PostgreSQL khi production

---

## 2. Câu hỏi về Setup

### Q: Tôi cần cài đặt gì trước khi bắt đầu?

**A:**
1. **Node.js** >= 18.0.0
2. **pnpm** >= 9.0.0 (`npm install -g pnpm`)
3. **Git**
4. **VS Code** (khuyến nghị)

### Q: Lỗi `pnpm: command not found`?

**A:**
```bash
# Cài pnpm globally
npm install -g pnpm

# Hoặc dùng corepack (Node.js 16.9+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Q: Lỗi `Permission denied` khi chạy script?

**A:**
```bash
# Linux/macOS
sudo chown -R $(whoami) node_modules

# Hoặc chạy với quyền admin (Windows)
# Mở terminal với "Run as administrator"
```

### Q: Làm sao reset toàn bộ project?

**A:**
```bash
# 1. Xóa node_modules và lockfile
rm -rf node_modules pnpm-lock.yaml apps/api/node_modules apps/web/node_modules

# 2. Xóa database
rm -f apps/api/prisma/dev.db

# 3. Cài đặt lại
pnpm install

# 4. Generate Prisma và tạo database
pnpm db:generate
pnpm db:push

# 5. (Optional) Seed data
pnpm --filter api db:seed
```

---

## 3. Câu hỏi về Backend

### Q: NestJS module là gì?

**A:** Module là cách tổ chức code trong NestJS. Mỗi module:
- Encapsulates một feature liên quan
- Có thể import/export providers
- Giúp code dễ maintain và test

```typescript
@Module({
  imports: [PrismaModule],        // Import modules khác
  controllers: [UsersController], // Đăng ký controllers
  providers: [UsersService],      // Đăng ký services
  exports: [UsersService]         // Export để module khác dùng
})
export class UsersModule {}
```

### Q: Dependency Injection trong NestJS hoạt động như thế nào?

**A:** NestJS tự động inject dependencies vào class thông qua constructor:

```typescript
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,  // NestJS tự động inject
    private config: ConfigService
  ) {}

  // Sử dụng this.prisma, this.config
}
```

### Q: @Public() decorator để làm gì?

**A:** Đánh dấu endpoint không cần authentication:

```typescript
// auth.controller.ts
@Public()  // Không cần token
@Post('login')
login() {}

// documents.controller.ts
// Không có @Public() - cần token
@Get()
findAll() {}
```

### Q: Làm sao thêm API endpoint mới?

**A:**
1. Thêm method trong controller:
```typescript
@Get('featured')
findFeatured() {
  return this.documentsService.findFeatured();
}
```

2. Thêm method trong service:
```typescript
async findFeatured() {
  return this.prisma.document.findMany({
    where: { isPublic: true, status: 'ACTIVE' },
    take: 5
  });
}
```

### Q: Làm sao validation hoạt động?

**A:** NestJS sử dụng `class-validator` với DTOs:

```typescript
export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

Khi request body không thỏa mãn, tự động trả về 400 error với message chi tiết.

---

## 4. Câu hỏi về Frontend

### Q: Server Component vs Client Component?

**A:**

| Server Component | Client Component |
|------------------|------------------|
| Render trên server | Render trên browser |
| Có thể async/await | Cần `'use client'` |
| Không dùng useState, useEffect | Dùng được hooks |
| Tốt cho SEO, initial load | Tốt cho interactivity |

```tsx
// Server Component (default)
async function Page() {
  const data = await fetchData(); // OK
  return <div>{data}</div>;
}

// Client Component
'use client';
function Counter() {
  const [count, setCount] = useState(0); // OK
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Q: Khi nào dùng 'use client'?

**A:** Khi component cần:
- useState, useEffect, useReducer, useContext
- Event handlers (onClick, onChange, ...)
- Browser APIs (localStorage, window, ...)
- Custom hooks sử dụng state

### Q: Route groups là gì? (ví dụ `(auth)`)

**A:** Route groups giúp tổ chức routes mà không ảnh hưởng đến URL:
- `(auth)/login/page.tsx` → `/login` (không phải `/auth/login`)
- `(dashboard)/documents/page.tsx` → `/documents`

Dùng để:
- Share layout cho nhóm routes
- Tổ chức code tốt hơn

### Q: Làm sao gọi API từ Frontend?

**A:** Sử dụng axios client trong `lib/api.ts`:

```typescript
import api from '@/lib/api';

// GET
const { data } = await api.get('/documents');

// POST
const response = await api.post('/documents', { title: 'New Doc' });

// PUT
await api.put('/documents/123', { title: 'Updated' });

// DELETE
await api.delete('/documents/123');
```

Token tự động được thêm vào header bởi interceptor.

### Q: Làm sao thêm page mới?

**A:**
1. Tạo file trong thư mục app:
```
app/
└── about/
    └── page.tsx  → /about
```

2. Nội dung page.tsx:
```tsx
export default function AboutPage() {
  return <div>About us</div>;
}
```

---

## 5. Câu hỏi về Database

### Q: Prisma ORM là gì?

**A:** Prisma là tool giúp:
- Định nghĩa schema trong file `.prisma`
- Tự động generate TypeScript types
- Query database với API dễ dùng
- Visualize data với Prisma Studio

### Q: Làm sao thêm field mới vào table?

**A:**
1. Update `schema.prisma`:
```prisma
model Document {
  // ... existing fields
  category String? // New field
}
```

2. Push lên database:
```bash
pnpm db:push
```

3. Generate client:
```bash
pnpm db:generate
```

### Q: Làm sao xem data trong database?

**A:**
```bash
# Mở Prisma Studio (GUI)
pnpm db:studio

# Truy cập http://localhost:5555
```

### Q: Soft delete là gì?

**A:** Thay vì xóa record khỏi database, đánh dấu là "deleted":

```typescript
// Không xóa thật
await prisma.document.delete({ where: { id } });

// Soft delete - chỉ update status
await prisma.document.update({
  where: { id },
  data: { status: 'DELETED' }
});

// Query chỉ lấy ACTIVE
await prisma.document.findMany({
  where: { status: 'ACTIVE' }
});
```

Lợi ích: Có thể restore, giữ history.

---

## 6. Câu hỏi về Errors

### Q: Lỗi `Cannot find module '@prisma/client'`

**A:**
```bash
# Vào thư mục api
cd apps/api

# Cài lại Prisma
pnpm add @prisma/client

# Generate client
pnpm db:generate

# Quay về root
cd ../..
```

### Q: Lỗi `Port 3000 already in use`

**A:**

Windows:
```bash
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay PID)
taskkill /PID <PID> /F
```

Linux/macOS:
```bash
lsof -ti:3000 | xargs kill -9
```

Hoặc đổi port:
```env
# apps/api/.env
PORT=3002

# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

### Q: Lỗi CORS

**A:**
Kiểm tra cấu hình CORS trong backend:

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
});
```

### Q: Lỗi `Database is locked` (SQLite)

**A:**
SQLite không handle tốt nhiều concurrent connections.

Giải pháp:
1. Đóng Prisma Studio nếu đang mở
2. Restart server
3. Nếu vẫn lỗi, reset database:
```bash
rm apps/api/prisma/dev.db
pnpm db:push
```

### Q: Lỗi `JWT expired`

**A:** Token đã hết hạn. Giải pháp:
1. Login lại để lấy token mới
2. Hoặc tăng thời gian expire trong `.env`:
```env
JWT_EXPIRES_IN="30d"  # Tăng từ 7d lên 30d
```

### Q: Lỗi `401 Unauthorized`

**A:**
Nguyên nhân có thể:
1. Không có token trong header
2. Token không hợp lệ
3. Token đã expire

Kiểm tra:
```typescript
// Trong browser console
localStorage.getItem('token');

// Có giá trị? Nếu không, login lại
```

---

## 7. Câu hỏi về Best Practices

### Q: Nên đặt code ở đâu trong NestJS?

**A:**
```
src/
├── modules/           # Feature modules
│   ├── auth/         # Auth feature
│   │   ├── dto/      # Data Transfer Objects
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── documents/    # Document feature
│
├── common/           # Shared code
│   ├── decorators/   # Custom decorators
│   ├── guards/       # Auth guards
│   ├── filters/      # Exception filters
│   └── services/     # PrismaService
│
└── config/           # Configuration
```

### Q: Nên đặt components ở đâu trong Next.js?

**A:**
```
apps/web/
├── app/              # Pages và layouts
│   ├── (auth)/
│   └── (dashboard)/
│
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── documents/    # Document-related components
│   └── layout/       # Header, Sidebar, etc.
│
├── lib/
│   ├── api.ts        # API client
│   └── utils.ts      # Utilities
│
├── hooks/            # Custom hooks
├── stores/           # Zustand stores
└── types/            # TypeScript types
```

### Q: Khi nào tách component?

**A:** Tách component khi:
1. Component > 100 dòng
2. Logic phức tạp, có thể test riêng
3. Được dùng ở nhiều nơi
4. Có state riêng biệt

### Q: Làm sao debug API?

**A:**
1. **Swagger UI**: http://localhost:3001/api/docs
2. **Thunder Client / Postman**: Test endpoints
3. **Browser DevTools**: Network tab
4. **Console logs**:
```typescript
console.log('Request data:', data);
console.log('User:', user);
```

### Q: Làm sao debug Frontend?

**A:**
1. **React DevTools**: Xem component tree, props, state
2. **Console.log**: Debug values
3. **debugger statement**: Pause execution
4. **Network tab**: Xem API requests

```tsx
function MyComponent({ data }) {
  console.log('Data:', data);  // Debug
  debugger;                      // Pause
  return <div>{data.title}</div>;
}
```

### Q: Commit message format?

**A:** Sử dụng Conventional Commits:

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code
refactor: restructure auth module
test: add unit tests for user service
chore: update dependencies
```

---

## Cần hỗ trợ thêm?

Nếu câu hỏi của bạn không có trong danh sách:

1. Tìm kiếm trên [Stack Overflow](https://stackoverflow.com/)
2. Đọc documentation của công nghệ tương ứng
3. Tạo issue trên GitHub repository
4. Hỏi trong team chat/channel
