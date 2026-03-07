'use client';

import { RustDocInspector } from '@/components/rust-docs/RustDocInspector';

export default function RustDocsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Rust File Inspector</h1>
        <p className="max-w-3xl text-muted-foreground">
          Trang này giúp bạn thấy luồng `frontend - rust-doc-service - SQLite` hoạt động ra sao khi inspect file trong trạng thái Rust V2 hiện tại.
        </p>
      </div>

      <RustDocInspector />
    </div>
  );
}
