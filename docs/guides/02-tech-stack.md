# Công Nghệ Sử Dụng Trong Project

Tài liệu này mô tả chi tiết các công nghệ được sử dụng trong project Kho Học Liệu Số.

---

## Mục Lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Backend Technologies](#2-backend-technologies)
3. [Frontend Technologies](#3-frontend-technologies)
4. [Database & Storage](#4-database--storage)
5. [DevOps & Tools](#5-devops--tools)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ App Router (Server Components + Client Components)           │    │
│  │ - Server: SEO, Initial Load                                  │    │
│  │ - Client: Interactivity, State                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ UI Layer                                                     │    │
│  │ - Tailwind CSS (Styling)                                     │    │
│  │ - shadcn/ui (Components)                                     │    │
│  │ - Lucide Icons                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ State Management                                             │    │
│  │ - Zustand (Global state)                                     │    │
│  │ - React Hook Form (Form state)                               │    │
│  │ - URL State (Search params)                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ REST API (Axios)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS 10)                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ API Layer                                                    │    │
│  │ - Controllers (Routes)                                       │    │
│  │ - DTOs (Data Validation)                                     │    │
│  │ - Guards (Authentication/Authorization)                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Business Layer                                               │    │
│  │ - Services (Business Logic)                                  │    │
│  │ - Modules (Organization)                                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Data Access Layer                                            │    │
│  │ - Prisma ORM                                                 │    │
│  │ - Prisma Service                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Cross-cutting Concerns                                       │    │
│  │ - JWT Authentication                                         │    │
│  │ - Swagger Documentation                                      │    │
│  │ - Exception Filters                                          │    │
│  │ - Logging                                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Prisma Client
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE & STORAGE                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   SQLite     │    │ PostgreSQL   │    │    MinIO     │          │
│  │ (Dev)        │    │ (Production) │    │  (Files)     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Technologies

### 2.1. NestJS 10

**NestJS** là một framework Node.js để xây dựng server-side applications hiệu quả và có thể mở rộng.

#### Tại sao chọn NestJS?
- **Modular architecture**: Dễ dàng tổ chức code theo modules
- **Dependency Injection**: Tự động inject dependencies
- **TypeScript native**: Hỗ trợ TypeScript từ đầu
- **Decorators**: Syntax gọn gàng, dễ đọc
- **Built-in validation**: Tích hợp class-validator

#### Cấu trúc một module NestJS
```typescript
// auth.module.ts
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
```

#### Dependency Injection
```typescript
@Injectable()
export class DocumentsService {
  // NestJS tự động inject PrismaService
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.document.findMany();
  }
}
```

### 2.2. Prisma ORM

**Prisma** là ORM (Object-Relational Mapping) hiện đại cho Node.js và TypeScript.

#### Tại sao chọn Prisma?
- **Type-safe**: Tự động generate TypeScript types
- **Intuitive API**: Dễ đọc, dễ viết hơn raw SQL
- **Migrations**: Quản lý database schema version
- **Prisma Studio**: GUI để xem và edit data

#### Prisma Schema
```prisma
// schema.prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  fullName     String
  passwordHash String
  role         String     @default("USER")
  documents    Document[]

  @@map("users")
}

model Document {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String?
  status      String   @default("ACTIVE")

  @@index([userId])
  @@map("documents")
}
```

#### Prisma Client Usage
```typescript
// Query examples
// SELECT * FROM documents WHERE userId = ? AND status = 'ACTIVE'
await prisma.document.findMany({
  where: {
    userId: 'user-id',
    status: 'ACTIVE'
  }
});

// INSERT INTO documents (title, userId) VALUES (?, ?)
await prisma.document.create({
  data: {
    title: 'New Document',
    userId: 'user-id'
  }
});

// UPDATE documents SET title = ? WHERE id = ?
await prisma.document.update({
  where: { id: 'doc-id' },
  data: { title: 'Updated Title' }
});

// Soft delete
await prisma.document.update({
  where: { id: 'doc-id' },
  data: { status: 'DELETED' }
});
```

### 2.3. JWT Authentication

**JWT (JSON Web Token)** là chuẩn mở để truyền thông tin an toàn giữa các bên.

#### Flow Authentication
```
1. Client gửi email/password đến /auth/login
2. Server verify credentials
3. Server tạo JWT token và trả về
4. Client lưu token (localStorage)
5. Client gửi token trong header mỗi request:
   Authorization: Bearer <token>
6. Server verify token và extract user info
```

#### Implementation trong NestJS
```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Method này được gọi khi token hợp lệ
  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    // 1. Tìm user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // 3. Generate token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user: { id: user.id, email: user.email, fullName: user.fullName } };
  }
}
```

### 2.4. Swagger (OpenAPI)

**Swagger** là công cụ để document REST APIs.

#### Setup
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Kho Học Liệu Số API')
  .setDescription('API documentation for Learning Repository')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### Document Endpoints
```typescript
// documents.controller.ts
@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài liệu' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  findAll() {
    return this.documentsService.findAll();
  }
}
```

Truy cập tại: `http://localhost:3001/api/docs`

---

## 3. Frontend Technologies

### 3.1. Next.js 14 (App Router)

**Next.js** là React framework với nhiều tính năng như SSR, SSG, API routes.

#### Tại sao chọn Next.js?
- **Server Components**: Render trên server, tốt cho SEO
- **File-based Routing**: Tạo route bằng cách tạo file
- **API Routes**: Tạo API endpoints trong cùng project
- **Image Optimization**: Tự động optimize images

#### App Router Structure
```
app/
├── (auth)/              # Route group - không ảnh hưởng URL
│   ├── login/
│   │   └── page.tsx     # /login
│   ├── register/
│   │   └── page.tsx     # /register
│   └── layout.tsx       # Layout cho auth pages
│
├── (dashboard)/         # Route group cho dashboard
│   ├── documents/
│   │   ├── page.tsx     # /documents
│   │   ├── upload/
│   │   │   └── page.tsx # /documents/upload
│   │   └── [id]/
│   │       └── page.tsx # /documents/:id (dynamic)
│   └── layout.tsx
│
├── layout.tsx           # Root layout
├── page.tsx             # Home page (/)
└── providers.tsx        # Context providers
```

#### Server vs Client Components
```tsx
// ✅ Server Component (default)
// app/documents/page.tsx
// Chạy trên server, có thể fetch data trực tiếp
async function DocumentsPage() {
  const documents = await fetchDocuments(); // Direct fetch

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

// ✅ Client Component
// components/DocumentCard.tsx
'use client'; // Required for client components

import { useState } from 'react';

function DocumentCard({ document }) {
  const [isExpanded, setIsExpanded] = useState(false); // useState

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}> {/* Event handler */}
      <h3>{document.title}</h3>
      {isExpanded && <p>{document.description}</p>}
    </div>
  );
}
```

### 3.2. Tailwind CSS

**Tailwind CSS** là utility-first CSS framework.

#### Tại sao chọn Tailwind?
- **Rapid development**: Không cần switch giữa HTML và CSS
- **Consistent**: Design system built-in
- **Small bundle**: Chỉ include classes đã dùng
- **Customizable**: Dễ dàng customize

#### Configuration
```typescript
// tailwind.config.ts
const config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
```

#### Common Patterns
```tsx
// Card component
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
  <p className="text-gray-600">{description}</p>
</div>

// Form input
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md
             focus:outline-none focus:ring-2 focus:ring-blue-500
             disabled:bg-gray-100 disabled:cursor-not-allowed"
  disabled={isLoading}
/>

// Button variants
<button className={cn(
  'px-4 py-2 rounded-md font-medium transition-colors',
  variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
  variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600'
)}>
  {children}
</button>
```

### 3.3. shadcn/ui Components

**shadcn/ui** là collection của các reusable components được build trên Radix UI.

#### Tại sao chọn shadcn/ui?
- **Accessible**: Radix UI primitives
- **Customizable**: Copy-paste components, không phải npm package
- **Beautiful**: Default styling tốt
- **TypeScript**: Full TypeScript support

#### Components sử dụng trong project
```tsx
// Button
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small</Button>

// Input
import { Input } from '@/components/ui/input';
<Input placeholder="Enter text..." />

// Dialog
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>

// Dropdown Menu
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 3.4. State Management

#### Zustand (Global State)
```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);

// Usage
function Component() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </div>
  );
}
```

#### React Hook Form (Form State)
```typescript
// Form state management
const { control, handleSubmit, formState } = useForm({
  defaultValues: { email: '', password: '' }
});

// With Controller for complex inputs
<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} value={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="math">Math</SelectItem>
        <SelectItem value="physics">Physics</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

### 3.5. Axios (HTTP Client)

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: RegisterDto) =>
    api.post('/auth/register', data),

  me: () => api.get('/auth/me')
};

export const documentsApi = {
  getAll: (params?: { search?: string }) =>
    api.get('/documents', { params }),

  getById: (id: string) =>
    api.get(`/documents/${id}`),

  create: (data: CreateDocumentDto) =>
    api.post('/documents', data),

  update: (id: string, data: UpdateDocumentDto) =>
    api.put(`/documents/${id}`, data),

  delete: (id: string) =>
    api.delete(`/documents/${id}`)
};
```

---

## 4. Database & Storage

### 4.1. SQLite (Development)

**SQLite** là file-based database, không cần server.

#### Ưu điểm cho development
- Không cần cài đặt database server
- File `dev.db` có thể commit vào git
- Dễ dàng reset database (xóa file)

#### Configuration
```env
# apps/api/.env
DATABASE_URL="file:./prisma/dev.db"
```

### 4.2. PostgreSQL (Production)

**PostgreSQL** là powerful open-source relational database.

#### Ưu điểm cho production
- Better performance với large data
- Full-text search capabilities
- JSON support
- Concurrent connections

#### Configuration
```env
# apps/api/.env (production)
DATABASE_URL="postgresql://user:password@localhost:5432/learning_repo"
```

#### Docker Compose
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: learning_repo
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4.3. File Storage

#### Local Storage (Development)
```typescript
// upload.service.ts
@Injectable()
export class UploadService {
  private uploadDir = './uploads';

  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}${extname(file.originalname)}`;
    const filePath = join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return fileName;
  }
}
```

#### MinIO (Production)
```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password
```

---

## 5. DevOps & Tools

### 5.1. pnpm (Package Manager)

**pnpm** là fast, disk space efficient package manager.

#### Tại sao chọn pnpm?
- **Fast**: Nhanh hơn npm
- **Efficient**: Content-addressable store
- **Strict**: Tránh phantom dependencies
- **Monorepo support**: Built-in workspace support

#### Commands
```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add axios

# Add dev dependency
pnpm add -D typescript

# Filter trong monorepo
pnpm --filter api add prisma
pnpm --filter web add zustand
```

### 5.2. Turborepo (Monorepo Build)

**Turborepo** là intelligent build system cho JavaScript/TypeScript monorepos.

#### Configuration
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

#### Commands
```bash
# Run dev on all apps
pnpm dev

# Run dev on specific app
pnpm dev:api
pnpm dev:web

# Build all
pnpm build

# Lint all
pnpm lint
```

### 5.3. Docker

**Docker** là platform để build, run containers.

#### Services
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: learning_repo
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password

volumes:
  postgres_data:
```

### 5.4. ESLint & TypeScript

#### ESLint Configuration
```json
// .eslintrc.json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "next/core-web-vitals"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Tiếp theo

Xem tiếp:

- [03-project-structure.md](./03-project-structure.md) - Cấu trúc chi tiết của project
