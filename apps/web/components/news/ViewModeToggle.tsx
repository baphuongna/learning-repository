'use client';

import { LayoutGrid, List } from 'lucide-react';

export interface ViewModeToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

/**
 * ViewModeToggle Component
 *
 * Features:
 * - Grid/List view toggle
 * - Active state styling
 * - Accessible with aria attributes
 */
export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  const isGrid = mode === 'grid';
  const isList = mode === 'list';

  const baseBtn =
    'inline-flex items-center justify-center rounded-md p-2 focus:outline-none transition-colors';

  const activeClasses = 'bg-background text-primary shadow-sm';

  const inactiveClasses = 'text-muted-foreground hover:text-foreground';

  return (
    <div className="bg-muted/50 rounded-lg p-1" role="group" aria-label="Chế độ xem">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`${baseBtn} ${isGrid ? activeClasses : inactiveClasses}`}
        aria-pressed={isGrid}
        aria-label="Xem dạng lưới"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`${baseBtn} ml-1 ${isList ? activeClasses : inactiveClasses}`}
        aria-pressed={isList}
        aria-label="Xem dạng danh sách"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ViewModeToggle;
