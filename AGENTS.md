# AGENTS.md
Guide for autonomous coding agents working in this repository.

## Repository Snapshot
- Monorepo managed with `pnpm` workspaces and `turbo`.
- Frontend app: `apps/web` using Next.js 14 App Router, TypeScript, Tailwind CSS.
- Shared data package: `packages/data` for Prisma schema, seed, and SQLite data workflows.
- Primary backend service: `services/rust-doc-service` using Rust, Axum, SQLx, and SQLite.
- Package manager: `pnpm@9.0.0`.
- Recommended Node.js runtime: `18` or `20` LTS for frontend stability.
- Rust edition: `2024`.
- Workspace root in this environment: `E:\work\AI\store\learning-repository`.

## Important Paths
- Web routes and layouts: `apps/web/app/*`
- Web shared components: `apps/web/components/*`
- Web API helpers and utilities: `apps/web/lib/*`
- Shared UI primitives: `apps/web/components/shared/ui/*`
- Prisma schema and seed: `packages/data/prisma/*`
- Rust service source: `services/rust-doc-service/src/*`
- Rust HTTP routes: `services/rust-doc-service/src/http/routes/*`
- Rust core modules: `services/rust-doc-service/src/core/*`
- Rust domain modules: `services/rust-doc-service/src/domains/*`
- Rust service docs: `docs/rust-service/*`

## High-Priority Rule Files
- Checked and not found: `.cursorrules`
- Checked and not found: `.cursor/rules/`
- Checked and not found: `.github/copilot-instructions.md`
- If any of these files are added later, treat them as higher priority than this document and update `AGENTS.md` accordingly.

## Root Commands
Run from repository root unless noted otherwise:

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm dev:web
pnpm dev:web:log
pnpm dev:rust
pnpm dev:rust:log
pnpm clean:tmp
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
pnpm --filter data db:seed
```

## App-Scoped Commands
Web app:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

Shared data package:

```bash
pnpm --filter data db:generate
pnpm --filter data db:push
pnpm --filter data db:migrate
pnpm --filter data db:studio
pnpm --filter data db:seed
```

Rust doc service:

```bash
cargo run --manifest-path services/rust-doc-service/Cargo.toml
cargo build --manifest-path services/rust-doc-service/Cargo.toml
cargo test --manifest-path services/rust-doc-service/Cargo.toml
```

## Single-Test Commands
Use these when changing a small, isolated behavior:

```bash
# Run one Rust test by substring
cargo test --manifest-path services/rust-doc-service/Cargo.toml creates_user_and_reads_profile_count

# Run one Rust test exactly
cargo test --manifest-path services/rust-doc-service/Cargo.toml creates_user_and_reads_profile_count -- --exact

# Run one Rust test and show log output
cargo test --manifest-path services/rust-doc-service/Cargo.toml creates_user_and_reads_profile_count -- --exact --nocapture

# Run tests in a specific Rust module file by substring
cargo test --manifest-path services/rust-doc-service/Cargo.toml folder
```

Notes:
- Current Rust tests live in `services/rust-doc-service/src/tests.rs` as crate unit/integration-style tests.
- There is no dedicated frontend test runner configured right now (`vitest`, `jest`, and `playwright` configs are absent).
- Frontend lint is configured via `apps/web/.eslintrc.json`, so `pnpm --filter web lint` runs non-interactively.
- For frontend changes, verify with `pnpm --filter web lint` and `pnpm --filter web build`, then document manual test steps.

## Verification Expectations
- Frontend-only changes: run `pnpm --filter web lint` and `pnpm --filter web build`.
- Prisma or schema changes: run the relevant `pnpm --filter data db:*` command you touched.
- Rust service changes: run `cargo build --manifest-path services/rust-doc-service/Cargo.toml` and `cargo test --manifest-path services/rust-doc-service/Cargo.toml`.
- Cross-cutting changes: run both web and Rust verification relevant to the touched areas.
- Current known-good verification baseline: `pnpm --filter web lint`, `pnpm --filter web build`, and `cargo test --manifest-path services/rust-doc-service/Cargo.toml` pass in this repo after a clean `pnpm install`.
- Always report actual command outcomes, not assumed success.

## Architecture Notes
- Treat `apps/web` as the user-facing frontend.
- Treat `services/rust-doc-service` as the active backend runtime.
- Treat `packages/data` as the Prisma/shared data package, not as the HTTP backend.
- Rust routes are exposed directly without an `/api` prefix unless existing code already does otherwise.
- Preserve soft-delete behavior where rows use `status = 'DELETED'`.

## TypeScript Guidelines
- Write new frontend logic in TypeScript.
- Preserve `strict: true` in `apps/web/tsconfig.json`.
- Avoid `any`; prefer explicit interfaces, DTOs, utility types, or inferred types.
- For Zod-backed forms, prefer `z.infer<typeof schema>`.
- Prefer narrow request and response types over loose records.
- Use the existing alias `@/* -> apps/web/*` when it improves clarity.
- Match local style: single quotes, semicolons, and `import type` for type-only imports.

## Rust Guidelines
- Keep Axum handlers thin; move business logic into focused domain or core modules.
- Keep SQLx queries in repository-style modules such as `src/core/repository.rs`.
- Prefer explicit structs and enums over ad hoc maps or tuples.
- Return `AppResult<T>` and typed `AppError` variants for HTTP-facing code.
- Keep configuration centralized in `src/core/config.rs`.
- Keep database setup and migrations in `src/core/database.rs`.
- Add tests around pure business rules before adding broader HTTP-path tests.

## Imports and File Organization
- Group imports as: framework/runtime, third-party, internal alias or relative.
- Mirror the surrounding file before reordering aggressively.
- Remove unused imports.
- Keep one file focused on one responsibility.
- Do not mix route handlers, DTOs, persistence logic, and unrelated helpers in one file.
- In Rust, follow the existing split: `core`, `domains`, and `http`.

## Naming Conventions
- React components and component filenames: `PascalCase`.
- Functions, variables, hooks, and helpers: `camelCase`.
- Type aliases, interfaces, and Rust structs/enums: descriptive `PascalCase`.
- Constants: follow nearby conventions; use uppercase only for true constants.
- Prefer clear domain names over abbreviations.

## Formatting and Structure
- Follow the formatting already implied by the current codebase and toolchain.
- Keep functions small and focused.
- Prefer guard clauses and early returns over deep nesting.
- Avoid broad refactors unless the task requires them.
- Keep quote style and semicolon usage consistent with the surrounding file.
- Add comments only for non-obvious logic.
- Preserve meaningful Vietnamese comments that already exist.

## Frontend Conventions
- Follow the existing App Router structure and route groups such as `(auth)` and `(dashboard)`.
- Add `'use client'` only when a component actually needs client-side hooks, browser APIs, or event handlers.
- Reuse primitives from `apps/web/components/shared/ui` before creating new ones.
- Use the shared `cn` helper for conditional Tailwind class composition.
- Centralize HTTP calls in `apps/web/lib/api/*`.
- Handle loading, empty, success, and error states explicitly on data-driven pages.
- Preserve the current `401` flow in the Axios interceptor: clear auth state and redirect to `/login`.

## Backend Conventions
- Keep authorization checks explicit in the route or service flow.
- Validate input at module boundaries.
- Normalize user-provided strings before persistence when the existing code does so.
- Return user-safe error messages; never leak SQL, stack traces, tokens, or secrets.
- Prefer fail-fast validation and explicit permission checks.
- Keep file-upload validation aligned with configured limits and allowed content types.

## Error Handling
- In TypeScript, catch async failures where the UI needs to recover and clean up loading state in `finally`.
- In Rust, use `AppError` variants like `BadRequest`, `Forbidden`, `NotFound`, and `Internal`.
- Log internal failures with enough context for debugging, but do not expose sensitive details to clients.
- Handle edge cases explicitly: missing resources, deleted records, unauthorized access, invalid payloads.

## Testing Guidance
- Update or add tests alongside behavior changes when practical.
- Prefer descriptive test names that state the business scenario.
- Cover happy path, validation, authorization, and failure cases.
- Keep test data minimal and intention-revealing.
- For Rust, use `cargo test --manifest-path services/rust-doc-service/Cargo.toml` as the primary test entry point.
- For frontend work, if automated tests are unavailable, include a short manual verification path in your final note.

## Security and Config
- Never hardcode secrets, tokens, passwords, or private keys.
- Use environment variables for runtime configuration.
- Validate and sanitize user input.
- Preserve existing auth, role, and visibility rules.
- Avoid logging sensitive production data.
- Do not commit local logs or temporary artifacts; logs belong under `tmp/logs/`.

## Agent Workflow
Before editing:
- Read nearby files and mirror local conventions.
- Determine whether the task belongs to `apps/web`, `packages/data`, `services/rust-doc-service`, or a cross-cutting flow.
- Check for existing docs in `docs/rust-service/` before creating new documentation.

During editing:
- Keep scope tight and avoid unrelated cleanup.
- Preserve backward compatibility unless behavior change is required.
- Prefer updating existing docs over creating many new documents.
- Do not introduce new tools, scripts, or architectural patterns without clear need.

Before finishing:
- Run the relevant build, lint, and test commands.
- Report changed files, behavioral impact, and command outcomes.
- Call out any verification gaps, environment assumptions, or follow-up work.
