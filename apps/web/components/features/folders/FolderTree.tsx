'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder, foldersApi } from '@/lib/api';
import { ChevronRight, Folder as FolderIcon, Loader2, FolderOpen, FolderTree as FolderTreeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderActions } from './FolderActions';

interface FolderTreeProps {
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

// Hằng số cho indent - tăng lên 16px để rõ ràng hơn
const INDENT_SIZE = 16;
const BASE_PADDING = 8;

export function FolderTree({ currentFolderId, onSelectFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      // Lấy tất cả folders và build tree
      const allFolders = await foldersApi.getAll();
      setFolders(allFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Tự động expand các folder cha khi chọn folder con
  useEffect(() => {
    if (currentFolderId) {
      const expandParents = async () => {
        try {
          const breadcrumbs = await foldersApi.getBreadcrumbs(currentFolderId);
          setExpandedIds((prev) => {
            const newSet = new Set(prev);
            breadcrumbs.forEach((folder) => newSet.add(folder.id));
            return newSet;
          });
        } catch (error) {
          console.error('Failed to expand parents:', error);
        }
      };
      void expandParents();
    }
  }, [currentFolderId]);

  const toggleExpand = useCallback((folderId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Lấy root folders (không có parentId)
  const getRootFolders = useCallback(() => {
    return folders.filter((f) => !f.parentId);
  }, [folders]);

  // Lấy child folders của một folder
  const getChildFolders = useCallback((parentId: string) => {
    return folders.filter((f) => f.parentId === parentId);
  }, [folders]);

  // Render một folder item và đệ quy các children
  const renderFolderItem = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const childFolders = getChildFolders(folder.id);
    const hasChildren = childFolders.length > 0;
    const paddingLeft = depth * INDENT_SIZE + BASE_PADDING;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            // Base styles
            'group relative flex items-center gap-1 py-2 px-2 rounded-md cursor-pointer',
            'transition-all duration-150 ease-in-out',
            // Hover state - subtle
            'hover:bg-muted/60',
            // Active/selected state - prominent
            isSelected && [
              'bg-primary/10',
              'hover:bg-primary/15',
              'font-medium',
            ],
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {/* Left border indicator cho folder đang chọn */}
          {isSelected && (
            <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-full" />
          )}

          {/* Expand/collapse button - cải thiện affordance */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
            className={cn(
              'flex items-center justify-center',
              'w-5 h-5 rounded transition-all duration-150',
              'hover:bg-muted',
              hasChildren ? 'visible' : 'invisible'
            )}
            aria-label={isExpanded ? 'Thu gọn thư mục' : 'Mở rộng thư mục'}
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          </button>

          {/* Folder icon and name */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-colors',
                isSelected ? 'text-primary' : 'text-amber-500'
              )}
              strokeWidth={1.5}
            />
            <span className={cn(
              'truncate text-sm transition-colors',
              isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {folder.name}
            </span>
            {/* Document count badge */}
            {folder._count && folder._count.documents > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full ml-auto',
                'bg-muted text-muted-foreground',
                isSelected && 'bg-primary/20 text-primary'
              )}>
                {folder._count.documents}
              </span>
            )}
          </div>

          {/* Folder actions */}
          <FolderActions
            folder={folder}
            onRefresh={loadFolders}
            onSelectFolder={onSelectFolder}
          />
        </div>

        {/* Child folders với connecting line indicator */}
        {isExpanded && hasChildren && (
          <div
            className="relative ml-4 border-l border-border/40"
            style={{ marginLeft: `${paddingLeft + 8}px` }}
          >
            {childFolders.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rootFolders = getRootFolders();

  if (rootFolders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có thư mục nào</p>
        <p className="text-xs mt-1">Nhấn &quot;Tạo thư mục&quot; để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* All documents option - nổi bật hơn */}
      <button
        type="button"
        className={cn(
          'w-full flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer',
          'transition-all duration-150 ease-in-out',
          'hover:bg-muted/60',
          currentFolderId === null && [
            'bg-primary/10',
            'hover:bg-primary/15',
            'font-medium',
          ]
        )}
        onClick={() => onSelectFolder(null)}
      >
        <FolderOpen
          className={cn(
            'h-4 w-4 flex-shrink-0',
            currentFolderId === null ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <span className={cn(
          'text-sm',
          currentFolderId === null ? 'text-foreground' : 'text-muted-foreground'
        )}>
          Tất cả tài liệu
        </span>
      </button>

      {/* Folder tree section */}
      <div className="pt-2 mt-2 border-t">
        {/* Section header */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <FolderTreeIcon className="h-3 w-3" />
          <span>Thư mục</span>
        </div>

        {/* Folder items */}
        <div className="mt-1">
          {rootFolders.map((folder) => renderFolderItem(folder))}
        </div>
      </div>
    </div>
  );
}
