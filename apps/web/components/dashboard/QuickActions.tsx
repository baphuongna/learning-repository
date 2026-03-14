'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Cpu,
  User,
  Newspaper,
  Settings,
  FolderPlus,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * QuickActions - Dashboard quick actions module
 *
 * Cung cấp các thao tác nhanh dựa trên role của user.
 * Theo spec: Productivity Workspace direction
 */

export type QuickActionItem = {
  /** Tiêu đề action */
  title: string;
  /** Mô tả ngắn */
  description?: string;
  /** Icon */
  icon: ReactNode;
  /** Href để navigate (ưu tiên sử dụng) */
  href?: string;
  /** onClick handler (dùng khi không có href) */
  onClick?: () => void;
  /** Variant styling */
  variant?: 'primary' | 'secondary' | 'accent';
  /** Chỉ hiển thị cho role cụ thể */
  roles?: string[];
  /** Disabled state */
  disabled?: boolean;
};

export type QuickActionsProps = {
  /** User role để filter actions */
  userRole?: string;
  /** Custom actions (override default) */
  actions?: QuickActionItem[];
  /** Layout variant */
  variant?: 'grid' | 'list';
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Additional class name */
  className?: string;
};

const variantStyles = {
  primary: 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30',
  secondary: 'border-border hover:border-primary/20 hover:bg-muted/50',
  accent: 'border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/30',
};

const iconVariantStyles = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-muted text-muted-foreground',
  accent: 'bg-accent/10 text-accent',
};

/**
 * Lấy default quick actions dựa trên role
 */
function getDefaultActions(userRole?: string): QuickActionItem[] {
  const baseActions: QuickActionItem[] = [
    {
      title: 'Tải lên tài liệu',
      description: 'Đưa file vào kho học liệu',
      icon: <Upload className="h-5 w-5" />,
      href: '/documents/upload',
      variant: 'primary',
    },
    {
      title: 'Xem tài liệu',
      description: 'Duyệt qua thư viện tài liệu',
      icon: <FileText className="h-5 w-5" />,
      href: '/documents',
      variant: 'secondary',
    },
    {
      title: 'Viết bài mới',
      description: 'Tạo bài viết mới',
      icon: <Newspaper className="h-5 w-5" />,
      href: '/my-news/create',
      variant: 'secondary',
    },
    {
      title: 'Phân tích tệp tin',
      description: 'Kiểm tra và tra cứu thông tin tệp đã phân tích',
      icon: <Cpu className="h-5 w-5" />,
      href: '/rust-docs',
      variant: 'accent',
    },
    {
      title: 'Cập nhật hồ sơ',
      description: 'Chỉnh sửa thông tin cá nhân',
      icon: <User className="h-5 w-5" />,
      href: '/profile',
      variant: 'secondary',
    },
  ];

  // Admin-only actions
  const adminActions: QuickActionItem[] = [
    {
      title: 'Quản lý tin tức',
      description: 'Duyệt và quản lý bài viết',
      icon: <Newspaper className="h-5 w-5" />,
      href: '/admin/news',
      variant: 'primary',
      roles: ['ADMIN'],
    },
    {
      title: 'Quản lý danh mục',
      description: 'Tổ chức danh mục tin tức',
      icon: <FolderPlus className="h-5 w-5" />,
      href: '/admin/categories',
      variant: 'secondary',
      roles: ['ADMIN'],
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Truy cập cấu hình admin',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/news',
      variant: 'secondary',
      roles: ['ADMIN'],
    },
  ];

  // Combine and filter by role
  const allActions = [...baseActions, ...adminActions];
  
  return allActions.filter((action) => {
    if (!action.roles) return true;
    return action.roles.includes(userRole ?? '');
  });
}

/**
 * QuickActionCard - Single action card component
 */
function QuickActionCard({
  action,
  variant = 'grid',
}: {
  action: QuickActionItem;
  variant: 'grid' | 'list';
}) {
  const router = useRouter();
  const actionVariant = action.variant ?? 'secondary';
  const isDisabled = action.disabled ?? false;

  const handleClick = () => {
    if (isDisabled) return;
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  const content = (
    <>
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg p-2.5 shrink-0 transition-colors',
          iconVariantStyles[actionVariant],
          isDisabled && 'opacity-50'
        )}
      >
        {action.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-medium text-foreground truncate',
              variant === 'grid' ? 'text-sm' : 'text-base'
            )}
          >
            {action.title}
          </h3>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {action.description && (
          <p
            className={cn(
              'text-muted-foreground truncate mt-0.5',
              variant === 'grid' ? 'text-xs' : 'text-sm'
            )}
          >
            {action.description}
          </p>
        )}
      </div>
    </>
  );

  const cardClassName = cn(
    'group cursor-pointer transition-all duration-200',
    variantStyles[actionVariant],
    isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none'
  );

  // Use Link for href, button for onClick
  if (action.href && !isDisabled) {
    return (
      <Link href={action.href} className="block">
        <Card
          variant="outline"
          className={cardClassName}
        >
          <CardContent
            className={cn(
              'flex items-center gap-3',
              variant === 'grid' ? 'p-4' : 'p-4'
            )}
          >
            {content}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card
      variant="outline"
      className={cardClassName}
      onClick={handleClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <CardContent
        className={cn(
          'flex items-center gap-3',
          variant === 'grid' ? 'p-4' : 'p-4'
        )}
      >
        {content}
      </CardContent>
    </Card>
  );
}

/**
 * QuickActions Component
 *
 * @example
 * ```tsx
 * <QuickActions userRole="ADMIN" columns={3} />
 * ```
 */
export function QuickActions({
  userRole,
  actions,
  variant = 'grid',
  columns = 3,
  className,
}: QuickActionsProps) {
  const displayActions = actions ?? getDefaultActions(userRole);

  if (displayActions.length === 0) {
    return null;
  }

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        variant === 'grid' && 'grid grid-cols-1 gap-3',
        variant === 'grid' && gridCols[columns],
        variant === 'list' && 'flex flex-col gap-2',
        className
      )}
    >
      {displayActions.map((action, index) => (
        <QuickActionCard
          key={`${action.title}-${action.href ?? index}`}
          action={action}
          variant={variant}
        />
      ))}
    </div>
  );
}

export default QuickActions;
