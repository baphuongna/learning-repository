'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { News, newsApi } from '@/lib/api';
import { SkeletonNewsCard } from '@/components/ui/skeleton';
import { Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FeaturedNewsProps {
  onExcludeIds?: (ids: string[]) => void;
}

/**
 * FeaturedNews Component - EduModern Design System
 *
 * Features:
 * - 5 featured news items
 * - Magazine layout: 1 hero + 4 medium cards
 * - Staggered animation on load
 * - Returns excludeIds for parent component
 */

export function FeaturedNews({ onExcludeIds }: FeaturedNewsProps) {
  const [featured, setFeatured] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getFeatured(5);
      setFeatured(data);
      
      // Pass excludeIds to parent for NewsList filtering
      if (onExcludeIds && data.length > 0) {
        onExcludeIds(data.map((news) => news.id));
      }
    } catch (err) {
      console.error('Failed to fetch featured news:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeletons
  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero skeleton */}
          <div className="lg:col-span-2">
            <SkeletonNewsCard variant="featured" />
          </div>
          {/* Medium cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-amber-600 text-white shadow-lg shadow-accent/30">
            <Flame className="h-5 w-5" />
          </span>
          Tin nổi bật
        </h2>
        <Link
          href="/"
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Magazine Layout: Hero (2/3) + Medium Cards (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <NewsCard news={featured[0]} variant="hero" />
        </div>
        
        {/* Medium Cards - Takes 1/3 width, stacked vertically */}
        <div className="space-y-4">
          {featured.slice(1, 5).map((news, index) => (
            <div
              key={news.id}
              className="animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <NewsCard news={news} variant="medium" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
