'use client';

import { useState } from 'react';
import { Folder, foldersApi } from '@/lib/api';
import { Folder as FolderIcon, MoreHorizontal, FolderPlus, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ViewMode } from './ViewToggle';
import { cn } from '@/lib/utils';

/**
 * FolderItem Component - EduModern Design System
 *
 * Features:
 * - Google Drive style folder design
 * - Warm amber/yellow folder color
 * - Smooth hover effects
 * - Context menu actions
 */

interface FolderItemProps {
  folder: Folder;
  viewMode: ViewMode;
  onOpen: (folderId: string) => void;
  onRefresh: () => void;
}

export function FolderItem({ folder, viewMode, onOpen, onRefresh }: FolderItemProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editFolderName, setEditFolderName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubfolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    try {
      setIsLoading(true);
      await foldersApi.create({
        name: newFolderName.trim(),
        parentId: folder.id,
      });
      toast.success('Tạo thư mục con thành công!');
      setShowCreateDialog(false);
      setNewFolderName('');
      onRefresh();
    } catch (error) {
      console.error('Failed to create subfolder:', error);
      toast.error('Không thể tạo thư mục con');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFolder = async () => {
    if (!editFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    try {
      setIsLoading(true);
      await foldersApi.update(folder.id, { name: editFolderName.trim() });
      toast.success('Cập nhật thư mục thành công!');
      setShowEditDialog(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update folder:', error);
      toast.error('Không thể cập nhật thư mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      setIsLoading(true);
      await foldersApi.delete(folder.id);
      toast.success('Xóa thư mục thành công!');
      setShowDeleteDialog(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Không thể xóa thư mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoubleClick = () => {
    onOpen(folder.id);
  };

  // Render dialogs (shared between both views)
  const renderDialogs = () => (
    <>
      {/* Create subfolder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              Tạo thư mục con
            </DialogTitle>
            <DialogDescription>
              Tạo thư mục mới bên trong "{folder.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nhập tên thư mục con..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateSubfolder();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateSubfolder} disabled={isLoading || !newFolderName.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit folder dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Đổi tên thư mục
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nhập tên mới..."
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditFolder();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditFolder} disabled={isLoading || !editFolderName.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Xóa thư mục
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium">
                Bạn có chắc muốn xóa thư mục <strong className="text-destructive">"{folder.name}"</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Tất cả tài liệu trong thư mục này cũng sẽ bị xóa.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Xóa thư mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // Render dropdown menu
  const renderDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'h-7 w-7 rounded-lg flex items-center justify-center transition-all',
            'opacity-0 group-hover:opacity-100',
            'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setShowCreateDialog(true);
          }}
          className="gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          Tạo thư mục con
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setEditFolderName(folder.name);
            setShowEditDialog(true);
          }}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Đổi tên
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
          className="text-destructive focus:text-destructive gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Grid view - Google Drive style
  if (viewMode === 'grid') {
    return (
      <>
        <div
          className="group relative rounded-xl p-4 hover:bg-gradient-to-br hover:from-accent/10 hover:to-primary/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex flex-col items-center text-center">
            {/* Folder Icon */}
            <div className="relative mb-3">
              <div className="relative">
                {/* Folder shadow */}
                <div className="absolute inset-0 bg-amber-400/20 blur-lg rounded-full transform scale-90" />
                {/* Folder icon */}
                <FolderIcon
                  className="h-16 w-16 text-amber-500 drop-shadow-md relative z-10"
                  strokeWidth={1.5}
                  fill="currentColor"
                  fillOpacity={0.15}
                />
              </div>
              {/* Dropdown menu button */}
              <div className="absolute -top-1 -right-1 z-20">
                {renderDropdownMenu()}
              </div>
            </div>

            {/* Folder name */}
            <span className="font-medium text-sm truncate w-full px-1 text-foreground">
              {folder.name}
            </span>

            {/* Document count */}
            {folder._count && (
              <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {folder._count.documents} tài liệu
              </span>
            )}
          </div>
        </div>
        {renderDialogs()}
      </>
    );
  }

  // List view
  return (
    <>
      <div
        className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
        onDoubleClick={handleDoubleClick}
      >
        {/* Folder Icon */}
        <div className="relative flex-shrink-0">
          <FolderIcon
            className="h-5 w-5 text-amber-500"
            strokeWidth={1.5}
            fill="currentColor"
            fillOpacity={0.15}
          />
        </div>

        {/* Folder name */}
        <span className="font-medium flex-1 truncate text-foreground">
          {folder.name}
        </span>

        {/* Document count */}
        {folder._count && (
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {folder._count.documents}
          </span>
        )}

        {/* Updated date */}
        <span className="text-xs text-muted-foreground w-28 text-right">
          {new Date(folder.updatedAt).toLocaleDateString('vi-VN')}
        </span>

        {/* Actions */}
        {renderDropdownMenu()}
      </div>
      {renderDialogs()}
    </>
  );
}
