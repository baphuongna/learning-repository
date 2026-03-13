'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { NewsList } from '@/components/news/NewsList';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, BookOpen, Users, Newspaper, Mail, Rss } from 'lucide-react';

function NewsListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

/**
 * Homepage - Content-First Design
 *
 * Features:
 * - Header with tagline
 * - Featured news (5 items, magazine layout)
 * - Quick links (popular docs + trending tags)
 * - News grid with inline newsletter
 * - Footer with features + newsletter backup
 */

export default function HomePage() {
  const [excludeIds, setExcludeIds] = useState<string[]>([]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-foreground">
                Kho Học Liệu Số
              </span>
              <span className="text-xs text-muted-foreground">
                Nền tảng chia sẻ kiến thức
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-primary">
              Tin tức
            </Link>
            <Link href="/documents" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Tài liệu
            </Link>
            <Link href="/login">
              <Button variant="gradient" size="sm">
                Đăng nhập
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Featured News */}
          <Suspense fallback={<NewsListFallback />}>
            <FeaturedNews onExcludeIds={setExcludeIds} />
          </Suspense>

          {/* News List */}
          <Suspense fallback={<NewsListFallback />}>
            <NewsList excludeIds={excludeIds} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Logo + Tagline */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold">Kho Học Liệu Số</span>
              <span className="text-xs text-muted-foreground">Nền tảng chia sẻ kiến thức</span>
            </div>
          </div>
          
          {/* Features (moved from body) */}
          <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-y border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Tài liệu đa dạng</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Newspaper className="h-5 w-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">Tin tức cập nhật</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <span className="font-medium text-foreground">Cộng đồng</span>
            </div>
          </div>

          {/* Newsletter Backup */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Missed the newsletter?
            </span>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="h-9 w-48 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="sm">Đăng ký</Button>
            </form>
          </div>
          
          {/* Footer Links */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-4">
            <a href="#" className="hover:text-foreground transition-colors">Giới thiệu</a>
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Rss className="h-3 w-3" />
              RSS
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
            © {new Date().getFullYear()} Kho Học Liệu Số. Made with ❤️ for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
