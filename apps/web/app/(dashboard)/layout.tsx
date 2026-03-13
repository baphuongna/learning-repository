'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { AppShell } from '@/components/features/layout/AppShell';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard Layout - EduModern Design System
 *
 * Features:
 * - Protected route check
 * - Loading state
 * - Authenticated app shell với sidebar navigation
 * - Breadcrumb context
 */

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Loading state - centered spinner with branding
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Đang tải...</p>
      </div>
    );
  }

  // Guard: Don't render anything if no user (redirect in progress)
  if (!user) {
    return null;
  }

  return (
    <AppShell userRole={user.role}>
      {children}
    </AppShell>
  );
}
