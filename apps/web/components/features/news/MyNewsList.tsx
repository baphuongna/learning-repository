'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsCard } from './NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { News, newsApi } from '@/lib/api';
import { Search, RefreshCw, Trash2, Edit, FileText, Plus } from 'lucide-react';

interface MyNewsListProps {
  onDelete?: (id: string) => void;
}

export function MyNewsList({ onDelete }: MyNewsListProps) {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsApi.getMy(page, 10);
      setNews(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to fetch my news:', err);
      setError('Không thể tải danh sách bài viết của bạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    try {
      setDeletingId(id);
      await newsApi.delete(id);
      await fetchNews(meta.page);
      onDelete?.(id);
    } catch (err) {
      console.error('Failed to delete news:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter local khi search
  const filteredNews = searchQuery.trim()
    ? news.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : news;

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm trong bài viết của bạn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchNews()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={() => router.push('/my-news/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Viết bài mới
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => (
          <div key={item.id} className="relative group">
            <NewsCard news={item} />
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/my-news/${item.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {searchQuery ? 'Không tìm thấy bài viết nào' : 'Bạn chưa có bài viết nào'}
          </p>
          <p className="text-sm mb-4">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác'
              : 'Hãy bắt đầu viết bài đầu tiên của bạn'}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push('/my-news/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Viết bài mới
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchNews(meta.page - 1)}
            disabled={meta.page === 1 || loading}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchNews(meta.page + 1)}
            disabled={meta.page === meta.totalPages || loading}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
