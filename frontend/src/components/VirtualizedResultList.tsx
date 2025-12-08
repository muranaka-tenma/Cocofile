// CocoFile - Virtualized Result List Component
// Optimized rendering for large search result sets using react-window

import React from "react";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/TagBadge";
import { Star, Folder } from "lucide-react";
import { FileIconWithBg } from "@/utils/fileIcons";

interface VirtualizedResultListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  onToggleFavorite: (filePath: string) => void;
  onOpenFileLocation: (filePath: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onShowDetail: (metadata: any) => void;
  formatFileSize: (bytes: number) => string;
  formatRelativeTime: (date: Date) => string;
  height?: number;
  itemHeight?: number;
}

export const VirtualizedResultList: React.FC<VirtualizedResultListProps> =
  React.memo(
    ({
      results,
      onToggleFavorite,
      onOpenFileLocation,
      onShowDetail,
      formatFileSize,
      formatRelativeTime,
      height = 600,
    }) => {
      return (
        <div
          style={{ height, overflow: "auto" }}
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {results.map((result) => (
            <div key={result.filePath} className="px-1 py-1.5">
              <div
                className="flex gap-3 p-3 border border-border rounded-lg hover:bg-accent hover:border-primary/30 transition-all duration-200 cursor-pointer hover:shadow-md animate-fade-in"
                onClick={() => onShowDetail(result.metadata)}
              >
                {/* Thumbnail */}
                <FileIconWithBg filename={result.fileName} />

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
          ))}
        </div>
      );
    },
  );

VirtualizedResultList.displayName = "VirtualizedResultList";

export default VirtualizedResultList;
