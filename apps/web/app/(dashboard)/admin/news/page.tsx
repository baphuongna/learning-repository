'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { News, newsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getMy();
      setNews(response.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      setDeleting(id);
      await newsApi.delete(id);
      setNews(news.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa bài viết');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tin tức</h1>
          <p className="text-muted-foreground">Tạo và quản lý bài viết tin tức</p>
        </div>
        <Button onClick={() => router.push('/admin/news/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài viết mới
        </Button>
      </div>

      {/* News Table */}
      {news.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left font-medium">Tiêu đề</th>
                  <th className="p-4 text-left font-medium">Danh mục</th>
                  <th className="p-4 text-left font-medium">Trạng thái</th>
                  <th className="p-4 text-left font-medium">Lượt xem</th>
                  <th className="p-4 text-left font-medium">Ngày tạo</th>
                  <th className="p-4 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/50">
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
                      {item.isPublished ? (
                        <Badge>Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="outline">Bản nháp</Badge>
                      )}
                      {item.isFeatured && (
                        <Badge variant="default" className="ml-1">Nổi bật</Badge>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {item.viewCount}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/news/${item.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
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
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Chưa có bài viết nào</p>
          <Button onClick={() => router.push('/admin/news/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
}
