'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Folder, FolderPermission } from '@/lib/api';
import { foldersApi, permissionsApi, usersSearchApi } from '@/lib/api';
import { useAuth } from '@/app/providers';
import { MoreHorizontal, FolderPlus, Pencil, Trash2, Loader2, Shield, X, Search } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// Simple debounce utility
function debounce<T extends unknown[]>(
  func: (...args: T) => Promise<void>,
  wait: number
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => void func(...args), wait);
  };
}

interface FolderActionsProps {
  folder: Folder;
  onRefresh: () => void;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderActions({ folder, onRefresh, onSelectFolder }: FolderActionsProps) {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editFolderName, setEditFolderName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);

  // Permission management states
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Check if current user is the owner
  const isOwner = user?.id === folder.userId;

  // Load permissions
  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const data = await permissionsApi.list(folder.id);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast.error('Không thể tải danh sách quyền');
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Search users
  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const results = await usersSearchApi.search(query);
      // Filter out current user and users who already have permission
      const existingUserIds = new Set(permissions.map((p) => p.user.id));
      const filteredResults = results.filter(
        (u) => u.id !== user?.id && !existingUserIds.has(u.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Không thể tìm kiếm người dùng');
    } finally {
      setSearchingUsers(false);
    }
  };

  // Grant permission
  const handleGrantPermission = async (userId: string) => {
    try {
      setGrantingUserId(userId);
      await permissionsApi.grant(folder.id, { userId, canUpload: true });
      toast.success('Cấp quyền thành công!');
      setSearchQuery('');
      setSearchResults([]);
      await loadPermissions();
    } catch (error) {
      console.error('Failed to grant permission:', error);
      toast.error('Không thể cấp quyền');
    } finally {
      setGrantingUserId(null);
    }
  };

  // Revoke permission
  const handleRevokePermission = async (permissionId: string) => {
    try {
      setRevokingId(permissionId);
      await permissionsApi.revoke(folder.id, permissionId);
      toast.success('Thu hồi quyền thành công!');
      await loadPermissions();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      toast.error('Không thể thu hồi quyền');
    } finally {
      setRevokingId(null);
    }
  };

  // Handle permissions dialog open/close
  const handlePermissionsDialogOpen = (open: boolean) => {
    setShowPermissionsDialog(open);
    if (open) {
      void loadPermissions();
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    async (query: string) => {
      await handleSearchUsers(query);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, user?.id]
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

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
          {/* Permission management - only for owners */}
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePermissionsDialogOpen(true);
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Quản lý quyền truy cập
              </DropdownMenuItem>
            </>
          )}
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
              Bạn có chắc muốn xóa thư mục <strong>&quot;{folder.name}&quot;</strong>?
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

      {/* Permissions management dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={handlePermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quản lý quyền truy cập</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Search users */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cấp quyền cho người dùng</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted',
                        'border-b last:border-b-0'
                      )}
                      onClick={() => handleGrantPermission(result.id)}
                      disabled={grantingUserId === result.id}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{result.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.email}</p>
                      </div>
                      {grantingUserId === result.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current permissions list */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Người dùng có quyền upload</label>
              {loadingPermissions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Chưa có ai được cấp quyền
                </p>
              ) : (
                <div className="border rounded-md divide-y">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{permission.user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {permission.user.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRevokePermission(permission.id)}
                        disabled={revokingId === permission.id}
                      >
                        {revokingId === permission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePermissionsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
