# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kho Học Liệu Số (Learning Repository) - A document management system with Rust backend runtime and Next.js frontend. Uses pnpm monorepo with Turborepo.

## Commands

### Development
```bash
pnpm dev:web          # Run frontend only
cargo run --manifest-path services/rust-doc-service/Cargo.toml
```

### Database (Backend)
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database (dev)
pnpm db:migrate       # Create migration (prod)
pnpm db:studio        # Open Prisma Studio
pnpm --filter data db:seed  # Seed sample data
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
└── web/          # Next.js 14 frontend (port 3000)
    ├── app/
    │   ├── (auth)/       # Login, register pages
    │   ├── (dashboard)/  # Main app pages
    │   └── providers.tsx # Auth context
    └── lib/api/          # API modules

packages/
└── data/         # Shared Prisma schema, seed, SQLite data

services/
└── rust-doc-service/ # Rust backend runtime
```

### Key Patterns

**Backend:**
- Rust V2 runs at `http://localhost:4001`
- Frontend talks directly to Rust V2
- Shared Prisma schema still lives in `packages/data/prisma`
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

JWT-based auth on Rust V2:
- Login/Register returns `{ accessToken, user }`
- Token expires in 7 days (configurable)
- Token sent in `Authorization: Bearer <token>` header
- 401 response auto-redirects to login page

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /auth/me | Current user info |
| GET | /v2/documents | List documents |
| GET | /v2/documents/my | User's documents |
| GET | /v2/documents/:id | Document detail |
| POST | /v2/documents | Create document (multipart) |
| PUT | /v2/documents/:id | Update metadata |
| DELETE | /v2/documents/:id | Soft delete |
| POST | /upload | Upload file |
| GET | /upload/:filename | Download file |

Rust service does not expose Swagger UI in this repo.

## Environment Variables

**Shared Prisma data (packages/data/prisma/dev.db):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

**Frontend (apps/web/.env):**
```env
NEXT_PUBLIC_RUST_V2_URL=http://localhost:4001
```

## File Upload

Files stored in `services/rust-doc-service/data/uploads/`. Max size: 100MB.
Supported: PDF, Word, Excel, PowerPoint, Video, Audio, Images.

## Coding Conventions

- TypeScript strict mode enabled
- JSDoc comments for public APIs
- File naming: PascalCase components, camelCase services, kebab-case modules
- Use React hooks (no class components)
- Conventional Commits for commit messages
