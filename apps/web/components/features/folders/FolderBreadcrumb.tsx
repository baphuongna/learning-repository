'use client';

import { useState, useEffect } from 'react';
import { Folder as FolderType, foldersApi } from '@/lib/api';
import { ChevronRight, Home, Loader2, Folder as FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FolderBreadcrumb Component - EduModern Design System
 *
 * Features:
 * - Clean breadcrumb navigation for folder hierarchy
 * - Home icon for root
 * - Clickable path items with smooth transitions
 * - Current item highlighted prominently
 * - Compact design that integrates well with ContextBar
 */

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

  // Loading state - compact
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span className="text-muted-foreground text-xs">Đang tải...</span>
      </div>
    );
  }

  return (
    <nav
      className={cn('flex items-center gap-1 text-sm flex-wrap', className)}
      aria-label="Điều hướng thư mục"
    >
      {/* Root folder link - Home icon only when in subfolder, full label at root */}
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-150',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          !currentFolderId && [
            'text-foreground bg-primary/10',
            'hover:bg-primary/15',
            'font-medium',
          ]
        )}
        title="Về thư mục gốc"
      >
        <Home
          className={cn(
            'h-3.5 w-3.5 transition-colors',
            !currentFolderId ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        {/* Chỉ hiện chữ "Tài liệu" khi đang ở root */}
        {!currentFolderId && (
          <span className="hidden sm:inline">Tài liệu</span>
        )}
      </button>

      {/* Breadcrumb items */}
      {breadcrumbs.map((folder, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={folder.id} className="flex items-center gap-1">
            {/* Separator - subtle chevron */}
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0"
              aria-hidden="true"
            />

            {/* Folder link */}
            <button
              type="button"
              onClick={() => onNavigate(folder.id)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-150',
                'max-w-[180px]', // Giới hạn width để tránh overflow
                isLast
                  ? [
                      'text-foreground bg-primary/10 font-medium',
                      'hover:bg-primary/15',
                    ]
                  : [
                      'text-muted-foreground',
                      'hover:text-foreground hover:bg-muted/50',
                    ]
              )}
              title={folder.name}
            >
              <FolderIcon
                className={cn(
                  'h-3.5 w-3.5 flex-shrink-0 transition-colors',
                  isLast ? 'text-primary' : 'text-amber-500'
                )}
                strokeWidth={1.5}
              />
              <span className="truncate text-sm">{folder.name}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
