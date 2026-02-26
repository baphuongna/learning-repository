'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { News } from '@/lib/api';
import { Calendar, User, Eye } from 'lucide-react';

interface NewsCardProps {
  news: News;
  variant?: 'default' | 'featured' | 'compact';
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

  // Featured variant - larger card with image
  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <Link href={`/news/${news.slug}`}>
          {news.thumbnailUrl ? (
            <div className="relative h-64 w-full bg-muted">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="relative h-64 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">📰</span>
            </div>
          )}
          <CardContent className="p-6">
            <Badge className="mb-3">{news.category.name}</Badge>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {news.title}
            </h2>
            <p className="text-muted-foreground line-clamp-2 mb-4">{news.summary}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {news.user.fullName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(news.publishedAt || news.createdAt)}
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Compact variant - smaller horizontal card
  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <Link href={`/news/${news.slug}`} className="flex gap-3 p-3">
          {news.thumbnailUrl ? (
            <div className="relative h-16 w-20 flex-shrink-0 rounded overflow-hidden">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-20 flex-shrink-0 rounded bg-muted flex items-center justify-center">
              <span className="text-xl">📄</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">
              {news.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(news.publishedAt || news.createdAt)}
            </p>
          </div>
        </Link>
      </Card>
    );
  }

  // Default variant - vertical card
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <Link href={`/news/${news.slug}`}>
        {news.thumbnailUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={news.thumbnailUrl}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-t-lg">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            {news.category.name}
          </Badge>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {news.summary}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{formatDate(news.publishedAt || news.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {news.viewCount}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
