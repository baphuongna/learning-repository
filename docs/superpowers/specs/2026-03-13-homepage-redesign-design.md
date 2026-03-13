# Homepage Redesign - Design Specification

**Date:** 2026-03-13
**Status:** Approved
**Author:** Design Session

---

## Overview

Redesign homepage với content-first approach, loại bỏ hero section marketing-focused, đưa tin tức trở thành focal point của trang chủ.

### Goals
- Tối ưu cho content-first experience
- Làm nổi bật tin tức ngay khi visitor vào trang
- Tăng engagement với newsletter và quick links
- Clean, modern magazine-style layout

### Out of Scope
- Backend API changes
- Database schema changes
- Other pages (documents, login, etc.)

---

## Architecture

### Component Structure

```
apps/web/app/page.tsx
├── Header (modified)
│   ├── Logo
│   ├── Tagline (NEW)
│   ├── Navigation
│   └── Login Button
├── StickySearchBar (NEW)
│   ├── Search Input
│   ├── Filter Button (collapsible)
│   └── View Mode Toggle
├── FeaturedNews (modified)
│   ├── HeroCard (1 tin)
│   └── MediumCards (4 tin)
├── QuickLinks (NEW)
│   ├── PopularDocuments
│   └── TrendingTags
├── NewsGrid (modified)
│   ├── NewsList (exclude featured)
│   ├── NewsletterBanner (inline, NEW)
│   └── Pagination
└── Footer (modified)
    ├── Logo + Tagline
    ├── Features (moved from body)
    ├── NewsletterBackup
    ├── Footer Links
    └── Copyright
```

---

## Section Specifications

### 1. Header

**Location:** `apps/web/app/page.tsx`

**Current State:**
- Sticky header với logo, nav, login button
- No tagline

**New Design:**
```tsx
<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    {/* Logo + Tagline */}
    <Link href="/" className="flex items-center gap-2.5 group">
      <LogoIcon />
      <div className="flex flex-col">
        <span className="font-display font-bold text-xl">Kho Học Liệu Số</span>
        <span className="text-xs text-muted-foreground">Nền tảng chia sẻ kiến thức</span>
      </div>
    </Link>
    
    {/* Navigation */}
    <nav>
      <Link href="/">Tin tức</Link>
      <Link href="/documents">Tài liệu</Link>
      <Button variant="gradient">Đăng nhập</Button>
    </nav>
  </div>
</header>
```

**Changes:**
- Add tagline "Nền tảng chia sẻ kiến thức" below logo
- Logo container changes from single line to flex-col
- Header height may need slight adjustment (h-16 → h-auto py-2 if needed)

---

### 2. Sticky Search Bar

**Location:** `apps/web/components/news/StickySearchBar.tsx` (NEW)

**Design:**
```tsx
<div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
  <div className="container mx-auto px-4 py-3 flex items-center gap-4">
    {/* Search Input */}
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Tìm kiếm tin tức..." 
        className="pl-10"
      />
    </div>
    
    {/* Filter Button */}
    <Button variant="outline" onClick={toggleFilter}>
      <SlidersHorizontal className="h-4 w-4 mr-2" />
      Filter
      {activeFilterCount > 0 && (
        <Badge className="ml-2">{activeFilterCount}</Badge>
      )}
    </Button>
    
    {/* View Toggle */}
    <ViewModeToggle mode={viewMode} onChange={setViewMode} />
  </div>
  
  {/* Collapsible Filters */}
  {filterOpen && (
    <div className="container mx-auto px-4 py-3 border-t border-border/50">
      <CategoryChips selected={category} onSelect={setCategory} />
    </div>
  )}
</div>
```

**Behavior:**
- Sticky ngay dưới header (top-16)
- Filter collapsed by default
- Click outside hoặc select category để collapse
- Badge hiển thị số filters active

---

### 3. Featured News (5 tin)

**Location:** `apps/web/components/features/news/FeaturedNews.tsx`

**Current:** 3 tin, magazine layout

**New Layout:**
```
┌──────────────────────────────┬─────────────────┐
│                              │ ┌─────────────┐ │
│                              │ │ Tin 2       │ │
│    HERO TIN 1               │ └─────────────┘ │
│    (2/3 width)              │ ┌─────────────┐ │
│                              │ │ Tin 3       │ │
│                              │ └─────────────┘ │
│                              │ ┌─────────────┐ │
│                              │ │ Tin 4       │ │
│                              │ └─────────────┘ │
│                              │ ┌─────────────┐ │
│                              │ │ Tin 5       │ │
│                              │ └─────────────┘ │
└──────────────────────────────┴─────────────────┘
```

**Implementation:**
```tsx
<section className="mb-10">
  <SectionHeader icon={<Flame />} title="Tin nổi bật" />
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Hero - 2/3 width */}
    <div className="lg:col-span-2">
      <NewsCard news={featured[0]} variant="hero" />
    </div>
    
    {/* Medium cards - 1/3 width */}
    <div className="space-y-4">
      {featured.slice(1, 5).map((news) => (
        <NewsCard news={news} variant="medium" />
      ))}
    </div>
  </div>
</section>
```

**Hero Card Variant (NEW):**
- Image height: ~480px
- Full-width gradient overlay
- Category badge (top-left, accent color)
- Title: text-2xl/3xl, white, line-clamp-2
- Summary: text-sm, white/80, line-clamp-1
- Meta: author avatar + name + date

**Medium Card Variant (NEW):**
- Horizontal layout
- Thumbnail: 120x80px, rounded
- Content: category badge (sm), title (1 line), author + relative time
- Hover: subtle background change

---

### 4. Quick Links

**Location:** `apps/web/components/home/QuickLinks.tsx` (NEW)

**Design:**
```tsx
<section className="py-8 border-y border-border/50 bg-muted/20">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Popular Documents - 60% */}
      <div className="md:col-span-3">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Tài liệu phổ biến
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {popularDocs.map((doc) => (
            <PopularDocCard key={doc.id} doc={doc} />
          ))}
        </div>
        <Link href="/documents" className="text-sm text-primary hover:underline mt-3 inline-block">
          Xem tất cả tài liệu →
        </Link>
      </div>
      
      {/* Trending Tags - 40% */}
      <div className="md:col-span-2">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Tags trending
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <Badge 
              key={tag.id} 
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ fontSize: `${0.75 + tag.weight * 0.25}rem` }}
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

**PopularDocCard:**
```tsx
<Link href={`/documents/${doc.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-muted/50 transition-colors">
  <FileText className="h-5 w-5 text-muted-foreground" />
  <div className="flex-1 min-w-0">
    <p className="font-medium truncate">{doc.title}</p>
    <p className="text-xs text-muted-foreground">{doc.downloadCount} lượt tải</p>
  </div>
</Link>
```

**Data Sources:**
- Popular docs: `GET /documents?sortBy=downloadCount&limit=4`
- Trending tags: Aggregate from news + documents keywords

---

### 5. News Grid

**Location:** `apps/web/components/features/news/NewsList.tsx`

**Changes:**
- Add section header with icon + count
- Accept `excludeIds` prop to exclude featured news
- Newsletter banner inline after row 2-3

**Implementation:**
```tsx
interface NewsListProps {
  initialCategory?: string;
  excludeIds?: string[]; // NEW
}

// In fetchNews:
const response = await newsApi.getAll({
  page,
  limit: meta.limit,
  category: selectedCategory || undefined,
  search: searchQuery || undefined,
  excludeIds: excludeIds, // NEW
});
```

**Section Header:**
```tsx
<div className="flex items-center justify-between mb-6">
  <h2 className="font-display text-2xl font-bold flex items-center gap-3">
    <Newspaper className="h-6 w-6 text-primary" />
    Tin tức mới nhất
  </h2>
  <span className="text-sm text-muted-foreground">
    {meta.total} bài viết
  </span>
</div>
```

**Newsletter Inline Placement:**
```tsx
// After row 2 (index 5 or 6)
{news.map((item, index) => (
  <Fragment key={item.id}>
    <NewsCard news={item} />
    {index === 5 && <NewsletterBanner />}
  </Fragment>
))}
```

---

### 6. Newsletter Banner

**Location:** `apps/web/components/news/NewsletterBanner.tsx` (NEW)

**Design:**
```tsx
<div className="col-span-full my-6">
  <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50 rounded-xl p-6 md:p-8">
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Text */}
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-display text-xl font-semibold mb-2 flex items-center justify-center md:justify-start gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Đăng ký nhận tin mới
        </h3>
        <p className="text-muted-foreground">
          Nhận thông báo khi có bài viết mới từ Kho Học Liệu Số
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
        <Input
          type="email"
          placeholder="Nhập email của bạn..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-64"
          required
        />
        <Button type="submit" variant="default">
          Đăng ký →
        </Button>
      </form>
    </div>
    
    <p className="text-xs text-muted-foreground text-center md:text-right mt-4">
      Chúng tôi tôn trọng quyền riêng tư. Hủy đăng ký bất cứ lúc nào.
    </p>
  </div>
</div>
```

**Behavior:**
- Email validation (HTML5 + custom)
- Submit: API call (endpoint TBD, mock for MVP)
- Success: Toast notification
- Error: Inline error message

---

### 7. Footer

**Location:** `apps/web/app/page.tsx`

**New Design:**
```tsx
<footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
  <div className="container mx-auto px-4 py-8">
    {/* Logo + Tagline */}
    <div className="flex items-center gap-2 mb-6">
      <LogoIcon />
      <div className="flex flex-col">
        <span className="font-display font-semibold">Kho Học Liệu Số</span>
        <span className="text-xs text-muted-foreground">Nền tảng chia sẻ kiến thức</span>
      </div>
    </div>
    
    {/* Features (moved from body) */}
    <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-y border-border/50">
      <Feature icon={<BookOpen />} text="Tài liệu đa dạng" />
      <Feature icon={<Newspaper />} text="Tin tức cập nhật" />
      <Feature icon={<Users />} text="Cộng đồng" />
    </div>
    
    {/* Newsletter Backup */}
    <div className="py-6 flex items-center justify-center gap-4">
      <span className="text-sm text-muted-foreground">📧 Missed the newsletter?</span>
      <Input placeholder="Email..." className="w-48" />
      <Button size="sm">Đăng ký</Button>
    </div>
    
    {/* Footer Links */}
    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-4">
      <a href="#" className="hover:text-foreground">Giới thiệu</a>
      <a href="#" className="hover:text-foreground">Điều khoản</a>
      <a href="#" className="hover:text-foreground">Liên hệ</a>
      <a href="#" className="hover:text-foreground">RSS</a>
    </div>
    
    {/* Copyright */}
    <p className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
      © {new Date().getFullYear()} Kho Học Liệu Số. Made with ❤️ for learners.
    </p>
  </div>
</footer>
```

---

## Data Flow

### Featured News
```
FeaturedNews component
  → newsApi.getFeatured(5)
  → Response: { data: News[], meta }
  → Render hero + medium cards
  → Pass excludeIds to NewsList
```

### News Grid with Exclusion
```
NewsList component
  → Props: { excludeIds: string[] }
  → newsApi.getAll({ page, limit, excludeIds })
  → Response: { data: News[], meta }
  → Render grid with inline newsletter
```

### Quick Links
```
QuickLinks component
  → documentsApi.getPopular(4)
  → tagsApi.getTrending(10)
  → Render popular docs + trending tags
```

---

## File Changes Summary

### Modified Files
| File | Changes |
|------|---------|
| `apps/web/app/page.tsx` | Remove hero, restructure layout, new footer |
| `apps/web/components/features/news/FeaturedNews.tsx` | 5 items, new layout |
| `apps/web/components/features/news/NewsList.tsx` | Sticky search, excludeIds prop |
| `apps/web/components/features/news/NewsCard.tsx` | Add hero & medium variants |

### New Files
| File | Purpose |
|------|---------|
| `apps/web/components/home/StickySearchBar.tsx` | Sticky search with collapsible filters |
| `apps/web/components/home/QuickLinks.tsx` | Popular docs + trending tags |
| `apps/web/components/news/NewsletterBanner.tsx` | Inline newsletter signup |

---

## API Considerations

### Current APIs (no changes needed)
- `GET /news` - supports pagination, category, search
- `GET /news/featured` - returns featured news

### Potential New APIs (optional, for future)
- `GET /documents?sort=downloadCount&limit=4` - popular documents
- `GET /tags/trending` - trending tags aggregation
- `POST /newsletter/subscribe` - newsletter subscription

**MVP Approach:** Mock data for quick links if APIs not ready

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Single column, stacked elements |
| Tablet (640-1024px) | 2 columns grid |
| Desktop (>1024px) | 3 columns grid, featured magazine layout |

---

## Success Criteria

- [ ] Hero section removed
- [ ] Header includes tagline
- [ ] Sticky search bar functional
- [ ] Featured news shows 5 items with magazine layout
- [ ] Quick links section displays popular docs + tags
- [ ] News grid excludes featured items
- [ ] Newsletter banner inline in grid
- [ ] Footer includes features + newsletter backup
- [ ] Responsive on mobile, tablet, desktop
- [ ] `pnpm --filter web lint` passes
- [ ] `pnpm --filter web build` passes

---

## Implementation Priority

1. **Phase 1: Structure** - Remove hero, restructure page.tsx, new header
2. **Phase 2: Featured** - Update FeaturedNews to 5 items with new layout
3. **Phase 3: Search** - Extract sticky search bar component
4. **Phase 4: Quick Links** - Create QuickLinks component
5. **Phase 5: Newsletter** - Create NewsletterBanner, integrate in grid
6. **Phase 6: Footer** - Update footer with features + newsletter
7. **Phase 7: Polish** - Responsive testing, accessibility, performance
