'use client';

import { useState, useEffect } from 'react';
import { Folder as FolderType, foldersApi } from '@/lib/api';
import { ChevronRight, Home, Loader2, Folder as FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FolderBreadcrumbProps {
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
  className?: string;
}

export function FolderBreadcrumb({ currentFolderId, onNavigate, className }: FolderBreadcrumbProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBreadcrumbs = async () => {
      if (!currentFolderId) {
        setBreadcrumbs([]);
        return;
      }

      try {
        setLoading(true);
        // Gọi API để lấy breadcrumb path
        const response = await foldersApi.getBreadcrumbs(currentFolderId);
        setBreadcrumbs(response);
      } catch (error) {
        console.error('Failed to load breadcrumbs:', error);
        setBreadcrumbs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBreadcrumbs();
  }, [currentFolderId]);

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm flex-wrap', className)}>
      {/* Root folder link */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate(null)}
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Tài liệu</span>
      </Button>

      {/* Breadcrumb items */}
      {breadcrumbs.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2',
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onNavigate(folder.id)}
          >
            <FolderIcon className="h-4 w-4 mr-1" />
            <span>{folder.name}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
