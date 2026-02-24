'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Document } from '@/lib/api';
import { User, Calendar, FileText } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  // Format file size
  const formatFileSize = (bytes: string | null) => {
    if (!bytes) return 'N/A';
    const size = Number(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on extension
  const getFileIcon = () => {
    const ext = document.fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📗';
      case 'ppt':
      case 'pptx':
        return '📙';
      case 'mp4':
      case 'avi':
        return '🎬';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'jpg':
      case 'png':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{getFileIcon()}</span>
          <div className="flex-1 min-w-0">
            <Link href={`/documents/${document.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary truncate">
                {document.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {document.fileName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {document.description || 'Không có mô tả'}
        </p>

        <div className="flex flex-wrap gap-1">
          {document.keywords.slice(0, 3).map((keyword, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {document.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{document.keywords.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {document.user.fullName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(document.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <span className="text-muted-foreground">
            {formatFileSize(document.fileSize)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
