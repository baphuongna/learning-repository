# AGENTS.md
Guide for autonomous coding agents in this repository.

## 1) Repository Overview
- Monorepo: `pnpm` workspaces + `turbo`
- Apps: `apps/api` (NestJS 10 + Prisma), `apps/web` (Next.js 14 App Router + Tailwind)
- Package manager: `pnpm@9`, Node.js: `>=18`
- TS aliases: API `@/* => apps/api/src/*`, Web `@/* => apps/web/*`

## 2) Root Commands
Run from `D:\my\learning-repository`:

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm dev
pnpm dev:api
pnpm dev:web
```

DB helpers:

```bash
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
pnpm --filter api db:seed
```

## 3) App Commands
API (`apps/api`):

```bash
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api test
```

Web (`apps/web`):

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
```

Notes: web has no dedicated `test` script; `pnpm test` runs via Turbo and mainly covers API tests.

## 4) Run a Single Test (API/Jest)
```bash
# one test file
pnpm --filter api test -- src/modules/documents/documents.service.spec.ts

# by test name
pnpm --filter api test -- -t "should return paginated documents"

# file + test name
pnpm --filter api test -- src/modules/documents/documents.service.spec.ts -t "for admin"

# watch mode
pnpm --filter api test -- --watch
```

If matching fails, retry with path relative to `apps/api`.

## 5) Verification Expectations
- After changes, run: `pnpm build`, `pnpm lint`, and relevant tests.
- Backend change: run `pnpm --filter api test`.
- Frontend-only change: still run `pnpm build` and `pnpm --filter web lint`.
- Always report actual command outcomes.

## 6) Code Style Guidelines
### TypeScript & typing
- Write new logic in TypeScript.
- Keep strict typing (`strict`, `noImplicitAny`, `strictNullChecks`) and avoid `any`.
- Use explicit DTO/request/response types; with Zod forms prefer `z.infer<typeof schema>`.

### Imports
- Group imports: framework, third-party, internal; keep order consistent with nearby files.
- Use `@/...` aliases where suitable and remove unused imports.

### Naming
- React files/components: `PascalCase`; variables/functions/helpers: `camelCase`.
- Nest files: `*.module.ts`, `*.controller.ts`, `*.service.ts`; DTO files: `*.dto.ts`, class names ending in `Dto`.
- Prefer descriptive names; avoid unclear abbreviations.

### Formatting & structure
- Follow ESLint-driven conventions; keep quote/semicolon style consistent with existing code.
- Keep functions focused, use early returns, and avoid broad unrelated refactors.

### Comments
- Preserve meaningful Vietnamese comments/JSDoc; add comments only for non-obvious logic.

## 7) Backend Conventions (NestJS + Prisma)
- Validate requests with DTO + `class-validator`; keep auth/permission checks explicit.
- Throw proper Nest exceptions and respect global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Use constructor-based DI, explicit Prisma queries (`where`, `select`, `include`), and soft-delete semantics (`status = 'DELETED'`).
- Do not leak sensitive internal details in error responses.

## 8) Frontend Conventions (Next.js)
- Follow existing App Router route-group patterns, use functional components + hooks.
- Use `'use client'` only when necessary and reuse shared UI in `apps/web/components/ui` with `cn` utility.
- Centralize API calls in `apps/web/lib/api.ts`, handle loading/empty/error states explicitly.
- Keep current auth failure behavior (clear token + redirect) aligned.

## 9) Security & Data Handling
- Never hardcode secrets; use `.env` and never commit credentials/tokens/private keys.
- Validate/sanitize user input, enforce role-based access + private/public rules, avoid sensitive production logs.

## 10) Architecture Conventions
- API routes under `/api`; Swagger at `/api/docs`.
- Backend features: `apps/api/src/modules/*`.
- Backend shared utilities: `apps/api/src/common/*`.
- Web shared helpers: `apps/web/lib/*`.
- Reusable UI/presentational components: `apps/web/components/*`.

## 11) Cursor/Copilot Rules Status
Checked and not found:
- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

If these files are added later, treat them as high-priority instructions and update this document.

## 12) Agent Workflow Checklist
Before editing:
- Read nearby files and follow local conventions.
- Confirm target app/module (`api` or `web`).

During editing:
- Keep scope minimal and targeted.
- Preserve backward compatibility unless task requires breaking changes.

Before finishing:
- Run required build/lint/test commands.
- Report changed files, impact, and command results.
- Note follow-up gaps (for example, missing tests).
