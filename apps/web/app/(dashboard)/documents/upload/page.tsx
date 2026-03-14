'use client';

import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tải lên tài liệu"
        description="Đăng tải tài liệu mới vào kho học liệu số"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        }
      />

      <DocumentUpload />
    </div>
  );
}
