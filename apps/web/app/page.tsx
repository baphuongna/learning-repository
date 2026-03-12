'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { NewsList } from '@/components/news/NewsList';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { Loader2, FileText, Newspaper, BookOpen, Users } from 'lucide-react';

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
 * Homepage - EduModern Design System
 *
 * Features:
 * - Hero section with gradient background
 * - Feature highlights
 * - Featured news section
 * - Clean footer
 */

export default function HomePage() {
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
            <span className="font-display font-bold text-xl text-foreground">
              Kho Học Liệu Số
            </span>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

        <div className="relative container mx-auto px-4 py-10 lg:py-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-slide-up">
              <GradientText variant="primary">
                Kho Học Liệu Số
              </GradientText>
              <br />
              <span className="text-foreground">Cho cộng đồng học tập</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto animate-slide-up animation-delay-100">
              Khám phá hàng ngàn tài liệu học tập và bài viết chia sẻ kiến thức từ cộng đồng.
            </p>

            {/* CTA Button */}
            <div className="animate-slide-up animation-delay-200">
              <Link href="/documents">
                <Button variant="gradient" size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  <BookOpen className="h-5 w-5" />
                  Khám phá tài liệu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Tài liệu đa dạng</span>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Newspaper className="h-5 w-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">Tin tức cập nhật</span>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <span className="font-medium text-foreground">Cộng đồng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Featured News */}
          <Suspense fallback={<NewsListFallback />}>
            <FeaturedNews />
          </Suspense>

          {/* News List */}
          <Suspense fallback={<NewsListFallback />}>
            <NewsList />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold">Kho Học Liệu Số</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Giới thiệu</a>
              <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kho Học Liệu Số
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
