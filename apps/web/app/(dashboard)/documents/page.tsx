'use client';

import { Suspense } from 'react';
import { DocumentList } from '@/components/documents/DocumentList';
import { Loader2 } from 'lucide-react';

function DocumentListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tài liệu</h1>
        <p className="text-muted-foreground">
          Danh sách tài liệu trong kho
        </p>
      </div>

      <Suspense fallback={<DocumentListFallback />}>
        <DocumentList />
      </Suspense>
    </div>
  );
}
