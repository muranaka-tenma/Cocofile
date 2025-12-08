// CocoFile - Search History Dropdown Component
// Displays recent searches with click-to-search functionality

import React from "react";
import { Clock, X, Trash2 } from "lucide-react";
import type { SearchHistoryItem } from "@/hooks/useSearchHistory";
import { Button } from "@/components/ui/button";

interface SearchHistoryDropdownProps {
  history: SearchHistoryItem[];
  onSelectSearch: (keyword: string) => void;
  onRemoveSearch: (id: string) => void;
  onClearHistory: () => void;
  show: boolean;
}

export const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({
  history,
  onSelectSearch,
  onRemoveSearch,
  onClearHistory,
  show,
}) => {
  if (!show || history.length === 0) {
    return null;
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "たった今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP");
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">検索履歴</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-xs text-gray-500 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          すべて削除
        </Button>
      </div>

      {/* History Items */}
      <div className="py-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelectSearch(item.keyword)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">
                  {item.keyword}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{formatTimestamp(item.timestamp)}</span>
                {item.resultCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>{item.resultCount}件</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSearch(item.id);
              }}
              className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 rounded transition-opacity"
              title="削除"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          検索履歴はありません
        </div>
      )}
    </div>
  );
};

export default SearchHistoryDropdown;
