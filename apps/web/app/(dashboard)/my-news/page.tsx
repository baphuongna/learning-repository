'use client';

import { Suspense } from 'react';
import { MyNewsList } from '@/components/news/MyNewsList';
import { Loader2 } from 'lucide-react';

function MyNewsListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MyNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bài viết của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý các bài viết bạn đã đăng
        </p>
      </div>

      <Suspense fallback={<MyNewsListFallback />}>
        <MyNewsList />
      </Suspense>
    </div>
  );
}
