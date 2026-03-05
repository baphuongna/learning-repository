'use client';

import Link from 'next/link';
import { Card, CardContent, CardBadge } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { News } from '@/lib/api';
import { Calendar, User, Eye, Clock, ArrowRight } from 'lucide-react';

/**
 * NewsCard Component - EduModern Design System
 *
 * Variants:
 * - default: Standard vertical card
 * - featured: Large hero card with overlay
 * - compact: Small horizontal card
 * - horizontal: Full-width horizontal layout
 */

interface NewsCardProps {
  news: News;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

export function NewsCard({ news, variant = 'default' }: NewsCardProps) {
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffMs = now.getTime() - published.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(date);
  };

  // Featured variant - large hero card with overlay
  if (variant === 'featured') {
    return (
      <Card variant="interactive" className="overflow-hidden group h-full">
        <Link href={`/news/${news.slug}`} className="block h-full">
          <div className="relative h-72 md:h-80 overflow-hidden">
            {news.thumbnailUrl ? (
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 flex items-center justify-center">
                <div className="text-6xl opacity-50">📰</div>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="accent" className="shadow-lg">
                {news.category.name}
              </Badge>
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                {news.title}
              </h2>
              <p className="text-white/80 line-clamp-2 mb-4">{news.summary}</p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {news.user.fullName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(news.publishedAt || news.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Compact variant - small horizontal card
  if (variant === 'compact') {
    return (
      <Card variant="interactive" className="overflow-hidden">
        <Link href={`/news/${news.slug}`} className="flex gap-3 p-3">
          {news.thumbnailUrl ? (
            <div className="relative h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <span className="text-xl opacity-50">📄</span>
            </div>
          )}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {news.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(news.publishedAt || news.createdAt)}
            </p>
          </div>
        </Link>
      </Card>
    );
  }

  // Horizontal variant - full-width horizontal layout
  if (variant === 'horizontal') {
    return (
      <Card variant="interactive" className="overflow-hidden">
        <Link href={`/news/${news.slug}`} className="flex flex-col md:flex-row">
          {news.thumbnailUrl ? (
            <div className="relative h-48 md:h-auto md:w-72 flex-shrink-0 overflow-hidden">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="h-48 md:h-auto md:w-72 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <span className="text-4xl opacity-50">📰</span>
            </div>
          )}
          <CardContent className="flex-1 p-5 flex flex-col justify-center">
            <Badge variant="soft" className="w-fit mb-3">
              {news.category.name}
            </Badge>
            <h3 className="font-display text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {news.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {news.summary}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {news.user.fullName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {news.viewCount}
                </span>
              </div>
              <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                Đọc tiếp
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Default variant - vertical card
  return (
    <Card variant="interactive" className="overflow-hidden group h-full flex flex-col">
      <Link href={`/news/${news.slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {news.thumbnailUrl ? (
            <img
              src={news.thumbnailUrl}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl opacity-50">📰</span>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="soft" size="sm" className="backdrop-blur-sm bg-background/80">
              {news.category.name}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {news.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-3">
            {news.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeTime(news.publishedAt || news.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {news.viewCount}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
