// CocoFile - Virtualized Result List Component
// Optimized rendering for large search result sets using react-window

import React from "react";
import { FixedSizeList as List } from "react-window";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/TagBadge";
import { Star, Folder } from "lucide-react";

interface VirtualizedResultListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  onToggleFavorite: (filePath: string) => void;
  onOpenFileLocation: (filePath: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onShowDetail: (metadata: any) => void;
  formatFileSize: (bytes: number) => string;
  formatRelativeTime: (date: Date) => string;
  getFileIcon: (fileType: string) => React.JSX.Element;
  height?: number;
  itemHeight?: number;
}

export const VirtualizedResultList: React.FC<VirtualizedResultListProps> = ({
  results,
  onToggleFavorite,
  onOpenFileLocation,
  onShowDetail,
  formatFileSize,
  formatRelativeTime,
  getFileIcon,
  height = 600,
  itemHeight = 140,
}) => {
  // Row renderer for react-window
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const result = results[index];

    return (
      <div style={style} className="px-1 py-1.5">
        <div
          className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-600 transition-all cursor-pointer"
          onClick={() => onShowDetail(result.metadata)}
        >
          {/* Thumbnail */}
          <div className="w-15 h-15 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            {getFileIcon(result.fileType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Filename + Favorite */}
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {result.fileName}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(result.filePath);
                }}
                className="flex-shrink-0 ml-2"
              >
                <Star
                  className={`h-5 w-5 ${
                    result.metadata.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            </div>

            {/* Path */}
            <p className="text-xs text-gray-500 truncate mb-2">
              {result.filePath}
            </p>

            {/* Tags */}
            {result.metadata.tags && result.metadata.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {result.metadata.tags.slice(0, 5).map((tag: string) => (
                  <TagBadge key={tag} tagName={tag} size="sm" />
                ))}
                {result.metadata.tags.length > 5 && (
                  <span className="text-xs text-gray-400">
                    +{result.metadata.tags.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Meta info */}
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{formatFileSize(result.fileSize)}</span>
              <span>
                {result.metadata.createdAt.toLocaleDateString("ja-JP")}
              </span>
              <span>
                最終アクセス: {formatRelativeTime(result.lastAccessedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFileLocation(result.filePath);
              }}
              title="フォルダを開く"
            >
              <Folder className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={results.length}
      itemSize={itemHeight}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {Row}
    </List>
  );
};

export default VirtualizedResultList;
