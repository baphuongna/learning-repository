'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NewsCard } from './NewsCard';
import { News, NewsCategory, newsApi, categoriesApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonNewsCard } from '@/components/ui/skeleton';
import { EmptyNews, SearchIcon } from '@/components/ui/empty-state';
import { Search, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

/**
 * NewsList Component - EduModern Design System
 *
 * Features:
 * - Magazine-style grid layout
 * - Category filter chips
 * - Search with live results
 * - Grid/List view toggle
 * - Smooth loading skeletons
 * - Pagination with ellipsis
 */

interface NewsListProps {
  initialCategory?: string;
}

export function NewsList({ initialCategory }: NewsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch news when filters change
  useEffect(() => {
    fetchNews(meta.page);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsApi.getAll({
        page,
        limit: meta.limit,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      setNews(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Failed to fetch news:', err);
      setError(err.response?.data?.message || 'Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(1);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    fetchNews(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeletons
  if (loading && news.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
        </div>
        {/* Category skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-20 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonNewsCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && news.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
          <RefreshCw className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={() => fetchNews()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Tìm kiếm tin tức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="pr-12"
            />
          </div>
          <Button type="submit" variant="default" className="shrink-0">
            Tìm
          </Button>
        </form>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => handleCategoryFilter(null)}
        >
          Tất cả
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Results count */}
      {meta.total > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>
            Tìm thấy <strong className="text-foreground">{meta.total}</strong> bài viết
          </span>
        </div>
      )}

      {/* News Grid/List */}
      {news.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NewsCard news={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NewsCard news={item} variant="horizontal" />
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyNews description="Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn." />
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page === 1}
            onClick={() => handlePageChange(meta.page - 1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === meta.totalPages ||
                  Math.abs(page - meta.page) <= 1
                );
              })
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant={meta.page === page ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-9 ${meta.page === page ? 'shadow-sm' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={meta.page === meta.totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
            className="gap-1"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Results info */}
      {meta.total > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Hiển thị {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} trong số {meta.total} tin tức
        </p>
      )}
    </div>
  );
}
