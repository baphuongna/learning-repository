'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { NewsList } from '@/components/news/NewsList';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Newspaper } from 'lucide-react';

function NewsListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Kho Học Liệu Số</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-primary">
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
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Tin tức & Sự kiện
          </h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin mới nhất về giáo dục và đào tạo
          </p>
        </div>

        {/* Featured News */}
        <Suspense fallback={<NewsListFallback />}>
          <FeaturedNews />
        </Suspense>

        {/* News List */}
        <Suspense fallback={<NewsListFallback />}>
          <NewsList />
        </Suspense>
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
