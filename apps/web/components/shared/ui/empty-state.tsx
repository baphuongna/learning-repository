'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * EmptyState Component
 * Hiển thị khi không có dữ liệu - với illustration và action button
 *
 * @example
 * <EmptyState
 *   icon={<FileIcon />}
 *   title="Chưa có tài liệu"
 *   description="Bắt đầu tải lên tài liệu đầu tiên của bạn"
 *   action={<Button>Tải lên</Button>}
 * />
 */

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon illustration */
  icon?: React.ReactNode;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Action button hoặc element */
  action?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        container: 'py-6',
        icon: 'h-12 w-12',
        title: 'text-base',
        description: 'text-sm',
      },
      md: {
        container: 'py-12',
        icon: 'h-16 w-16',
        title: 'text-lg',
        description: 'text-sm',
      },
      lg: {
        container: 'py-20',
        icon: 'h-24 w-24',
        title: 'text-xl',
        description: 'text-base',
      },
    };

    const sizes = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'mb-4 text-muted-foreground/50',
              sizes.icon
            )}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h3
          className={cn(
            'font-display font-medium text-foreground',
            sizes.title
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={cn(
              'mt-2 max-w-sm text-muted-foreground',
              sizes.description
            )}
          >
            {description}
          </p>
        )}

        {/* Action */}
        {action && <div className="mt-6">{action}</div>}

        {/* Additional content */}
        {children}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

/* ============================================
   Preset Empty State Components
   ============================================ */

// Icons as inline SVGs for convenience
const DocumentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const NewsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

/** Empty state cho documents */
interface EmptyDocumentsProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  onUpload?: () => void;
  uploadButtonText?: string;
}

const EmptyDocuments = React.forwardRef<HTMLDivElement, EmptyDocumentsProps>(
  ({ onUpload, uploadButtonText = 'Tải lên tài liệu', description, ...props }, ref) => (
    <EmptyState
      ref={ref}
      icon={<DocumentIcon />}
      title="Chưa có tài liệu"
      description={description || 'Bắt đầu tải lên tài liệu đầu tiên của bạn để lưu trữ và chia sẻ.'}
      action={
        onUpload && (
          <Button onClick={onUpload} className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            {uploadButtonText}
          </Button>
        )
      }
      {...props}
    />
  )
);
EmptyDocuments.displayName = 'EmptyDocuments';

/** Empty state cho folders */
const EmptyFolders = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'icon' | 'title'>
>(({ description, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={<FolderIcon />}
    title="Chưa có thư mục"
    description={description || 'Tạo thư mục để tổ chức tài liệu của bạn tốt hơn.'}
    {...props}
  />
));
EmptyFolders.displayName = 'EmptyFolders';

/** Empty state cho search results */
const EmptySearchResults = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'icon' | 'title'> & { query?: string }
>(({ description, query, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={<SearchIcon />}
    title="Không tìm thấy kết quả"
    description={
      description ||
      (query
        ? `Không có kết quả nào khớp với "${query}". Thử tìm kiếm với từ khóa khác.`
        : 'Thử tìm kiếm với từ khóa khác.')
    }
    {...props}
  />
));
EmptySearchResults.displayName = 'EmptySearchResults';

/** Empty state cho news */
const EmptyNews = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'icon' | 'title'>
>(({ description, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={<NewsIcon />}
    title="Chưa có tin tức"
    description={description || 'Các bài viết mới sẽ được cập nhật sớm.'}
    {...props}
  />
));
EmptyNews.displayName = 'EmptyNews';

/** Empty state cho users/activity */
const EmptyActivity = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, 'icon' | 'title'>
>(({ description, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon={<UserIcon />}
    title="Chưa có hoạt động"
    description={description || 'Hoạt động của bạn sẽ hiển thị ở đây.'}
    {...props}
  />
));
EmptyActivity.displayName = 'EmptyActivity';

export {
  EmptyState,
  EmptyDocuments,
  EmptyFolders,
  EmptySearchResults,
  EmptyNews,
  EmptyActivity,
  DocumentIcon,
  FolderIcon,
  SearchIcon,
  NewsIcon,
  UserIcon,
};
export type { EmptyStateProps };
