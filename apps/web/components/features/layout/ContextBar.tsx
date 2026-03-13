'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ContextBarProps = {
  /**
   * Slot cho breadcrumb hoặc context navigation
   */
  breadcrumb?: ReactNode;
  /**
   * Slot cho search input
   */
  search?: ReactNode;
  /**
   * Slot cho filter/sort controls
   */
  filters?: ReactNode;
  /**
   * Slot cho primary actions (tải lên, tạo mới, v.v.)
   */
  actions?: ReactNode;
  /**
   * Slot cho view toggle (grid/list)
   */
  viewToggle?: ReactNode;
  /**
   * Class name tùy chỉnh
   */
  className?: string;
};

/**
 * ContextBar - thanh công cụ ngữ cảnh cho các trang nội dung.
 *
 * Cung cấp layout nhất quán cho:
 * - Breadcrumb navigation
 * - Search/filter controls
 * - Primary actions
 * - View toggle
 *
 * Sử dụng slots để linh hoạt với từng trang cụ thể.
 */
export function ContextBar({
  breadcrumb,
  search,
  filters,
  actions,
  viewToggle,
  className,
}: ContextBarProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumb section */}
      {breadcrumb ? <div className="context-bar__breadcrumb">{breadcrumb}</div> : null}

      {/* Controls section: search, filters, view toggle, actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        {search ? <div className="context-bar__search relative flex-1">{search}</div> : null}

        {/* Right side controls */}
        <div className="context-bar__controls flex flex-wrap items-center gap-2">
          {/* Filter/sort controls */}
          {filters}

          {/* View toggle */}
          {viewToggle}

          {/* Primary actions */}
          {actions}
        </div>
      </div>
    </div>
  );
}
