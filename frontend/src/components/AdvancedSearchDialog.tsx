// CocoFile - Advanced Search Dialog Component
// Provides advanced search options like field selection and search history

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, Trash2, X } from "lucide-react";
import {
  useSearchStore,
  SEARCH_FIELDS,
  type SearchField,
} from "@/store/searchStore";

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    keyword,
    setKeyword,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    removeSearchHistory,
  } = useSearchStore();

  const [searchField, setSearchField] = useState<SearchField>(
    SEARCH_FIELDS.ALL,
  );
  const [advancedKeyword, setAdvancedKeyword] = useState(keyword);

  const handleSearch = () => {
    if (advancedKeyword.trim()) {
      // Set the keyword in the store
      setKeyword(advancedKeyword);

      // Add to search history
      addSearchHistory({
        keyword: advancedKeyword,
        field: searchField,
        timestamp: new Date(),
      });

      // Close dialog
      onOpenChange(false);
    }
  };

  const handleHistoryClick = (historyItem: {
    keyword: string;
    field: SearchField;
  }) => {
    setAdvancedKeyword(historyItem.keyword);
    setSearchField(historyItem.field);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>詳細検索</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search field selector */}
          <div className="space-y-2">
            <Label htmlFor="search-field" className="text-sm font-medium">
              検索対象
            </Label>
            <Select
              value={searchField}
              onValueChange={(value) => setSearchField(value as SearchField)}
            >
              <SelectTrigger id="search-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEARCH_FIELDS.ALL}>
                  すべて (ファイル名 + 内容 + タグ + メモ)
                </SelectItem>
                <SelectItem value={SEARCH_FIELDS.FILE_NAME}>
                  ファイル名のみ
                </SelectItem>
                <SelectItem value={SEARCH_FIELDS.CONTENT}>
                  ファイル内容のみ
                </SelectItem>
                <SelectItem value={SEARCH_FIELDS.TAGS}>タグのみ</SelectItem>
                <SelectItem value={SEARCH_FIELDS.MEMO}>メモのみ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced keyword input */}
          <div className="space-y-2">
            <Label htmlFor="advanced-keyword" className="text-sm font-medium">
              検索キーワード
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="advanced-keyword"
                type="text"
                placeholder="キーワードを入力..."
                value={advancedKeyword}
                onChange={(e) => setAdvancedKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              ヒント: スペース区切りで複数キーワード検索（AND検索）
            </p>
          </div>

          {/* Search history */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  検索履歴
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-xs h-7"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  すべて削除
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {searchHistory.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer group"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.keyword}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.field === SEARCH_FIELDS.ALL
                          ? "すべて"
                          : item.field === SEARCH_FIELDS.FILE_NAME
                            ? "ファイル名"
                            : item.field === SEARCH_FIELDS.CONTENT
                              ? "内容"
                              : item.field === SEARCH_FIELDS.TAGS
                                ? "タグ"
                                : "メモ"}{" "}
                        • {item.timestamp.toLocaleString("ja-JP")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchHistory(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSearch} disabled={!advancedKeyword.trim()}>
            <Search className="h-4 w-4 mr-2" />
            検索
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchDialog;
