'use client';

import { DocumentUpload } from '@/components/documents/DocumentUpload';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tải lên tài liệu</h1>
        <p className="text-muted-foreground">
          Đăng tải tài liệu mới vào kho
        </p>
      </div>

      <DocumentUpload />
    </div>
  );
}
