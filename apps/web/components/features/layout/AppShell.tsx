'use client';

import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

/**
 * AppShell - Layout wrapper cho authenticated area
 *
 * Cấu trúc:
 * - Sidebar trái cố định (desktop) / drawer (mobile)
 * - Topbar utility-oriented
 * - Content area với breadcrumb
 *
 * Theo spec: Productivity Workspace direction
 */

export type AppShellProps = {
  children: ReactNode;
  /** User role for role-aware navigation */
  userRole?: string;
  action?: ReactNode;
  searchPlaceholder?: string;
};

export function AppShell({ children, userRole, action, searchPlaceholder }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AppSidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <AppTopbar
          onMenuClick={() => setSidebarOpen(true)}
          action={action}
          searchPlaceholder={searchPlaceholder}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer - Reduced prominence for workspace feel */}
        <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Kho Học Liệu Số</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Điều khoản
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Liên hệ
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
