'use client';

import { Suspense, useState, useCallback } from 'react';
import { MyDocumentList } from '@/components/documents/MyDocumentList';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

function MyDocumentListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MyDocumentsPage() {
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
        title="Tài liệu của tôi"
        description="Quản lý các tài liệu bạn đã tải lên"
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        }
      />

      <Suspense fallback={<MyDocumentListFallback />}>
        <MyDocumentList key={refreshKey} onRefresh={refreshKey} />
      </Suspense>
    </div>
  );
}
