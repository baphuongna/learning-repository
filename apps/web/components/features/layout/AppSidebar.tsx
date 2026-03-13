'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getNavigationGroups,
  isNavigationItemActive,
  type NavigationGroup,
} from './dashboard-nav-items';

/**
 * AppSidebar - Desktop sidebar + mobile drawer navigation
 *
 * Features:
 * - Grouped navigation by task
 * - Role-aware admin section
 * - Active state handling
 * - Responsive: fixed sidebar on desktop, drawer on mobile
 */

export type AppSidebarProps = {
  userRole?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function AppSidebar({ userRole, isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const groups = getNavigationGroups(userRole);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors" />
                <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Kho Học Liệu
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation groups */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {groups.map((group) => (
              <NavigationGroup
                key={group.title}
                group={group}
                pathname={pathname}
                onItemClick={onClose}
              />
            ))}
          </nav>

          {/* Sidebar footer - subtle branding */}
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Kho Học Liệu Số v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

type NavigationGroupProps = {
  group: NavigationGroup;
  pathname: string;
  onItemClick: () => void;
};

function NavigationGroup({ group, pathname, onItemClick }: NavigationGroupProps) {
  return (
    <div className="mb-4">
      {/* Group title */}
      <h3 className="px-3 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {group.title}
      </h3>

      {/* Group items */}
      <ul className="space-y-0.5">
        {group.items.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.match);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
