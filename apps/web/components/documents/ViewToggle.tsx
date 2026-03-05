'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ViewToggle Component - EduModern Design System
 *
 * Features:
 * - Modern segmented control style
 * - Smooth transitions
 * - Accessible tooltips
 */

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center p-1 bg-muted/50 rounded-lg">
      <button
        className={cn(
          'relative flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200',
          viewMode === 'grid'
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewModeChange('grid')}
        title="Xem dạng lưới"
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        className={cn(
          'relative flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200',
          viewMode === 'list'
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewModeChange('list')}
        title="Xem dạng danh sách"
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
