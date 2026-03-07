'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { News, newsApi } from '@/lib/api';
import { NewsForm } from '@/components/news/NewsForm';
import { Loader2 } from 'lucide-react';

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await newsApi.getById(id);
      setNews(data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      void fetchNews(params.id as string);
    }
  }, [fetchNews, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!news) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
        <p className="text-muted-foreground">Cập nhật nội dung bài viết</p>
      </div>

      <NewsForm news={news} />
    </div>
  );
}
