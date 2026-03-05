'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'rounded-r-none px-2',
          viewMode === 'grid' && 'bg-accent'
        )}
        onClick={() => onViewModeChange('grid')}
        title="Xem dạng lưới"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'rounded-l-none px-2',
          viewMode === 'list' && 'bg-accent'
        )}
        onClick={() => onViewModeChange('list')}
        title="Xem dạng danh sách"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
