'use client';

import { useState, useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { News, newsApi } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        🔥 Tin nổi bật
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((news) => (
          <NewsCard key={news.id} news={news} variant="featured" />
        ))}
      </div>
    </section>
  );
}
