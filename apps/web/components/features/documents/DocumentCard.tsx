'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge, DocumentTypeBadge } from '@/components/ui/badge';
import { Document } from '@/lib/api';
import { User, Calendar, HardDrive, ExternalLink, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DocumentCard Component - EduModern Design System
 *
 * Features:
 * - Refined card design with warm shadows
 * - File type icon with color coding
 * - Keyword tags
 * - Quick action buttons on hover
 */

interface DocumentCardProps {
  document: Document;
  variant?: 'default' | 'compact';
}

export function DocumentCard({ document, variant = 'default' }: DocumentCardProps) {
  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file type from extension
  const getFileType = (): 'pdf' | 'doc' | 'xls' | 'ppt' | 'video' | 'audio' | 'image' | 'other' => {
    const ext = document.fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'xls':
      case 'xlsx':
        return 'xls';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';
      case 'mp3':
      case 'wav':
        return 'audio';
      case 'jpg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'other';
    }
  };

  // Get file icon color
  const getFileIconColor = () => {
    const type = getFileType();
    const colors = {
      pdf: 'from-red-500 to-red-600',
      doc: 'from-blue-500 to-blue-600',
      xls: 'from-green-500 to-green-600',
      ppt: 'from-orange-500 to-orange-600',
      video: 'from-purple-500 to-purple-600',
      audio: 'from-pink-500 to-pink-600',
      image: 'from-teal-500 to-teal-600',
      other: 'from-gray-500 to-gray-600',
    };
    return colors[type];
  };

  // Get file icon
  const getFileIcon = () => {
    const ext = document.fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h2a1.5 1.5 0 010 3h-1v1.5H8.5V13zm2 2a.5.5 0 000-1h-1v1h1zm3-2h2a1.5 1.5 0 110 3h-1v1.5H13.5V13zm2 2a.5.5 0 000-1h-1v1h1z"/>
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h6v1H9v-1zm0 2h6v1H9v-1z"/>
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
          </svg>
        );
    }
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card variant="interactive" className="overflow-hidden">
        <Link href={`/documents/${document.id}`} className="flex items-center gap-3 p-3">
          <div className={cn(
            'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0',
            getFileIconColor()
          )}>
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {document.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <p className="text-xs text-muted-foreground truncate">
                {formatFileSize(document.fileSize)}
              </p>
              {document.inspectionId && (
                <Badge variant="info" size="sm" icon={<Cpu className="h-3 w-3" />}>
                  Rust
                </Badge>
              )}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </Card>
    );
  }

  // Default variant
  return (
    <Card variant="interactive" className="overflow-hidden group h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div className={cn(
            'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0 shadow-lg',
            getFileIconColor()
          )}>
            {getFileIcon()}
          </div>

          {/* Title & Filename */}
          <div className="flex-1 min-w-0">
            <Link href={`/documents/${document.id}`}>
              <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {document.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {document.fileName}
            </p>
            {document.inspectionId && (
              <div className="mt-2">
                <Badge variant="info" size="sm" icon={<Cpu className="h-3 w-3" />}>
                  Inspected by Rust
                </Badge>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/documents/${document.id}`}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {document.description || 'Không có mô tả'}
        </p>

        {/* Keywords */}
        {Array.isArray(document.keywords) && document.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {document.keywords.slice(0, 3).map((keyword, index) => (
              <Badge key={index} variant="soft" size="sm">
                {keyword}
              </Badge>
            ))}
            {document.keywords.length > 3 && (
              <Badge variant="outline" size="sm">
                +{document.keywords.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {document.user?.fullName || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(document.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-medium text-foreground/70">
            <HardDrive className="h-3.5 w-3.5" />
            {formatFileSize(document.fileSize)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
