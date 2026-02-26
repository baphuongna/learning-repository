'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { News, newsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, ArrowLeft, FileText } from 'lucide-react';

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      fetchNews(params.slug as string);
    }
  }, [params.slug]);

  const fetchNews = async (slug: string) => {
    try {
      setLoading(true);
      const data = await newsApi.getBySlug(slug);
      setNews(data);
    } catch (err: any) {
      console.error('Failed to fetch news:', err);
      setError(err.response?.data?.message || 'Không tìm thấy bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Kho Học Liệu Số</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !news) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Kho Học Liệu Số</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error || 'Không tìm thấy bài viết'}</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Kho Học Liệu Số</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Tin tức
            </Link>
            <Link href="/documents" className="text-sm font-medium hover:text-primary transition-colors">
              Tài liệu
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          {/* Category & Title */}
          <Badge className="mb-4">{news.category.name}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {news.user.fullName}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(news.publishedAt || news.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {news.viewCount} lượt xem
            </span>
          </div>

          {/* Thumbnail */}
          {news.thumbnailUrl && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary */}
          <p className="text-lg text-muted-foreground mb-6 font-medium">
            {news.summary}
          </p>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Footer */}
          <div className="mt-12 pt-6 border-t">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang tin tức
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="secondary">{news.category.name}</Badge>
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kho Học Liệu Số. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
