'use client';

import { Suspense } from 'react';
import { MyDocumentList } from '@/components/documents/MyDocumentList';
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
      <div>
        <h1 className="text-3xl font-bold">Tài liệu của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý các tài liệu bạn đã tải lên
        </p>
      </div>

      <Suspense fallback={<MyDocumentListFallback />}>
        <MyDocumentList />
      </Suspense>
    </div>
  );
}
