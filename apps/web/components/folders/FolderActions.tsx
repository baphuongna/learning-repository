'use client';

import { useState } from 'react';
import { Folder, foldersApi } from '@/lib/api';
import { MoreHorizontal, FolderPlus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FolderActionsProps {
  folder: Folder;
  onRefresh: () => void;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderActions({ folder, onRefresh, onSelectFolder }: FolderActionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editFolderName, setEditFolderName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);

  // Tạo thư mục con
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

  // Đổi tên thư mục
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

  // Xóa thư mục
  const handleDeleteFolder = async () => {
    try {
      setIsLoading(true);
      await foldersApi.delete(folder.id);
      toast.success('Xóa thư mục thành công!');
      setShowDeleteDialog(false);
      // Chuyển về root folder sau khi xóa
      onSelectFolder(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Không thể xóa thư mục');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateDialog(true);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Tạo thư mục con
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setEditFolderName(folder.name);
              setShowEditDialog(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Đổi tên
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create subfolder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo thư mục con</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên thư mục</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa thư mục</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Bạn có chắc muốn xóa thư mục <strong>"{folder.name}"</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tất cả tài liệu trong thư mục này cũng sẽ bị xóa.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
