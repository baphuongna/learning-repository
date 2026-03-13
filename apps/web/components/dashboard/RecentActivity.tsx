'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Newspaper,
  Clock,
  ExternalLink,
  Loader2,
  Folder,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyActivity } from '@/components/ui/empty-state';
import { documentsApi, newsApi } from '@/lib/api';
import type { Document, News } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/**
 * RecentActivity - Dashboard recent work module
 *
 * Hiển thị các công việc gần đây của user:
 * - Tài liệu gần đây
 * - Bài viết gần đây
 *
 * Theo spec: Sử dụng existing data patterns, không invent backend endpoints
 */

export type RecentActivityProps = {
  /** Số lượng items hiển thị mỗi loại */
  limit?: number;
  /** Hiển thị section title */
  showTitle?: boolean;
  /** Custom title */
  title?: string;
  /** Additional class name */
  className?: string;
};

type ActivityItem = {
  id: string;
  type: 'document' | 'news';
  title: string;
  description?: string;
  href: string;
  timestamp: string;
  meta?: {
    label: string;
    icon?: 'folder';
  };
};

type LoadingState = {
  documents: boolean;
  news: boolean;
};

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * ActivityItemCard - Single activity item
 */
function ActivityItemCard({ item }: { item: ActivityItem }) {
  const Icon = item.type === 'document' ? FileText : Newspaper;

  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg p-2 shrink-0',
          item.type === 'document' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {item.title}
          </h4>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.timestamp)}
          </span>
          {item.meta && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {item.meta.icon === 'folder' ? <Folder className="h-3 w-3" /> : null}
                {item.meta.label}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * LoadingSkeleton - Loading state
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
          <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * RecentActivity Component
 *
 * Hiển thị combined recent activity từ documents và news.
 * Nếu không có dữ liệu, hiển thị empty state.
 *
 * @example
 * ```tsx
 * <RecentActivity limit={5} showTitle />
 * ```
 */
export function RecentActivity({
  limit = 5,
  showTitle = true,
  title = 'Hoạt động gần đây',
  className,
}: RecentActivityProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ documents: true, news: true });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading({ documents: true, news: true });

    // Fetch documents
    try {
      const docsResponse = await documentsApi.getMy(1, limit);
      setDocuments(docsResponse.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading((prev) => ({ ...prev, documents: false }));
    }

    // Fetch news
    try {
      const newsResponse = await newsApi.getMy(1, limit);
      setNews(newsResponse.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading((prev) => ({ ...prev, news: false }));
    }
  }, [limit]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Convert to activity items
  const activityItems: ActivityItem[] = [
    ...documents.map((doc): ActivityItem => ({
      id: doc.id,
      type: 'document' as const,
      title: doc.title,
      description: doc.description ?? undefined,
      href: `/documents/${doc.id}`,
      timestamp: doc.updatedAt,
      meta: doc.folder?.name
        ? {
            label: doc.folder.name,
            icon: 'folder',
          }
        : undefined,
    })),
    ...news.map((item): ActivityItem => ({
      id: item.id,
      type: 'news' as const,
      title: item.title,
      description: item.summary,
      href: `/my-news`,
      timestamp: item.updatedAt,
      meta: {
        label: item.isPublished ? 'Đã đăng' : 'Bản nháp',
      },
    })),
  ]
    // Sort by timestamp descending
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    // Limit total items
    .slice(0, limit);

  const isLoading = loading.documents || loading.news;
  const isEmpty = !isLoading && activityItems.length === 0;

  return (
    <Card variant="outline" className={cn('', className)}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {!isEmpty && !isLoading && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my-documents">Tài liệu</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my-news">Bài viết</Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="pt-0">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <EmptyActivity
            size="sm"
            description="Bắt đầu bằng cách tải lên tài liệu hoặc viết bài mới."
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/documents/upload">Tải lên</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/my-news">Viết bài</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="divide-y divide-border/50">
            {activityItems.map((item) => (
              <ActivityItemCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
