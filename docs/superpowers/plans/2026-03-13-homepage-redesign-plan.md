# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign homepage to be content-first, removing hero section and highlighting news as the focal point.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons

**Design Spec:** `docs/superpowers/specs/2026-03-13-homepage-redesign-design.md`

---

## File Changes Overview

### Modified Files
| File | Changes |
|------|---------|
| `apps/web/app/page.tsx` | Remove hero, restructure layout, new header/footer |
| `apps/web/components/features/news/FeaturedNews.tsx` | 5 items, new magazine layout |
| `apps/web/components/features/news/NewsList.tsx` | excludeIds prop, newsletter integration |
| `apps/web/components/features/news/NewsCard.tsx` | Add hero & medium variants |

### New Files
| File | Purpose |
|------|---------|
| `apps/web/components/home/StickySearchBar.tsx` | Sticky search with collapsible filters |
| `apps/web/components/home/QuickLinks.tsx` | Popular docs + trending tags |
| `apps/web/components/news/NewsletterBanner.tsx` | Inline newsletter signup |
| `apps/web/components/news/CategoryChips.tsx` | Extract category filter from NewsList |
| `apps/web/components/news/ViewModeToggle.tsx` | Grid/list view toggle |

---

## Implementation Phases

### Phase 1: Page Structure & Header

**Task 1.1: Remove Hero Section & Restructure page.tsx**
- [ ] Remove hero section (lines 67-99) from page.tsx
- [ ] Remove features section (lines 101-130) from page.tsx
- [ ] Update header to include tagline
- [ ] Import new components (StickySearchBar, QuickLinks, NewsletterBanner)
- [ ] Pass excludeIds prop to NewsList from FeaturedNews
- [ ] Verify: `pnpm --filter web lint` passes
- [ ] Commit: `feat: remove hero section, add header tagline`

**Task 1.2: Update Header with Tagline**
- [ ] Change logo container from single line to flex-col
- [ ] Add tagline: "Nền tảng chia sẻ kiến thức"
- [ ] Keep header height at h-16 (max 72px)
- [ ] Verify: Header displays correctly with tagline
- [ ] Commit: `feat: add tagline to header`

---

### Phase 2: Featured News (5 items)

**Task 2.1: Update FeaturedNews component**
- [ ] Change from 3 to 5 items fetch
- [ ] Implement magazine layout: hero (2/3 width) + 4 medium cards (1/3 width)
- [ ] Return excludeIds for parent component
- [ ] Verify: Featured news shows 5 items in magazine layout
- [ ] Commit: `feat: update FeaturedNews to 5 items`

**Task 2.2: Add Hero Card Variant to NewsCard**
- [ ] Add `hero` variant to NewsCard component
- [ ] Image height: responsive (`h-[280px] md:h-[400px] lg:h-[480px]`)
- [ ] Gradient overlay, category badge (accent), title, summary, meta
- [ ] Verify: Hero card displays correctly
- [ ] Commit: `feat: add hero card variant`

**Task 2.3: Add Medium Card Variant to NewsCard**
- [ ] Add `medium` variant to NewsCard component
- [ ] Horizontal layout with thumbnail (`w-24 h-16 lg:w-[120px] lg:h-[80px]`)
- [ ] Category badge (sm), title (1 line), author + relative time
- [ ] Verify: Medium cards display correctly
- [ ] Commit: `feat: add medium card variant`

---

### Phase 3: Sticky Search Bar

**Task 3.1: Create StickySearchBar Component**
- [ ] Create `apps/web/components/home/StickySearchBar.tsx`
- [ ] Implement sticky behavior (top-16, z-40)
- [ ] Add search input with Search icon
- [ ] Add filter button with Badge counter
- [ ] Add view mode toggle (reuse existing logic)
- [ ] Implement collapsible filter panel
- [ ] Add click-outside to close filter
- [ ] Verify: Search bar sticks below header on scroll
- [ ] Commit: `feat: add StickySearchBar component`

**Task 3.2: Create CategoryChips Component**
- [ ] Extract category filter logic from NewsList.tsx
- [ ] Create `apps/web/components/news/CategoryChips.tsx`
- [ ] Props: `categories`, `selected`, `onSelect`
- [ ] Render "Tất cả" + category badges
- [ ] Verify: Category chips work independently
- [ ] Commit: `feat: extract CategoryChips component`

**Task 3.3: Create ViewModeToggle Component**
- [ ] Create `apps/web/components/news/ViewModeToggle.tsx`
- [ ] Grid/List buttons with active state styling
- [ ] Props: `mode`, `onChange`
- [ ] Use LayoutGrid and List icons from lucide-react
- [ ] Verify: Toggle switches between grid and list
- [ ] Commit: `feat: add ViewModeToggle component`

---

### Phase 4: Quick Links

**Task 4.1: Create QuickLinks Component**
- [ ] Create `apps/web/components/home/QuickLinks.tsx`
- [ ] Implement 60/40 grid layout (md:grid-cols-5)
- [ ] Add Popular Documents section (4 docs, 2x2 grid)
- [ ] Add Trending Tags section (8-10 tags with weight-based sizing)
- [ ] Add "Xem tất cả tài liệu →" link
- [ ] Verify: Quick links displays correctly
- [ ] Commit: `feat: add QuickLinks component`

**Task 4.2: Add Mock Data for Quick Links**
- [ ] Create mockTrendingTags array with 8 tags
- [ ] Create mockPopularDocs array (or use existing documents API)
- [ ] Interface: TrendingTag { id, name, count, weight }
- [ ] Verify: Mock data displays with varying font sizes
- [ ] Commit: `feat: add mock data for quick links`

---

### Phase 5: Newsletter

**Task 5.1: Create NewsletterBanner Component**
- [ ] Create `apps/web/components/news/NewsletterBanner.tsx`
- [ ] Implement form with email input and submit button
- [ ] Add email validation (HTML5 required + regex)
- [ ] Add error/success state handling
- [ ] Add privacy text
- [ ] Accept className prop for col-span-full
- [ ] Verify: Newsletter form validates and handles states
- [ ] Commit: `feat: add NewsletterBanner component`

**Task 5.2: Integrate Newsletter in News Grid**
- [ ] Update NewsList to render newsletter after 6th card
- [ ] Use col-span-full for full-width display
- [ ] Slice news array: slice(0,6), NewsletterBanner, slice(6)
- [ ] Verify: Newsletter appears after row 2 in 3-column grid
- [ ] Commit: `feat: integrate newsletter in news grid`

---

### Phase 6: Footer

**Task 6.1: Update Footer**
- [ ] Move features from body to footer (3 icons + text)
- [ ] Add logo + tagline to footer
- [ ] Add newsletter backup form (simplified)
- [ ] Add footer links (Giới thiệu, Điều khoản, Liên hệ, RSS)
- [ ] Add copyright with heart emoji
- [ ] Verify: Footer displays all elements correctly
- [ ] Commit: `feat: update footer with features and newsletter`

---

### Phase 7: Polish & Verification

**Task 7.1: Update NewsList with excludeIds**
- [ ] Add excludeIds prop to NewsListProps interface
- [ ] Filter response.data client-side if excludeIds provided
- [ ] Pass excludeIds from page.tsx to NewsList
- [ ] Verify: Featured news don't appear in news grid
- [ ] Commit: `feat: add excludeIds filtering to NewsList`

**Task 7.2: Responsive Testing**
- [ ] Test on mobile (<640px) - single column, stacked
- [ ] Test on tablet (640-1024px) - 2 columns
- [ ] Test on desktop (>1024px) - 3 columns, magazine layout
- [ ] Fix any responsive issues
- [ ] Commit: `fix: responsive adjustments`

**Task 7.3: Final Verification**
- [ ] Run `pnpm --filter web lint` - must pass
- [ ] Run `pnpm --filter web build` - must pass
- [ ] Manual testing: all features work as expected
- [ ] Update page.tsx to use new layout structure
- [ ] Commit: `chore: final verification and cleanup`

---

## Success Criteria

- [ ] Hero section removed
- [ ] Header includes tagline "Nền tảng chia sẻ kiến thức"
- [ ] Sticky search bar functional with collapsible filters
- [ ] Featured news shows 5 items in magazine layout
- [ ] Quick links displays popular docs (mock) and trending tags (mock)
- [ ] News grid excludes featured items (client-side filter)
- [ ] Newsletter banner appears after row 2 in news grid
- [ ] Footer includes features + newsletter backup
- [ ] Responsive on mobile, tablet, desktop
- [ ] `pnpm --filter web lint` passes
- [ ] `pnpm --filter web build` passes

---

## Atomic Commit Strategy

Each task should result in a single atomic commit with the format:
- `feat: <description>` for new features
- `fix: <description>` for bug fixes
- `chore: <description>` for maintenance tasks

Commits should be small and focused, making it easy to review and revert if needed.

---

## Dependencies

- No new npm packages required
- All icons available in lucide-react (already installed)
- Uses existing UI components from shadcn/ui
