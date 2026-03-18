'use client';

import { useEffect, useState, useMemo } from 'react';
import { usersApi, getErrorMessage } from '@/lib/api';
import type { AdminUser, UserApprovalStatus } from '@/lib/api';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { ContextBar } from '@/components/features/layout/ContextBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Search, RefreshCw, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

/**
 * Helper function để render approval status badge
 * Backend uses: PENDING, ACTIVE, REJECTED
 */
function ApprovalStatusBadge({ status }: { status: UserApprovalStatus }) {
  const variants: Record<UserApprovalStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
    PENDING: {
      variant: 'secondary',
      icon: <Clock className="h-3 w-3 mr-1" />,
      label: 'Chờ phê duyệt',
    },
    ACTIVE: {
      variant: 'default',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      label: 'Đã kích hoạt',
    },
    REJECTED: {
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3 mr-1" />,
      label: 'Đã từ chối',
    },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className="flex items-center">
      {config.icon}
      {config.label}
    </Badge>
  );
}

/**
 * Tab filter component cho approval status
 * Backend uses: PENDING, ACTIVE, REJECTED
 */
function StatusFilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: UserApprovalStatus | 'ALL';
  onFilterChange: (filter: UserApprovalStatus | 'ALL') => void;
  counts: { ALL: number; PENDING: number; ACTIVE: number; REJECTED: number };
}) {
  const tabs: { key: UserApprovalStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: `Tất cả (${counts.ALL})` },
    { key: 'PENDING', label: `Chờ phê duyệt (${counts.PENDING})` },
    { key: 'ACTIVE', label: `Đã kích hoạt (${counts.ACTIVE})` },
    { key: 'REJECTED', label: `Đã từ chối (${counts.REJECTED})` },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeFilter === tab.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Admin Users Page - Quản lý phê duyệt người dùng
 *
 * Features:
 * - Danh sách users với search và filter
 * - Tabs lọc theo trạng thái phê duyệt
 * - Phê duyệt/từ chối user
 * - Responsive table design
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UserApprovalStatus | 'ALL'>('ALL');
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Backend returns plain array, not paginated response
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, userName: string) => {
    try {
      setActioningUserId(userId);
      await usersApi.approveUser(userId);
      toast.success(`Đã phê duyệt tài khoản "${userName}"`);
      await fetchUsers();
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể phê duyệt người dùng');
      toast.error(message);
    } finally {
      setActioningUserId(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    try {
      setActioningUserId(userId);
      // Backend expects optional reason in body
      await usersApi.rejectUser(userId);
      toast.success(`Đã từ chối tài khoản "${userName}"`);
      await fetchUsers();
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể từ chối người dùng');
      toast.error(message);
    } finally {
      setActioningUserId(null);
    }
  };

  const confirmApprove = (userId: string, userName: string) => {
    toast(
      <div className="space-y-3">
        <p className="font-medium">Xác nhận phê duyệt tài khoản?</p>
        <p className="text-sm text-muted-foreground">&ldquo;{userName}&rdquo;</p>
        <p className="text-sm">Người dùng sẽ có thể đăng nhập sau khi được phê duyệt.</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss()}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast.dismiss();
              void handleApprove(userId, userName);
            }}
          >
            Phê duyệt
          </Button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const confirmReject = (userId: string, userName: string) => {
    toast(
      <div className="space-y-3">
        <p className="font-medium">Xác nhận từ chối tài khoản?</p>
        <p className="text-sm text-muted-foreground">&ldquo;{userName}&rdquo;</p>
        <p className="text-sm text-destructive">Người dùng sẽ không thể đăng nhập.</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss()}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              toast.dismiss();
              void handleReject(userId, userName);
            }}
          >
            Từ chối
          </Button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count users by status (backend uses 'status' field)
  const statusCounts = useMemo(() => {
    const counts = { ALL: users.length, PENDING: 0, ACTIVE: 0, REJECTED: 0 };
    users.forEach((user) => {
      counts[user.status]++;
    });
    return counts;
  }, [users]);

  // Client-side filter: status + search
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.fullName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [users, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* Page Header */}
      <PageHeader
        title="Quản lý người dùng"
        description="Phê duyệt hoặc từ chối tài khoản người dùng mới đăng ký"
        actions={
          <Button variant="outline" size="sm" onClick={() => void fetchUsers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        }
      />

      {/* Status Filter Tabs */}
      <StatusFilterTabs
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        counts={statusCounts}
      />

      {/* Context Bar with Search */}
      <ContextBar
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo email hoặc họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        }
      />

      {/* Results summary */}
      {(searchQuery || statusFilter !== 'ALL') && (
        <div className="text-sm text-muted-foreground">
          Tìm thấy <strong className="text-foreground">{filteredUsers.length}</strong> người dùng
          {filteredUsers.length !== users.length && (
            <span> trong số {users.length} người dùng</span>
          )}
        </div>
      )}

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left font-medium text-sm">Người dùng</th>
                  <th className="p-4 text-left font-medium text-sm">Vai trò</th>
                  <th className="p-4 text-left font-medium text-sm">Trạng thái</th>
                  <th className="p-4 text-left font-medium text-sm">Ngày tạo</th>
                  <th className="p-4 text-right font-medium text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-sm">
                            <span className="text-white text-sm font-medium">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'ADMIN' ? 'Admin' : 'User'}
                        </Badge>
                        {user.canApproveUsers && (
                          <Badge variant="outline">Có quyền phê duyệt</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <ApprovalStatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {user.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => confirmApprove(user.id, user.fullName)}
                              disabled={actioningUserId === user.id}
                              title="Phê duyệt"
                            >
                              {actioningUserId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => confirmReject(user.id, user.fullName)}
                              disabled={actioningUserId === user.id}
                              title="Từ chối"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {user.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmReject(user.id, user.fullName)}
                            disabled={actioningUserId === user.id}
                            title="Khóa tài khoản"
                          >
                            {actioningUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {user.status === 'REJECTED' && (
                          <Button
                            size="sm"
                            onClick={() => confirmApprove(user.id, user.fullName)}
                            disabled={actioningUserId === user.id}
                            title="Kích hoạt lại"
                          >
                            {actioningUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4 font-medium">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Không tìm thấy người dùng nào'
              : 'Chưa có người dùng nào'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc'
              : 'Người dùng mới sẽ xuất hiện ở đây sau khi đăng ký'}
          </p>
        </div>
      )}
    </div>
  );
}
