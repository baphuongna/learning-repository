'use client';

import { Suspense, useState, useCallback } from 'react';
import { MyNewsList } from '@/components/news/MyNewsList';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

function MyNewsListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MyNewsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* Page Header */}
      <PageHeader
        title="Bài viết của tôi"
        description="Quản lý và chỉnh sửa các bài viết bạn đã đăng"
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        }
      />

      {/* News list */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<MyNewsListFallback />}>
          <MyNewsList key={refreshKey} onRefresh={refreshKey} />
        </Suspense>
      </div>
    </div>
  );
}
