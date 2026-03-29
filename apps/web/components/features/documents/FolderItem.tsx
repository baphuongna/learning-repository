'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Folder as FolderType, FolderPermission } from '@/lib/api';
import { foldersApi, permissionsApi, usersSearchApi } from '@/lib/api';
import { useAuth } from '@/app/providers';
import { Folder as FolderIcon, MoreHorizontal, FolderPlus, Pencil, Trash2, Loader2, FileText, User, Shield, X, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Debounce helper for user search
function debounce<T extends unknown[]>(
  func: (...args: T) => Promise<void>,
  wait: number
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: T) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => void func(...args), wait);
  };
}

interface FolderItemProps {
  folder: FolderType;
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

  // Permission management states (owner-only feature)
  const { user } = useAuth();
  const isOwner = user?.id === folder.userId;
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

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

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchingUsers(true);
      const results = await usersSearchApi.search(query);
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
              Tạo thư mục mới bên trong &quot;{folder.name}&quot;
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
                Bạn có chắc muốn xóa thư mục <strong className="text-destructive">&quot;{folder.name}&quot;</strong>?
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

      {/* Permissions management dialog - owner only */}
      <Dialog open={showPermissionsDialog} onOpenChange={handlePermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Quản lý quyền truy cập
            </DialogTitle>
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

  // Render dropdown menu - only available for folder owners
  const renderDropdownMenu = () => {
    if (!isOwner) return null;
    return (
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
            handlePermissionsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          Quản lý quyền truy cập
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
  };

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

            {/* Shared badge - shown for non-owner folders */}
            {!isOwner && (
              <Badge variant="info" size="sm" className="mt-1" icon={<Share2 className="h-3 w-3" />}>
                Được chia sẻ
              </Badge>
            )}

            {/* Document count */}
            {folder._count && (
              <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {folder._count.documents} tài liệu
              </span>
            )}

            {/* Owner name - always show */}
            {folder.user && (
              <span className="text-xs text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                <User className="h-3 w-3" />
                {folder.user.fullName}
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

        {/* Shared badge - shown for non-owner folders */}
        {!isOwner && (
          <Badge variant="info" size="sm" icon={<Share2 className="h-3 w-3" />}>
            Được chia sẻ
          </Badge>
        )}

        {/* Owner name - always show */}
        {folder.user && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-24 truncate">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{folder.user.fullName}</span>
          </span>
        )}

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
