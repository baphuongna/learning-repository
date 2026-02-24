# Cấu Trúc Project Chi Tiết

Tài liệu này mô tả chi tiết cấu trúc thư mục và file trong project Kho Học Liệu Số.

---

## Mục Lục

1. [Cấu trúc root](#1-cấu-trúc-root)
2. [Backend (apps/api)](#2-backend-appsapi)
3. [Frontend (apps/web)](#3-frontend-appsweb)
4. [Common folders](#4-common-folders)
5. [File cấu hình quan trọng](#5-file-cấu-hình-quan-trọng)

---

## 1. Cấu trúc root

```
learning-repository/
├── apps/                      # Monorepo apps
│   ├── api/                   # Backend NestJS
│   └── web/                   # Frontend Next.js
│
├── docs/                      # Documentation
│   ├── guides/                # Hướng dẫn chi tiết
│   └── GETTING_STARTED.md     # Tổng quan
│
├── storage/                   # File storage
│   └── documents/             # Uploaded documents
│
├── docker-compose.yml         # Docker services config
├── pnpm-workspace.yaml        # pnpm monorepo config
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json
├── .gitignore                 # Git ignore rules
└── .env.example               # Environment template
```

---

## 2. Backend (apps/api)

### 2.1. Cấu trúc tổng quan

```
apps/api/
├── prisma/                    # Database
│   ├── schema.prisma          # DB schema
│   ├── seed.ts                # Seed data
│   └── dev.db                 # SQLite database
│
├── src/
│   ├── main.ts                # Entry point
│   ├── app.module.ts          # Root module
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── documents/         # Document management
│   │   └── upload/            # File upload
│   │
│   ├── common/                # Shared code
│   │   ├── guards/            # Auth guards
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   └── services/          # Shared services
│   │
│   └── config/                # Configuration
│
├── uploads/                   # Uploaded files
├── dist/                      # Compiled JS (build output)
│
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── nest-cli.json              # NestJS CLI config
└── jest.config.js             # Test config
```

### 2.2. Chi tiết modules

#### Module auth/
```
modules/auth/
├── auth.module.ts             # Module definition
├── auth.controller.ts         # API endpoints
├── auth.service.ts            # Business logic
├── strategies/
│   └── jwt.strategy.ts        # JWT passport strategy
└── dto/
    ├── register.dto.ts        # Register validation
    └── login.dto.ts           # Login validation
```

**auth.controller.ts** - Định nghĩa các API endpoints:
```typescript
@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) { ... }

  @Post('login')
  login(@Body() dto: LoginDto) { ... }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user) { ... }
}
```

#### Module documents/
```
modules/documents/
├── documents.module.ts        # Module definition
├── documents.controller.ts    # API endpoints
├── documents.service.ts       # Business logic
└── dto/
    ├── create-document.dto.ts
    └── update-document.dto.ts
```

**documents.controller.ts** - CRUD endpoints:
```typescript
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  @Get()
  findAll(@CurrentUser() user) { ... }

  @Get('my')
  findMyDocuments(@CurrentUser() user) { ... }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) { ... }

  @Post()
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user) { ... }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) { ... }

  @Delete(':id')
  remove(@Param('id') id: string) { ... }
}
```

#### Module upload/
```
modules/upload/
├── upload.module.ts           # Module definition
├── upload.controller.ts       # Upload endpoints
└── upload.service.ts          # File handling logic
```

### 2.3. Chi tiết common/

```
common/
├── guards/
│   └── jwt-auth.guard.ts      # JWT authentication guard
│
├── decorators/
│   ├── current-user.decorator.ts  # Extract user from request
│   └── public.decorator.ts        # Mark endpoint as public
│
├── filters/
│   └── http-exception.filter.ts   # Global exception handler
│
└── services/
    ├── prisma.service.ts      # Prisma client wrapper
    └── prisma.module.ts       # Prisma module
```

**prisma.service.ts** - Database connection:
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

**current-user.decorator.ts** - Extract user từ JWT:
```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JWT strategy
  }
);
```

**public.decorator.ts** - Mark endpoint không cần auth:
```typescript
export const Public = () => SetMetadata('isPublic', true);

// Usage
@Public()
@Post('login')
login() { ... }
```

### 2.4. Entry point (main.ts)

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Kho Học Liệu Số API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

### 2.5. Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  fullName     String
  passwordHash String     @map("password_hash")
  role         String     @default("USER")
  avatarUrl    String?    @map("avatar_url")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  documents    Document[]

  @@map("users")
}

model Document {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String
  description String?
  author      String?
  subject     String?
  keywords    String
  language    String   @default("vi")

  fileName    String   @map("file_name")
  filePath    String   @map("file_path")
  fileSize    Int?     @map("file_size")
  mimeType    String?  @map("mime_type")

  status      String   @default("ACTIVE")
  isPublic    Boolean  @default(false) @map("is_public")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@map("documents")
}
```

---

## 3. Frontend (apps/web)

### 3.1. Cấu trúc tổng quan

```
apps/web/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Auth route group
│   ├── (dashboard)/           # Dashboard route group
│   ├── api/                   # API routes (optional)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── providers.tsx          # Context providers
│   └── globals.css            # Global styles
│
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   ├── documents/             # Document components
│   └── layout/                # Layout components
│
├── lib/                       # Utilities
│   ├── api.ts                 # API client
│   ├── utils.ts               # Utility functions
│   └── validations.ts         # Zod schemas
│
├── hooks/                     # Custom hooks
│   └── use-auth.ts            # Auth hook
│
├── stores/                    # Zustand stores
│   └── auth-store.ts          # Auth state
│
├── types/                     # TypeScript types
│   └── index.ts               # Shared types
│
├── public/                    # Static files
│
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── postcss.config.js          # PostCSS config
└── next.config.js             # Next.js config
```

### 3.2. Chi tiết App Router

#### Route groups

```
app/
├── (auth)/                    # Không ảnh hưởng URL
│   ├── layout.tsx             # Layout cho auth pages
│   ├── login/
│   │   └── page.tsx           # /login
│   └── register/
│       └── page.tsx           # /register
│
├── (dashboard)/               # Không ảnh hưởng URL
│   ├── layout.tsx             # Layout với sidebar
│   ├── page.tsx               # / (dashboard home)
│   └── documents/
│       ├── page.tsx           # /documents
│       ├── upload/
│       │   └── page.tsx       # /documents/upload
│       └── [id]/
│           └── page.tsx       # /documents/123 (dynamic)
│
├── layout.tsx                 # Root layout
├── page.tsx                   # Redirect to /login or /dashboard
└── providers.tsx              # Wrap with contexts
```

#### Root layout (app/layout.tsx)
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kho Học Liệu Số',
  description: 'Hệ thống quản lý tài liệu học tập',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Providers (app/providers.tsx)
```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3.3. Chi tiết components/

#### UI components (shadcn/ui)
```
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── label.tsx
├── textarea.tsx
├── select.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── switch.tsx
├── badge.tsx
├── avatar.tsx
├── toast.tsx
└── table.tsx
```

#### Document components
```
components/documents/
├── DocumentCard.tsx           # Card hiển thị document
├── DocumentList.tsx           # List documents
├── DocumentUpload.tsx         # Upload form
├── DocumentDetail.tsx         # Detail view
├── DocumentEdit.tsx           # Edit form
└── SearchBar.tsx              # Search component
```

**DocumentCard.tsx** example:
```tsx
interface DocumentCardProps {
  document: Document;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{document.title}</CardTitle>
        <CardDescription>{document.author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {document.description}
        </p>
        <div className="flex gap-2 mt-4">
          {document.keywords.map((keyword) => (
            <Badge key={keyword} variant="secondary">{keyword}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit?.(document.id)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete?.(document.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
```

#### Layout components
```
components/layout/
├── Header.tsx                 # Top navigation
├── Sidebar.tsx                # Side navigation
├── Footer.tsx                 # Footer
└── PageContainer.tsx          # Page wrapper
```

### 3.4. Chi tiết lib/

#### API client (lib/api.ts)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
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

export default api;
```

#### Utils (lib/utils.ts)
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### 3.5. Chi tiết hooks/

```typescript
// hooks/use-auth.ts
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export function useAuth() {
  const { user, token, setAuth, logout: logoutStore } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setAuth(data.user, data.accessToken);
    router.push('/dashboard');
  };

  const logout = () => {
    logoutStore();
    router.push('/login');
  };

  const isAuthenticated = !!token;

  return { user, token, login, logout, isAuthenticated };
}
```

---

## 4. Common folders

### 4.1. docs/
```
docs/
├── guides/
│   ├── 01-prerequisites.md    # Kiến thức cần có
│   ├── 02-tech-stack.md       # Công nghệ
│   ├── 03-project-structure.md # Cấu trúc project
│   ├── 04-setup-guide.md      # Hướng dẫn cài đặt
│   ├── 05-learning-path.md    # Lộ trình học
│   ├── 06-resources.md        # Tài nguyên
│   └── 07-faq.md              # FAQ
│
└── GETTING_STARTED.md         # Tổng quan
```

### 4.2. storage/
```
storage/
└── documents/                 # Uploaded document files
    ├── abc123.pdf
    ├── def456.docx
    └── ...
```

---

## 5. File cấu hình quan trọng

### 5.1. package.json (root)
```json
{
  "name": "learning-repository",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "dev:api": "turbo run dev --filter=api",
    "dev:web": "turbo run dev --filter=web",
    "db:generate": "pnpm --filter api db:generate",
    "db:push": "pnpm --filter api db:push",
    "db:migrate": "pnpm --filter api db:migrate",
    "db:studio": "pnpm --filter api db:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 5.2. pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
```

### 5.3. turbo.json
```json
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
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

### 5.4. docker-compose.yml
```yaml
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
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

---

## Tiếp theo

Xem tiếp:

- [04-setup-guide.md](./04-setup-guide.md) - Hướng dẫn cài đặt chi tiết
