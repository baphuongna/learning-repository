'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { News, newsApi } from '@/lib/api';
import { SkeletonNewsCard } from '@/components/ui/skeleton';
import { Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * FeaturedNews Component - EduModern Design System
 *
 * Features:
 * - Hero section with featured news
 * - Magazine-style layout
 * - Staggered animation on load
 * - Responsive grid
 */

export function FeaturedNews() {
  const [featured, setFeatured] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getFeatured(3);
      setFeatured(data);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonNewsCard key={i} variant="featured" />
          ))}
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

      {/* Featured Grid */}
      {featured.length === 3 ? (
        // Magazine layout: 1 large + 2 smaller
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main featured */}
          <div className="lg:row-span-2">
            <NewsCard news={featured[0]} variant="featured" />
          </div>
          {/* Secondary featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <NewsCard news={featured[1]} variant="featured" />
            <NewsCard news={featured[2]} variant="featured" />
          </div>
        </div>
      ) : (
        // Fallback grid for any number
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((news, index) => (
            <div
              key={news.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <NewsCard news={news} variant="featured" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
