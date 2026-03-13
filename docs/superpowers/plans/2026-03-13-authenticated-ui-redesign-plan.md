# Authenticated UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire authenticated post-login experience in `apps/web` into a unified, productivity-first workspace with hybrid responsive navigation and consistent UX across dashboard, documents, content, account, and admin areas.

**Architecture:** Replace the current header-heavy authenticated shell with a shared app shell built around sidebar navigation and a utility topbar, then migrate page-level experiences onto a common page structure (`PageHeader` + `ContextBar` + content canvas + standardized state handling). Reuse existing feature modules where possible, refactor only where boundaries are unclear, and keep all existing route capabilities intact while improving hierarchy, navigation, and responsive behavior.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide React, existing shared UI primitives in `apps/web/components/shared/ui/*`

**Design Spec:** `docs/superpowers/specs/2026-03-13-authenticated-ui-redesign-design.md`

---

## File Changes Overview

### Existing Files to Modify
| File | Responsibility in this plan |
|------|-----------------------------|
| `apps/web/app/(dashboard)/layout.tsx` | Replace current header-first shell with authenticated app shell layout |
| `apps/web/components/features/layout/Header.tsx` | Refactor into topbar-oriented component or split responsibilities into topbar + user menu |
| `apps/web/components/features/layout/dashboard-nav-items.ts` | Reorganize nav groups by task/section and preserve role-aware behavior |
| `apps/web/components/features/layout/DashboardBreadcrumb.tsx` | Simplify breadcrumb behavior to fit new shell + page header hierarchy |
| `apps/web/components/dashboard/DashboardOverview.tsx` | Redesign dashboard into command-center style homepage |
| `apps/web/app/(dashboard)/documents/page.tsx` | Adopt new page structure and contextual toolbar layout |
| `apps/web/app/(dashboard)/my-documents/page.tsx` | Apply the same structure as documents page with owner-focused context |
| `apps/web/components/features/documents/DocumentList.tsx` | Refactor into clearer context bar + content canvas flow |
| `apps/web/components/features/folders/FolderTree.tsx` | Improve folder navigation states and visual hierarchy |
| `apps/web/components/features/folders/FolderBreadcrumb.tsx` | Ensure folder path works inside new context bar model |
| `apps/web/app/(dashboard)/my-news/page.tsx` | Adopt standardized page header + action structure |
| `apps/web/app/(dashboard)/admin/news/page.tsx` | Align admin content management with shared page grammar |
| `apps/web/app/(dashboard)/admin/categories/page.tsx` | Align admin management page with shared layout and states |
| `apps/web/components/features/news/MyNewsList.tsx` | Standardize search/filter/action layout with documents UX |
| `apps/web/components/features/news/NewsCard.tsx` | Adjust card density / action affordances only if needed for consistency |
| `apps/web/app/(dashboard)/profile/page.tsx` | Transform profile into account-area experience |
| `apps/web/app/(dashboard)/change-password/page.tsx` | Integrate security flow into account design language |

### Likely New Files
| File | Responsibility |
|------|----------------|
| `apps/web/components/features/layout/AppShell.tsx` | Shared authenticated shell wrapper |
| `apps/web/components/features/layout/AppSidebar.tsx` | Desktop sidebar + grouped navigation |
| `apps/web/components/features/layout/AppTopbar.tsx` | Utility topbar for search, breadcrumb, actions, theme, user menu |
| `apps/web/components/features/layout/PageHeader.tsx` | Shared page title/subtitle/action header |
| `apps/web/components/features/layout/ContextBar.tsx` | Shared search/filter/sort/action container for content pages |
| `apps/web/components/dashboard/QuickActions.tsx` | Reusable quick actions module for dashboard |
| `apps/web/components/dashboard/RecentActivity.tsx` | Reusable recent work / continuation module |
| `apps/web/components/account/AccountSections.tsx` | Shared account-area section layout |
| `apps/web/components/shared/ui/page-empty-state.tsx` | Optional shared empty state wrapper if current patterns are too scattered |
| `apps/web/components/shared/ui/page-error-state.tsx` | Optional shared error state wrapper |

### Reference Files to Read Before Editing
- `apps/web/app/providers.tsx`
- `apps/web/components/features/auth/AuthPageGuard.tsx`
- `apps/web/components/shared/ui/button.tsx`
- `apps/web/components/shared/ui/card.tsx`
- `apps/web/components/shared/ui/empty-state.tsx`
- `apps/web/components/features/documents/ViewToggle.tsx`

---

## Implementation Strategy

### Phase ordering
1. Stabilize shared shell and navigation first
2. Redesign dashboard homepage second
3. Standardize documents and content management pages third
4. Consolidate account/admin experience fourth
5. Finish with state consistency, responsive verification, and regression checks

### Non-goals during implementation
- Do not add backend endpoints
- Do not redesign public homepage/login/register in this plan
- Do not split route groups unless strictly necessary
- Do not remove existing feature capabilities while redesigning layout

---

## Chunk 1: Authenticated Shell Foundation

### Task 1: Freeze current shell behavior with verification notes

**Files:**
- Read: `apps/web/app/(dashboard)/layout.tsx`
- Read: `apps/web/components/features/layout/Header.tsx`
- Read: `apps/web/components/features/layout/dashboard-nav-items.ts`
- Read: `apps/web/components/features/layout/DashboardBreadcrumb.tsx`

- [ ] **Step 1: Document current authenticated shell behavior inline in the implementation session**

Capture:
- current redirect logic
- current loading state behavior
- current role-based nav behavior
- current user menu items

- [ ] **Step 2: Run baseline lint/build before shell refactor**

Run:
```bash
pnpm --filter web lint && pnpm --filter web build
```

Expected:
- both commands succeed, or failures are recorded as pre-existing before edits begin

- [ ] **Step 3: Commit baseline checkpoint only if user explicitly requests commits during execution**

Do not commit by default.

### Task 2: Introduce shared authenticated shell components

**Files:**
- Create: `apps/web/components/features/layout/AppShell.tsx`
- Create: `apps/web/components/features/layout/AppSidebar.tsx`
- Create: `apps/web/components/features/layout/AppTopbar.tsx`
- Modify: `apps/web/app/(dashboard)/layout.tsx`
- Modify: `apps/web/components/features/layout/dashboard-nav-items.ts`

- [ ] **Step 1: Write the failing structural expectation**

Document expected render structure in comments or implementation notes before coding:

```tsx
<AppShell>
  <AppSidebar />
  <div>
    <AppTopbar />
    <main>{children}</main>
  </div>
</AppShell>
```

- [ ] **Step 2: Implement `AppShell.tsx` with a single responsibility**

Requirements:
- layout wrapper only
- no route logic inside beyond shell composition
- accepts `children`

- [ ] **Step 3: Implement `AppSidebar.tsx`**

Requirements:
- grouped navigation by task
- role-aware admin group
- active state handling using current route
- responsive hidden/collapsed behavior for non-desktop sizes

- [ ] **Step 4: Implement `AppTopbar.tsx`**

Requirements:
- host breadcrumb slot/current context
- host user menu and theme toggle
- reserve space for contextual page action and optional global search

- [ ] **Step 5: Refactor `(dashboard)/layout.tsx` to use the new shell**

Must preserve:
- auth loading state
- redirect-to-login behavior
- user-null guard

- [ ] **Step 6: Run diagnostics and verification**

Run LSP diagnostics on changed files.

Run:
```bash
pnpm --filter web lint
```

Expected:
- no new lint errors caused by shell refactor

### Task 3: Simplify breadcrumb and page framing hierarchy

**Files:**
- Modify: `apps/web/components/features/layout/DashboardBreadcrumb.tsx`
- Create: `apps/web/components/features/layout/PageHeader.tsx`
- Modify: `apps/web/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `PageHeader.tsx`**

Requirements:
- title
- optional subtitle
- optional actions slot
- compact, reusable spacing

- [ ] **Step 2: Refactor breadcrumb to be visually secondary**

Requirements:
- shorter hierarchy display
- does not overpower page title
- remains route-driven

- [ ] **Step 3: Place breadcrumb + page content framing consistently in layout**

Expected outcome:
- shell hierarchy becomes: topbar → breadcrumb → page header → page body

- [ ] **Step 4: Verify shell behavior on key routes**

Manually check:
- `/dashboard`
- `/documents`
- `/my-news`
- `/profile`
- `/admin/news` (admin account only)

---

## Chunk 2: Dashboard Command Center

### Task 4: Redesign `DashboardOverview` into a productivity homepage

**Files:**
- Modify: `apps/web/components/dashboard/DashboardOverview.tsx`
- Create: `apps/web/components/dashboard/QuickActions.tsx`
- Create: `apps/web/components/dashboard/RecentActivity.tsx`

- [ ] **Step 1: Identify existing data already available to the dashboard**

List which values are already fetched and which widgets can be composed without backend changes.

- [ ] **Step 2: Create failing UI checklist for dashboard blocks**

Required blocks:
- welcome / utility hero
- recent work
- quick actions
- personal / role summary

- [ ] **Step 3: Implement `QuickActions.tsx`**

Requirements:
- action cards or buttons with icons
- role-aware actions
- keyboard/mouse accessible

- [ ] **Step 4: Implement `RecentActivity.tsx` using existing available data patterns**

Constraints:
- if exact recent activity data is unavailable, use best available “recent work” approximation from current modules
- do not invent new backend contracts

- [ ] **Step 5: Refactor `DashboardOverview.tsx` to assemble the new homepage**

Requirements:
- stronger visual hierarchy
- desktop two-column layout where appropriate
- mobile-first stacked layout

- [ ] **Step 6: Verify dashboard behavior**

Run:
```bash
pnpm --filter web lint
```

Manual check:
- dashboard loads without regressions
- quick actions route correctly

---

## Chunk 3: Documents Workspace

### Task 5: Introduce shared context bar pattern for documents pages

**Files:**
- Create: `apps/web/components/features/layout/ContextBar.tsx`
- Modify: `apps/web/app/(dashboard)/documents/page.tsx`
- Modify: `apps/web/app/(dashboard)/my-documents/page.tsx`
- Modify: `apps/web/components/features/documents/DocumentList.tsx`

- [ ] **Step 1: Create `ContextBar.tsx` with focused props**

Include support for:
- title/context slot if needed
- search slot
- filter/sort slot
- primary action slot

- [ ] **Step 2: Refactor documents pages to use `PageHeader` + `ContextBar`**

Requirements:
- page-level structure is obvious before document grid/list renders
- keep route ownership distinctions intact

- [ ] **Step 3: Refactor `DocumentList.tsx` around content canvas responsibilities**

Requirements:
- separate context controls from result rendering
- preserve grid/list toggle
- preserve pagination and folder interactions

- [ ] **Step 4: Verify no feature regression**

Manual checks:
- search
- grid/list switch
- upload entry point
- folder navigation
- pagination

### Task 6: Improve folder navigation clarity

**Files:**
- Modify: `apps/web/components/features/folders/FolderTree.tsx`
- Modify: `apps/web/components/features/folders/FolderBreadcrumb.tsx`

- [ ] **Step 1: Refactor folder tree visual states**

Requirements:
- clearer active state
- clearer expanded/collapsed affordance
- better spacing/indent for nested items

- [ ] **Step 2: Ensure folder breadcrumb integrates cleanly with context bar**

Requirements:
- current location obvious
- no duplicate hierarchy noise against global breadcrumb

- [ ] **Step 3: Verify document navigation mentally and manually**

Check:
- entering folder
- moving back up
- owner actions still visible where allowed

---

## Chunk 4: Content Management Consistency

### Task 7: Standardize My News page structure

**Files:**
- Modify: `apps/web/app/(dashboard)/my-news/page.tsx`
- Modify: `apps/web/components/features/news/MyNewsList.tsx`
- Modify: `apps/web/components/features/news/NewsCard.tsx` *(only if required)*

- [ ] **Step 1: Apply shared page framing**

Requirements:
- `PageHeader`
- standardized action placement
- search/filter alignment similar to documents

- [ ] **Step 2: Refactor list/card density for consistency**

Requirements:
- status visibility
- actions easy to scan
- card density aligned with authenticated workspace tone

- [ ] **Step 3: Verify create/edit/delete affordances remain obvious**

### Task 8: Align admin content pages with the same grammar

**Files:**
- Modify: `apps/web/app/(dashboard)/admin/news/page.tsx`
- Modify: `apps/web/app/(dashboard)/admin/categories/page.tsx`

- [ ] **Step 1: Introduce the same page header + contextual action hierarchy**

- [ ] **Step 2: Improve admin density without fragmenting the app style**

Requirements:
- keep table-first where appropriate
- make filters/status/actions easier to scan

- [ ] **Step 3: Verify admin-only visibility still depends on role-aware nav and routing behavior**

---

## Chunk 5: Account Area Consolidation

### Task 9: Convert profile and security pages into one account-language system

**Files:**
- Modify: `apps/web/app/(dashboard)/profile/page.tsx`
- Modify: `apps/web/app/(dashboard)/change-password/page.tsx`
- Create: `apps/web/components/account/AccountSections.tsx`

- [ ] **Step 1: Create `AccountSections.tsx`**

Requirements:
- reusable section wrapper for profile/account/security/settings blocks
- visually consistent headings and spacing

- [ ] **Step 2: Refactor profile page into overview + settings sections**

Must preserve:
- avatar update flow
- profile form editing
- feedback messages

- [ ] **Step 3: Refactor change-password page to match the account experience**

Requirements:
- visual consistency with account area
- maintain current validation and success behavior

- [ ] **Step 4: Verify account flows**

Manual checks:
- edit profile
- avatar preview/update behavior
- change password validation
- success and error messaging

---

## Chunk 6: State System, Responsive QA, and Final Verification

### Task 10: Standardize empty/loading/error patterns where changes introduced inconsistency

**Files:**
- Create or modify only where needed after previous chunks

- [ ] **Step 1: Audit changed pages for loading/empty/error states**

Changed pages to inspect:
- dashboard
- documents
- my-documents
- my-news
- profile
- admin pages

- [ ] **Step 2: Introduce shared wrappers only if duplication is real**

Constraint:
- DRY, but do not abstract prematurely

- [ ] **Step 3: Verify permission-disabled and empty states communicate clearly**

### Task 11: Responsive walkthrough

**Files:**
- All shell and page files changed above

- [ ] **Step 1: Test desktop authenticated shell**

Check:
- sidebar width
- topbar spacing
- breadcrumb + page header hierarchy

- [ ] **Step 2: Test tablet behavior**

Check:
- sidebar collapse/overlay
- content spacing
- action placement

- [ ] **Step 3: Test mobile behavior**

Check:
- drawer/menu usability
- stacked layouts
- large tables/cards remain usable

- [ ] **Step 4: Fix responsive regressions only**

### Task 12: Final verification

**Files:**
- All changed files

- [ ] **Step 1: Run LSP diagnostics on all changed files**

- [ ] **Step 2: Run lint**

```bash
pnpm --filter web lint
```

Expected:
- pass, or only pre-existing unrelated issues documented

- [ ] **Step 3: Run build**

```bash
pnpm --filter web build
```

Expected:
- successful production build

- [ ] **Step 4: Perform authenticated manual smoke test**

Required paths:
- `/dashboard`
- `/documents`
- `/my-documents`
- `/my-news`
- `/profile`
- `/change-password`
- `/admin/news`
- `/admin/categories`

- [ ] **Step 5: Summarize behavior changes and any pre-existing issues**

Do not claim completion without actual command output.

---

## Success Criteria

- [ ] Authenticated area uses a unified app shell
- [ ] Primary navigation moves out of crowded header into sidebar-first model
- [ ] Topbar is utility-oriented rather than link-heavy
- [ ] Dashboard behaves like a command center, not a placeholder page
- [ ] Documents and My News share a common page grammar
- [ ] Account and security flows feel like one cohesive area
- [ ] Admin pages remain in the same system while supporting denser workflows
- [ ] Loading/empty/error states are clearer in the touched pages
- [ ] Responsive behavior works on desktop, tablet, and mobile
- [ ] `pnpm --filter web lint` passes
- [ ] `pnpm --filter web build` passes

---

## Suggested Atomic Commit Boundaries

Only create commits if the user explicitly requests them.

If commits are requested during implementation, use small boundaries such as:
- `feat(web): add authenticated app shell`
- `feat(web): redesign dashboard overview workspace`
- `feat(web): standardize document workspace layout`
- `feat(web): align content and admin management layouts`
- `feat(web): unify account area experience`
- `fix(web): responsive and state consistency adjustments`

---

## Verification Notes for Implementers

- Preserve auth redirect logic in `(dashboard)/layout.tsx`
- Preserve role-based nav behavior from `dashboard-nav-items.ts`
- Preserve current feature capabilities before improving UX
- Avoid backend-driven changes unless a later approved spec explicitly expands scope
- Prefer minimal, focused refactors over sweeping rewrites inside large feature files

---

Plan complete and saved to `docs/superpowers/plans/2026-03-13-authenticated-ui-redesign-plan.md`. Ready to execute?
