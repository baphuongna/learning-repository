'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardBadge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/app/providers';
import { authApi, newsApi } from '@/lib/api';
import {
  FileText,
  Newspaper,
  User,
  Shield,
  Sparkles,
  TrendingUp,
  Loader2,
} from 'lucide-react';

type DashboardProfile = {
  _count?: {
    documents?: number;
  };
};

/**
 * DashboardOverview - Command-center style authenticated homepage
 *
 * Theo spec "Productivity Workspace":
 * - Welcome / Utility hero với greeting và context
 * - Recent work module (tài liệu, bài viết gần đây)
 * - Quick actions module (role-aware)
 * - Personal / Role summary (stats và role info)
 *
 * Layout:
 * - Desktop: Two-column (main + sidebar)
 * - Mobile: Stacked
 */

type ProfileStats = {
  documentsCount: number;
  newsCount: number;
  role: string;
};

export function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch profile for document count
        const profile = (await authApi.getProfile()) as DashboardProfile;

        // Fetch news count
        const newsResponse = await newsApi.getMy(1, 1);

        // Extract counts - using type-safe access
        const documentsCount = profile._count?.documents ?? 0;

        setStats({
          documentsCount,
          newsCount: newsResponse.meta.total,
          role: user?.role ?? 'USER',
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        // Fallback to defaults
        setStats({
          documentsCount: 0,
          newsCount: 0,
          role: user?.role ?? 'USER',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
  };

  // Get role subtitle
  const getRoleSubtitle = (role: string) => {
    return role === 'ADMIN'
      ? 'Bạn có toàn quyền quản lý hệ thống'
      : 'Khám phá và chia sẻ tài liệu học tập';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header với welcome message */}
      <PageHeader
        title={`${getGreeting()}, ${user?.fullName?.split(' ').pop() ?? 'bạn'}!`}
        description="Chào mừng bạn đến với Kho Học Liệu Số. Tiếp tục công việc hoặc khám phá tài nguyên."
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Hero Card */}
          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Workspace của bạn
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {getRoleDisplayName(stats?.role ?? 'USER')}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {getRoleSubtitle(stats?.role ?? 'USER')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default">
                    <Link href="/documents/upload">Tải lên tài liệu</Link>
                  </Button>
                  {isAdmin && (
                    <Button asChild variant="outline">
                      <Link href="/admin/news">Quản trị</Link>
                    </Button>
                  )}
                </div>
              </div>
              {/* Decorative gradient */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity limit={5} showTitle title="Công việc gần đây" />
        </div>

        {/* Sidebar Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Personal Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Documents Stat */}
            <Card variant="outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tài liệu
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-foreground">
                    {stats?.documentsCount ?? 0}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    đã tải lên
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 h-auto p-0 text-primary" asChild>
                  <Link href="/my-documents" className="flex items-center gap-1">
                    Xem tất cả
                    <TrendingUp className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* News Stat */}
            <Card variant="outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bài viết
                </CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-foreground">
                    {stats?.newsCount ?? 0}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    đã viết
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 h-auto p-0 text-primary" asChild>
                  <Link href="/my-news" className="flex items-center gap-1">
                    Xem tất cả
                    <TrendingUp className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Role Card */}
            <Card variant="outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vai trò
                </CardTitle>
                {isAdmin ? (
                  <Shield className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-foreground">
                    {getRoleDisplayName(stats?.role ?? 'USER')}
                  </div>
                  {isAdmin && (
                    <CardBadge variant="primary">Admin</CardBadge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {user?.email}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card variant="outline">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <QuickActions userRole={user?.role} variant="list" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
