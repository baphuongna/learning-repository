"use client";

import React from 'react';
import Link from 'next/link';

type Doc = {
  id: string;
  title: string;
  downloads: number;
};

type TrendingTag = {
  id: string;
  name: string;
  count: number;
  weight: number; // 0..1.0 for font size weighting
};

// Mock data
const mockDocs: Doc[] = [
  { id: 'd1', title: 'Guides: React Patterns', downloads: 1200 },
  { id: 'd2', title: 'Next.js Data Fetching', downloads: 980 },
  { id: 'd3', title: 'TypeScript Tips', downloads: 760 },
  { id: 'd4', title: 'Rust Async Essentials', downloads: 540 },
];

const mockTrendingTags: TrendingTag[] = [
  { id: '1', name: 'React', count: 45, weight: 1.0 },
  { id: '2', name: 'NextJS', count: 38, weight: 0.85 },
  { id: '3', name: 'TypeScript', count: 32, weight: 0.7 },
  { id: '4', name: 'Rust', count: 28, weight: 0.6 },
  { id: '5', name: 'Prisma', count: 24, weight: 0.5 },
  { id: '6', name: 'Database', count: 20, weight: 0.4 },
  { id: '7', name: 'WebDev', count: 18, weight: 0.35 },
  { id: '8', name: 'Tutorial', count: 15, weight: 0.3 },
];

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="document icon"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 12h8" />
  </svg>
);

const PopularDocumentCard: React.FC<{ doc: Doc }> = ({ doc }) => {
  return (
    <div className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <DocumentIcon className="text-gray-500" />
        <span className="text-sm font-medium text-gray-800 truncate">{doc.title}</span>
      </div>
      <span className="text-xs text-gray-500">{doc.downloads.toLocaleString()} downloads</span>
    </div>
  );
};

const QuickLinks: React.FC = () => {
  // Font size helper for tags based on weight (clamped to reasonable sizes)
  const tagFontSize = (weight: number) => {
    const size = Math.round(12 + weight * 16); // 12px to ~28px
    return Math.max(12, Math.min(28, size));
  };

  return (
    <section className="grid md:grid-cols-5 gap-6 py-6">
      {/* Popular Documents (left, 60% -> md: col-span-3) */}
      <div className="md:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Popular Documents</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">{/* 2x2 grid */}
          {mockDocs.map((doc) => (
            <PopularDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
        <div className="text-right">
          <Link href="/docs" className="text-sm text-blue-600 hover:underline">
            Xem tất cả tài liệu
          </Link>
        </div>
      </div>

      {/* Trending Tags (right, 40%) */}
      <aside className="md:col-span-2 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Trending Tags</h2>
        <div className="flex flex-wrap gap-2">
          {mockTrendingTags.map((tag) => (
            <button
              key={tag.id}
              className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 whitespace-nowrap"
              style={{ fontSize: `${tagFontSize(tag.weight)}px` }}
              onClick={() => {
                // Placeholder for tag click behavior
                console.log(`Tag clicked: ${tag.name}`);
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
};

export default QuickLinks;
