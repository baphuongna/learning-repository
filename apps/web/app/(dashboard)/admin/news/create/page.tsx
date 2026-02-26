'use client';

import { NewsForm } from '@/components/news/NewsForm';

export default function CreateNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tạo bài viết mới</h1>
        <p className="text-muted-foreground">Viết bài tin tức mới</p>
      </div>

      <NewsForm />
    </div>
  );
}
