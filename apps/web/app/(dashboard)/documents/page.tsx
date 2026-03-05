'use client';

import { Suspense, useState, useCallback } from 'react';
import { DocumentList } from '@/components/documents/DocumentList';
import { FolderTree } from '@/components/folders/FolderTree';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

// Simple document list fallback
function DocumentListFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function DocumentsPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [folderTreeKey, setFolderTreeKey] = useState(0);

  const handleSelectFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    // Refresh folder tree khi có thay đổi (tạo/xóa/sửa folder)
    setFolderTreeKey((prev) => prev + 1);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setFolderTreeKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-muted-foreground">Tổ chức và quản lý tài liệu theo thư mục</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex gap-6">
        {/* Folder tree sidebar */}
        <div className="w-64 flex-shrink-0 border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Thư mục</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectFolder(null)}
              className="text-xs"
            >
              Xem tất cả
            </Button>
          </div>
          <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Đang tải...</div>}>
            <FolderTree
              key={folderTreeKey}
              currentFolderId={currentFolderId}
              onSelectFolder={handleSelectFolder}
            />
          </Suspense>
        </div>

        {/* Document list */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<DocumentListFallback />}>
            <DocumentList
              key={refreshKey}
              folderId={currentFolderId}
              onRefresh={refreshKey}
              onFolderChange={handleFolderChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
