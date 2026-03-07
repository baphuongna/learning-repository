'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Tổng quan',
  documents: 'Tài liệu',
  upload: 'Tải lên',
  'rust-docs': 'Rust Inspector',
  'my-documents': 'Tài liệu của tôi',
  'my-news': 'Bài viết của tôi',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  profile: 'Hồ sơ',
  'change-password': 'Đổi mật khẩu',
  admin: 'Quản trị',
  news: 'Tin tức',
  categories: 'Danh mục',
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || prettifySegment(segment);
    const isLast = index === segments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav aria-label="Dashboard breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      {items.map((item) => (
        <div key={item.href} className="inline-flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          {item.isLast ? (
            <span className="rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function prettifySegment(segment: string) {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
