'use client';

import { Suspense } from 'react';
import { MyDocumentList } from '@/components/documents/MyDocumentList';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { Loader2 } from 'lucide-react';

function MyDocumentListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MyDocumentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tài liệu của tôi"
        description="Quản lý các tài liệu bạn đã tải lên"
      />

      <Suspense fallback={<MyDocumentListFallback />}>
        <MyDocumentList />
      </Suspense>
    </div>
  );
}
