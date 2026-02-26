'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NewsCard } from './NewsCard';
import { News, NewsCategory, newsApi, categoriesApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

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
    // Reset to page 1 when filter changes
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    fetchNews(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error && news.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchNews()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tin tức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleCategoryFilter(null)}
        >
          Tất cả
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* News Grid */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Không có tin tức nào</p>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page === 1}
            onClick={() => handlePageChange(meta.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, and pages around current
                return (
                  page === 1 ||
                  page === meta.totalPages ||
                  Math.abs(page - meta.page) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis
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
                    variant={meta.page === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
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
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Results info */}
      {meta.total > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Hiển thị {news.length} trong số {meta.total} tin tức
        </p>
      )}
    </div>
  );
}
