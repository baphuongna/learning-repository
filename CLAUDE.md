# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kho Học Liệu Số (Learning Repository) - A document management system with NestJS backend and Next.js frontend. Uses pnpm monorepo with Turborepo.

## Commands

### Development
```bash
pnpm dev              # Run both API (port 3001) and Web (port 3000)
pnpm dev:api          # Run backend only
pnpm dev:web          # Run frontend only
```

### Database (Backend)
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database (dev)
pnpm db:migrate       # Create migration (prod)
pnpm db:studio        # Open Prisma Studio
pnpm --filter api db:seed  # Seed sample data
```

### Build & Test
```bash
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm test             # Run tests
```

## Architecture

### Monorepo Structure
```
apps/
├── api/          # NestJS backend (port 3001)
│   ├── prisma/   # Database schema, seed
│   └── src/
│       ├── modules/
│       │   ├── auth/       # JWT authentication
│       │   ├── documents/  # Document CRUD + search
│       │   └── upload/     # File upload/download
│       └── common/
│           ├── guards/     # JwtAuthGuard
│           ├── decorators/ # @CurrentUser, @Public
│           └── services/   # PrismaService
│
└── web/          # Next.js 14 frontend (port 3000)
    ├── app/
    │   ├── (auth)/       # Login, register pages
    │   ├── (dashboard)/  # Main app pages
    │   └── providers.tsx # Auth context
    └── lib/api.ts        # Axios client
```

### Key Patterns

**Backend:**
- Path alias: `@/*` maps to `src/*`
- All API routes prefixed with `/api`
- Use `@Public()` decorator for public endpoints
- PrismaService injected via constructor
- Soft delete: documents set `status = 'DELETED'`

**Frontend:**
- Next.js App Router with route groups
- `useAuth()` hook for authentication state
- Axios interceptor auto-injects JWT token
- Token stored in localStorage

### Database (Prisma)

**SQLite** for development, **PostgreSQL** for production.

- User: id, email, fullName, role (ADMIN/USER), passwordHash
- Document: id, userId, title, description, author, subject, keywords (JSON), fileName, filePath, fileSize, mimeType, status, isPublic

**Note:** SQLite doesn't support enums or arrays. Role/status are Strings, keywords stored as JSON string.

### Authentication

JWT-based with Passport.js:
- Login/Register returns `{ accessToken, user }`
- Token expires in 7 days (configurable)
- Token sent in `Authorization: Bearer <token>` header
- 401 response auto-redirects to login page

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user info |
| GET | /api/documents | List documents |
| GET | /api/documents/my | User's documents |
| GET | /api/documents/:id | Document detail |
| POST | /api/documents | Create document (multipart) |
| PUT | /api/documents/:id | Update metadata |
| DELETE | /api/documents/:id | Soft delete |
| GET | /api/search?q=keyword | Search documents |
| POST | /api/upload | Upload file |
| GET | /api/upload/:filename | Download file |

Swagger UI available at `/api/docs`

## Environment Variables

**Backend (apps/api/.env):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGINS="http://localhost:3000"
UPLOAD_DIR="./uploads"
```

**Frontend (apps/web/.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## File Upload

Files stored in `apps/api/uploads/`. Max size: 50MB.
Supported: PDF, Word, Excel, PowerPoint, Video, Audio, Images.

## Coding Conventions

- TypeScript strict mode enabled
- JSDoc comments for public APIs
- File naming: PascalCase components, camelCase services, kebab-case modules
- Use dependency injection in NestJS
- Use React hooks (no class components)
- Conventional Commits for commit messages
