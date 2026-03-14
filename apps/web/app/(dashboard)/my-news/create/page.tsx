'use client';

import { useRouter } from 'next/navigation';
import { NewsForm } from '@/components/news/NewsForm';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateNewsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Viết bài mới"
        description="Tạo bài viết mới để chia sẻ với mọi người"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/my-news')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        }
      />

      <NewsForm />
    </div>
  );
}
