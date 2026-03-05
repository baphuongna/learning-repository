'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder, foldersApi } from '@/lib/api';
import { ChevronRight, ChevronDown, Folder as FolderIcon, Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderActions } from './FolderActions';

interface FolderTreeProps {
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

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

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent',
            isSelected && 'bg-accent text-accent-foreground',
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* Folder icon and name */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon
              className={cn(
                'h-4 w-4 flex-shrink-0',
                isSelected ? 'text-primary' : 'text-yellow-500'
              )}
            />
            <span className="truncate text-sm">{folder.name}</span>
            {folder._count && folder._count.documents > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">
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

        {/* Child folders */}
        {isExpanded && hasChildren && (
          <div>
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
        <p className="text-xs mt-1">Nhấn "Tạo thư mục" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* All documents option */}
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent',
          currentFolderId === null && 'bg-accent text-accent-foreground'
        )}
        onClick={() => onSelectFolder(null)}
      >
        <FolderOpen className="h-4 w-4" />
        <span className="text-sm">Tất cả tài liệu</span>
      </div>

      {/* Folder tree */}
      <div className="border-t pt-2 mt-2">
        {rootFolders.map((folder) => renderFolderItem(folder))}
      </div>
    </div>
  );
}
