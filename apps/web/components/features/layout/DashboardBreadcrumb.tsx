'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROOT_LABEL, getRouteLabel } from './dashboard-nav-items';

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/dashboard') {
    return null;
  }

  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label = getRouteLabel(segment) || prettifySegment(segment);
    const isLast = index === segments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav
      aria-label="Dashboard breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground md:text-sm"
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{DASHBOARD_ROOT_LABEL}</span>
      </Link>

      {items.map((item) => (
        <div key={item.href} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          {item.isLast ? (
            <span className="rounded-md bg-primary/10 px-1.5 py-1 font-medium text-primary">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
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
