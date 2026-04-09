# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kho Học Lieu So (Learning Repository) - Document management system with Rust backend (Axum) and Next.js 14 frontend. Pnpm monorepo with Turborepo.

## Commands

```bash
# Development
pnpm dev                    # Run all apps (turbo)
pnpm dev:web                # Frontend only (port 3000)
pnpm dev:rust               # Rust backend only
pnpm dev:web:log            # Frontend with logging
pnpm dev:rust:log           # Rust backend with logging
pnpm dev:web:clean          # Clean restart frontend

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to DB (dev)
pnpm db:migrate             # Create migration
pnpm db:studio              # Prisma Studio
pnpm --filter data db:seed  # Seed sample data

# Build & Quality
pnpm build                  # Build all apps
pnpm lint                   # Lint all apps
pnpm test                   # Run tests
cargo test --manifest-path services/rust-doc-service/Cargo.toml  # Rust tests
cargo clippy --manifest-path services/rust-doc-service/Cargo.toml -- -D warnings  # Rust lint
```

## Architecture

### Monorepo Structure
```
apps/
└── web/                    # Next.js 14 frontend (port 3000)
    ├── app/
    │   ├── (auth)/         # Login, register
    │   ├── (dashboard)/    # Main app (protected)
    │   │   ├── admin/      #   User management, news categories, news admin
    │   │   ├── documents/  #   Document list, detail, upload
    │   │   ├── my-documents/
    │   │   ├── my-news/    #   User's own news articles
    │   │   ├── rust-docs/  #   Document viewer
    │   │   ├── dashboard/
    │   │   ├── profile/
    │   │   └── change-password/
    │   ├── news/           # Public news pages
    │   └── providers.tsx   # Auth context (useAuth hook)
    └── lib/api/            # API client modules
        ├── client.ts       # Axios instance + interceptors
        ├── types.ts        # Shared TypeScript interfaces
        ├── auth.ts         # Auth API
        ├── documents.ts    # Document CRUD
        ├── folders.ts      # Folder CRUD + tree
        ├── news.ts         # News + categories API
        └── permissions.ts  # Folder permission sharing

packages/
└── data/                   # Shared Prisma schema + SQLite DB
    └── prisma/
        ├── schema.prisma
        ├── dev.db          # SQLite dev database
        └── seed.ts

services/
└── rust-doc-service/       # Axum backend (default port 3001, env overrides to 4001)
    └── src/
        ├── main.rs
        ├── core/           # Config, database, error, storage, repository
        ├── domains/        # Business logic organized by domain
        │   ├── auth/       #   Auth service + models
        │   ├── documents/  #   Document models
        │   ├── folders/    #   Folder models
        │   ├── news/       #   News models
        │   ├── permissions/#   Folder permission models
        │   └── inspection/ #   File inspection service
        ├── http/routes/    # Axum route handlers (one file per domain)
        └── tests.rs
```

### Backend (Rust/Axum)

- **Domain-driven structure**: `domains/` contains business logic, `http/routes/` contains handlers
- **Shared SQLite DB**: Rust uses `sqlx` directly; frontend uses Prisma. Both point to same `packages/data/prisma/dev.db`
- **Soft delete**: Documents/folders set `status = 'DELETED'` rather than removing rows
- **File storage**: `services/rust-doc-service/data/uploads/` (max 100MB, configurable via `RUST_DOC_SERVICE_MAX_FILE_SIZE_BYTES`)
- **Config from env**: All config in `core::config::AppConfig::from_env()` — host, port, JWT secret, DB URL, file limits

### Frontend (Next.js)

- **App Router** with route groups: `(auth)` for public, `(dashboard)` for protected pages
- **Auth**: `useAuth()` hook from `providers.tsx` — JWT in localStorage, auto-injected via Axios interceptor, 401 auto-redirects to login
- **State**: Zustand for client state, react-hook-form + Zod for form validation
- **UI**: Radix UI primitives + Tailwind CSS + class-variance-authority
- **API client**: `lib/api/client.ts` creates Axios instance with base URL from `NEXT_PUBLIC_RUST_V2_URL`

### User Approval Flow

New users register with `status = 'PENDING'`. Admins approve/reject via `/admin/users/{id}/approve` and `/admin/users/{id}/reject`. Only `ACTIVE` users can use the system. Users with `canApproveUsers = true` can also approve.

### Folder Permissions

Folder owners can grant upload permissions to other users via `/v2/folders/{id}/permissions`. This enables collaborative folder structures (Google Drive-style sharing).

## Database (Prisma/SQLite)

SQLite for dev, PostgreSQL for production. SQLite has no enums — role/status are plain Strings, keywords stored as JSON.

**Key models:**
- **User**: id, email, fullName, role (ADMIN/USER), status (PENDING/ACTIVE/REJECTED), canApproveUsers, approval/rejection tracking
- **Folder**: id, name, color, parentId (self-referential tree), userId, isPublic, status. Unique constraint on (userId, name, parentId)
- **Document**: id, userId, folderId, title, metadata fields, file info, status, isPublic. Links to Folder (SetNull on delete)
- **NewsCategory**: id, name, slug (unique), order, status
- **News**: id, categoryId, userId, title, slug (unique), content, thumbnailUrl, isPublished, isFeatured, viewCount, status

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register (returns user with PENDING status) |
| POST | /auth/login | Login (returns accessToken + user) |
| GET | /auth/me | Current user |
| PUT | /auth/profile | Update profile |
| PUT | /auth/change-password | Change password |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List users (filter by status, search) |
| PATCH | /admin/users/{id}/approve | Approve user |
| PATCH | /admin/users/{id}/reject | Reject user |
| GET | /v2/users/search | Search users (for permission granting) |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /v2/documents | List all public/accessible documents |
| GET | /v2/documents/my | Current user's documents |
| GET | /v2/documents/{id} | Document detail |
| POST | /v2/documents | Create document (multipart) |
| PUT | /v2/documents/{id} | Update metadata |
| DELETE | /v2/documents/{id} | Soft delete |
| GET | /v2/documents/{id}/download | Download file |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /v2/folders | List folders |
| POST | /v2/folders | Create folder |
| GET | /v2/folders/tree | Full folder tree |
| GET | /v2/folders/{id} | Folder detail |
| PUT | /v2/folders/{id} | Update folder |
| DELETE | /v2/folders/{id} | Delete folder |
| GET | /v2/folders/{id}/breadcrumbs | Breadcrumb path |
| GET | /v2/folders/{id}/children | Child folders |

### Folder Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /v2/folders/{id}/permissions | List permissions |
| POST | /v2/folders/{id}/permissions | Grant permission |
| DELETE | /v2/folders/{id}/permissions/{permissionId} | Revoke permission |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /news | List published news |
| POST | /news | Create news |
| GET | /news/featured | Featured news |
| GET | /news/slug/{slug} | News by slug (public) |
| GET | /news/my | Current user's news |
| GET | /news/{id} | News detail |
| PUT | /news/{id} | Update news |
| DELETE | /news/{id} | Delete news |
| GET | /news-categories | List categories |
| POST | /news-categories | Create category |
| GET | /news-categories/admin | All categories (admin) |
| GET | /news-categories/{id} | Category detail |
| PUT | /news-categories/{id} | Update category |
| DELETE | /news-categories/{id} | Delete category |

### File Inspection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /inspect | Inspect file (validate type/extension) |
| GET | /inspections | Inspection history |
| GET | /inspections/{id} | Inspection detail |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /upload | Upload file |
| GET | /upload/{filename} | Serve uploaded file |

## Environment Variables

**Rust backend** (`services/rust-doc-service/.env`):
```env
RUST_DOC_SERVICE_HOST=127.0.0.1
RUST_DOC_SERVICE_PORT=4001
JWT_SECRET=your-secret-key
DATABASE_URL=file:./dev.db
RUST_DOC_SERVICE_MAX_FILE_SIZE_BYTES=104857600
RUST_DOC_SERVICE_DATABASE_MAX_CONNECTIONS=5
```

**Frontend** (`apps/web/.env`):
```env
NEXT_PUBLIC_RUST_V2_URL=http://localhost:4001
```

## Coding Conventions

- TypeScript strict mode, PascalCase components, camelCase services, kebab-case modules
- Rust: rustfmt + clippy, domain-driven module organization
- Conventional Commits for commit messages
- Shared Prisma types live in `packages/data/prisma/schema.prisma` — frontend types in `apps/web/lib/api/types.ts` must stay in sync with Rust backend models
