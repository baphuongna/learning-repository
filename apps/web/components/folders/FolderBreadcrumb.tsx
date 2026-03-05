'use client';

import { useState, useEffect } from 'react';
import { Folder as FolderType, foldersApi } from '@/lib/api';
import { ChevronRight, Home, Loader2, Folder as FolderIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FolderBreadcrumb Component - EduModern Design System
 *
 * Features:
 * - Clean breadcrumb navigation
 * - Home icon for root
 * - Clickable path items
 * - Current item highlighted
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

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <nav className={cn('flex items-center gap-0.5 text-sm flex-wrap', className)} aria-label="Breadcrumb">
      {/* Root folder link */}
      <button
        onClick={() => onNavigate(null)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          !currentFolderId && 'text-foreground bg-muted/50 font-medium'
        )}
      >
        <Home className="h-4 w-4" />
        <span>Tài liệu</span>
      </button>

      {/* Breadcrumb items */}
      {breadcrumbs.map((folder, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={folder.id} className="flex items-center gap-0.5">
            {/* Separator */}
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />

            {/* Folder link */}
            <button
              onClick={() => onNavigate(folder.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors',
                isLast
                  ? 'text-foreground bg-primary/10 font-medium hover:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <FolderIcon
                className={cn(
                  'h-4 w-4',
                  isLast ? 'text-primary' : 'text-amber-500'
                )}
                strokeWidth={1.5}
                fill="currentColor"
                fillOpacity={0.15}
              />
              <span className="max-w-[150px] truncate">{folder.name}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
