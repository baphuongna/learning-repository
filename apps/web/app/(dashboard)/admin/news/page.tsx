'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { News, newsApi } from '@/lib/api';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { ContextBar } from '@/components/features/layout/ContextBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, Loader2, Search, RefreshCw, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner';

/**
 * Helper function để extract error message một cách an toàn
 * Tránh sử dụng `any` type assertion
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    return err.message || fallback;
  }
  // Kiểm tra xem error có property response không (Axios error pattern)
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return fallback;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    void fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getMy();
      setNews(response.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      setDeleting(id);
      await newsApi.delete(id);
      setNews((prev) => prev.filter((n) => n.id !== id));
      toast.success(`Đã xóa bài viết "${title}"`);
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể xóa bài viết');
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (id: string, title: string) => {
    toast(
      <div className="space-y-3">
        <p className="font-medium">Xác nhận xóa bài viết?</p>
        <p className="text-sm text-muted-foreground">&ldquo;{title}&rdquo;</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss()}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              toast.dismiss();
              void handleDelete(id, title);
            }}
          >
            Xóa
          </Button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Client-side search filter
  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news;
    const query = searchQuery.toLowerCase();
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.category?.name?.toLowerCase().includes(query)
    );
  }, [news, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* Page Header */}
      <PageHeader
        title="Quản lý tin tức"
        description="Tạo và quản lý tất cả bài viết tin tức trong hệ thống"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchNews()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={() => router.push('/admin/news/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết
            </Button>
          </div>
        }
      />

      {/* Context Bar with Search */}
      <ContextBar
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, slug hoặc danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        }
      />

      {/* Results summary */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Tìm thấy <strong className="text-foreground">{filteredNews.length}</strong> bài viết
          {filteredNews.length !== news.length && (
            <span> trong số {news.length} bài viết</span>
          )}
        </div>
      )}

      {/* News Table */}
      {filteredNews.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left font-medium text-sm">Tiêu đề</th>
                  <th className="p-4 text-left font-medium text-sm">Danh mục</th>
                  <th className="p-4 text-left font-medium text-sm">Trạng thái</th>
                  <th className="p-4 text-left font-medium text-sm">Lượt xem</th>
                  <th className="p-4 text-left font-medium text-sm">Ngày tạo</th>
                  <th className="p-4 text-right font-medium text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          /news/{item.slug}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{item.category?.name || 'N/A'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.isPublished ? (
                          <Badge>Đã xuất bản</Badge>
                        ) : (
                          <Badge variant="outline">Bản nháp</Badge>
                        )}
                        {item.isFeatured && (
                          <Badge variant="default">Nổi bật</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {item.viewCount}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild title="Xem trước">
                          <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/news/${item.id}/edit`)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirmDelete(item.id, item.title)}
                          disabled={deleting === item.id}
                          title="Xóa"
                        >
                          {deleting === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4 font-medium">
            {searchQuery ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác'
              : 'Bắt đầu tạo bài viết đầu tiên cho hệ thống'}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push('/admin/news/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết đầu tiên
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
