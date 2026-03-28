'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { publicNavigationItems, isNavigationItemActive } from './dashboard-nav-items';

export type PublicHeaderNavProps = {
  showLogin?: boolean;
  className?: string;
};

export function PublicHeaderNav({ showLogin = true, className }: PublicHeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center gap-6', className)}>
      {publicNavigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors',
            isNavigationItemActive(pathname, item.match)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary'
          )}
        >
          {item.title}
        </Link>
      ))}

      {showLogin ? (
        <Link href="/login">
          <Button variant="gradient" size="sm">
            Đăng nhập
          </Button>
        </Link>
      ) : null}
    </nav>
  );
}
