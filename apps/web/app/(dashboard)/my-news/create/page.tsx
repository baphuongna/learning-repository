'use client';

import { useRouter } from 'next/navigation';
import { NewsForm } from '@/components/news/NewsForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateNewsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">Viết bài mới</h1>
        <p className="text-muted-foreground">
          Tạo bài viết mới để chia sẻ với mọi người
        </p>
      </div>

      <NewsForm />
    </div>
  );
}
