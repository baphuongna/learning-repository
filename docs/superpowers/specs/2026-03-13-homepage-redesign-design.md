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
- Header height: Keep `h-16` if single-line fits, adjust to `h-auto py-3` if tagline causes overflow
- Criteria: Header should not exceed 72px total height

---

### 2. Sticky Search Bar

**Location:** `apps/web/components/home/StickySearchBar.tsx` (NEW)

**Dependencies:**
- `CategoryChips`: Extract from existing NewsList.tsx (lines 188-206), renders category badges as filter chips
- `ViewModeToggle`: New inline component - two buttons (grid/list icons) with active state styling

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

**Component Definitions:**

**CategoryChips:**
```tsx
// Reuse existing category filter logic from NewsList.tsx
// Located at: apps/web/components/news/CategoryChips.tsx (NEW - extract from NewsList)
<div className="flex flex-wrap gap-2">
  <Badge
    variant={selected === null ? 'default' : 'outline'}
    className="cursor-pointer"
    onClick={() => onSelect(null)}
  >
    Tất cả
  </Badge>
  {categories.map((category) => (
    <Badge
      key={category.id}
      variant={selected === category.id ? 'default' : 'outline'}
      className="cursor-pointer"
      onClick={() => onSelect(category.id)}
    >
      {category.name}
    </Badge>
  ))}
</div>
```

**ViewModeToggle:**
```tsx
// New inline component - two buttons (grid/list icons) with active state
// Located at: apps/web/components/news/ViewModeToggle.tsx (NEW)
<div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
  <button
    onClick={() => onChange('grid')}
    className={`p-2 rounded-md transition-colors ${
      mode === 'grid'
        ? 'bg-background text-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
    aria-label="Grid view"
  >
    <LayoutGrid className="h-4 w-4" />
  </button>
  <button
    onClick={() => onChange('list')}
    className={`p-2 rounded-md transition-colors ${
      mode === 'list'
        ? 'bg-background text-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
    aria-label="List view"
  >
    <List className="h-4 w-4" />
  </button>
</div>
```

**Behavior:**
- Sticky ngay dưới header (top-16)
- Filter collapsed by default
- Click outside hoặc select category để collapse
- Badge hiển thị số filters active

**Toggle Mechanism:**
```tsx
// Filter toggle state
const [filterOpen, setFilterOpen] = useState(false);

// Close filter when clicking outside
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = document.getElementById('filter-panel');
    if (filterOpen && target && !target.contains(e.target as Node)) {
      setFilterOpen(false);
    }
  };
  
  if (filterOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [filterOpen]);

// Close filter after selecting a category
const handleCategorySelect = (categoryId: string | null) => {
  setSelectedCategory(categoryId);
  setFilterOpen(false);
  setMeta(prev => ({ ...prev, page: 1 }));
};
```

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
- Image height: 480px (fixed on desktop, min-h-64 on mobile)
- Full-width gradient overlay
- Category badge (top-left, accent color)
- Title: text-2xl/3xl, white, line-clamp-2
- Summary: text-sm, white/80, line-clamp-1
- Meta: author avatar + name + date
- Responsive: `h-[280px] md:h-[400px] lg:h-[480px]`

**Medium Card Variant (NEW):**
- Horizontal layout
- Thumbnail: 
  - Desktop: 120x80px fixed (w-[120px] h-[80px])
  - Mobile: 96x64px (w-24 h-16)
  - Object-fit: cover, rounded-lg
- Content: category badge (sm), title (1 line), author + relative time
- Hover: subtle background change (hover:bg-muted/50)

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
- Trending tags: Use mock data initially, later can implement `GET /tags/trending?limit=10`

**Tag Data Structure:**
```typescript
interface TrendingTag {
  id: string;
  name: string;
  count: number;  // Number of posts with this tag
  weight: number; // 0-1 normalized value for font sizing (0 = smallest, 1 = largest)
}
```

**MVP Approach:** Use mock data for quick links initially:
```typescript
// Mock data for trending tags (until API is ready)
const mockTrendingTags: TrendingTag[] = [
  { id: '1', name: 'React', count: 45, weight: 1.0 },
  { id: '2', name: 'NextJS', count: 38, weight: 0.85 },
  { id: '3', name: 'TypeScript', count: 32, weight: 0.7 },
  { id: '4', name: 'Rust', count: 28, weight: 0.6 },
  { id: '5', name: 'Prisma', count: 24, weight: 0.5 },
  { id: '6', name: 'Database', count: 20, weight: 0.4 },
  { id: '7', name: 'WebDev', count: 18, weight: 0.35 },
  { id: '8', name: 'Tutorial', count: 15, weight: 0.3 },
];
```

---

### 5. News Grid

**Location:** `apps/web/components/features/news/NewsList.tsx`

**Changes:**
- Add section header with icon + count
- Accept `excludeIds` prop to exclude featured news
- Newsletter banner inline after row 2

**Implementation:**
```tsx
interface NewsListProps {
  initialCategory?: string;
  excludeIds?: string[]; // NEW
}

// Frontend workaround for excludeIds (backend API doesn't support it yet)
// Filter in client after fetching
const fetchNews = useCallback(async (page = 1) => {
  try {
    setLoading(true);
    setError(null);
    const response = await newsApi.getAll({
      page,
      limit: meta.limit,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    });
    
    // Client-side filtering for excludeIds
    const filteredData = excludeIds 
      ? response.data.filter(item => !excludeIds.includes(item.id))
      : response.data;
    
    setNews(filteredData);
    setMeta(response.meta);
  } catch (err: any) {
    console.error('Failed to fetch news:', err);
    setError(err.response?.data?.message || 'Không thể tải tin tức');
  } finally {
    setLoading(false);
  }
}, [meta.limit, searchQuery, selectedCategory, excludeIds]);
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
- Position: After the 6th news card (end of row 2 in 3-column grid)
- Implementation approach: Render as a separate element, not inside the map loop
- Use CSS Grid `col-span-full` to span full width

```tsx
// CORRECT approach - render newsletter outside the map
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* First row (6 cards) */}
  {news.slice(0, 6).map((item, index) => (
    <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
      <NewsCard news={item} />
    </div>
  ))}
  
  {/* Newsletter banner - spans full width after row 2 */}
  <NewsletterBanner className="col-span-full" />
  
  {/* Remaining cards */}
  {news.slice(6).map((item, index) => (
    <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${(index + 6) * 50}ms` }}>
      <NewsCard news={item} />
    </div>
  ))}
</div>
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

**Newsletter API Specification:**
```typescript
// MVP: Mock implementation (no backend yet)
// File: apps/web/lib/api/newsletter.ts

interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
}

export const newsletterApi = {
  subscribe: async (email: string): Promise<NewsletterSubscribeResponse> => {
    // MVP: Simulate API call with 500ms delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          reject(new Error('Email không hợp lệ'));
          return;
        }
        
        // Simulate success (in production, this would call POST /api/newsletter/subscribe)
        console.log('[MVP] Newsletter subscription:', email);
        resolve({ success: true, message: 'Đăng ký thành công!' });
      }, 500);
    });
  },
};
```

**Error/Success UI Patterns:**
```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email.trim()) {
    setError('Vui lòng nhập email');
    return;
  }
  
  try {
    setSubmitting(true);
    setError(null);
    await newsletterApi.subscribe(email);
    setSuccess(true);
    setEmail('');
    // Optional: Show toast notification
    // toast.success('Đăng ký thành công! Kiểm tra email để xác nhận.');
  } catch (err: any) {
    setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  } finally {
    setSubmitting(false);
  }
};
```

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
| `apps/web/components/news/CategoryChips.tsx` | Extract category filter from NewsList |
| `apps/web/components/news/ViewModeToggle.tsx` | Grid/list view toggle |

---

## API Considerations

### Current APIs (no changes needed)
- `GET /news` - supports pagination, category, search
- `GET /news/featured` - returns featured news

### Potential New APIs (optional, for future)
- `GET /documents?sort=downloadCount&limit=4` - popular documents
- `GET /tags/trending` - trending tags aggregation
- `POST /newsletter/subscribe` - newsletter subscription

**MVP Approach:** Use mock data for quick links if APIs not ready

---

## Animation & Transition Specs

### Animation Classes (globals.css)
```css
/* Slide up animation */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out forwards;
}
```

### Keyframe Timing
| Animation | Duration | Delay Pattern |
|-----------|----------|---------------|
| `slide-up` | 300ms | Staggered: `${index * 50}ms` per card |

### When to Apply
- News cards entering viewport: `animate-slide-up`
- Featured news cards: `animate-slide-up` with staggered delays
- Newsletter banner: No animation (static position)

---

## Error & Success UI Patterns

### Error Display Pattern
```tsx
// Inline error message below input
{error && (
  <p className="text-sm text-destructive flex items-center gap-1 mt-2">
    <AlertCircle className="h-4 w-4" />
    {error}
  </p>
)}
```

### Success Display Pattern
```tsx
// Toast notification (using sonner or similar)
import { toast } from 'sonner';

// On success
toast.success('Thao tác thành công!', {
  description: 'Chi tiết bổ sung...',
  action: {
    label: 'Xem',
    onClick: () => router.push('/path')
  }
});
```

### Loading States
```tsx
// Skeleton loading for cards
<div className="space-y-3">
  <Skeleton className="h-48 w-full rounded-lg" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>

// Spinner for buttons
<Button disabled={submitting}>
  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
  Đang xử lý...
</Button>
```

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
