'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface StickySearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Array<{ id: string; name: string }>;
}

/**
 * StickySearchBar Component
 *
 * Features:
 * - Sticky positioning below header
 * - Search input with live filtering
 * - View mode toggle (grid/list)
 * - Collapsible filter panel
 * - Badge counter for active filters
 */
export function StickySearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  categories,
}: StickySearchBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Active filter count derived from selectedCategory
  const activeFilterCount = useMemo(() => (selectedCategory ? 1 : 0), [selectedCategory]);

  // Close filter panel on outside click
  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (!filterOpen) return;
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [filterOpen]);

  // Close filter after category selection
  useEffect(() => {
    if (selectedCategory !== null && filterOpen) {
      const t = setTimeout(() => setFilterOpen(false), 120);
      return () => clearTimeout(t);
    }
  }, [selectedCategory, filterOpen]);

  return (
    <div ref={rootRef} className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Search input */}
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm tin tức..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Xem dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Xem dạng danh sách"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Filter toggle with badge */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="gap-2"
            aria-expanded={filterOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible filter panel */}
      {filterOpen && (
        <div className="px-4 pb-4">
          <div className="max-w-7xl mx-auto bg-card border border-border rounded-lg p-4 mt-1">
            <div className="text-sm font-medium mb-3">Danh mục</div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => {
                  onCategoryChange(null);
                  setFilterOpen(false);
                }}
              >
                Tất cả
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => {
                    onCategoryChange(cat.id);
                    setFilterOpen(false);
                  }}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StickySearchBar;
