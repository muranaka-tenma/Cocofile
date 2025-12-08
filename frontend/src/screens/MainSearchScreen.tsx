// CocoFile - Main Search Screen (S-001)
// Desktop window UI for file search with filters and tabs

import React, { useRef, useState } from "react";
import type { RefObject } from "react";
import {
  Search,
  Tag,
  Calendar,
  FileText,
  FileSpreadsheet,
  File,
  Presentation,
  Star,
  Folder,
  Loader2,
  SearchX,
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash2,
  X,
  Download,
  Copy,
  Code,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore, SORT_OPTIONS } from "@/store/searchStore";
import { useSearchData } from "@/hooks/useSearchData";
import { useFileDetailStore } from "@/store/fileDetailStore";
import { useSortedResults } from "@/hooks/useSortedResults";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TAB_TYPES, FILE_TYPES } from "@/types";
import type { TabType } from "@/types";
import { FileDetailModal } from "@/components/FileDetailModal";
import { TagBadge } from "@/components/TagBadge";
import { TagFilterDialog } from "@/components/TagFilterDialog";
import { DateRangeFilterDialog } from "@/components/DateRangeFilterDialog";
import { AdvancedSearchDialog } from "@/components/AdvancedSearchDialog";
import { VirtualizedResultList } from "@/components/VirtualizedResultList";
import { RealFileService } from "@/services/RealFileService";
import { BatchTagDialog } from "@/components/BatchTagDialog";
import {
  exportToCSV,
  exportToJSON,
  copyToClipboard,
} from "@/utils/exportUtils";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { SearchHistoryDropdown } from "@/components/SearchHistoryDropdown";
import { FileIconWithBg } from "@/utils/fileIcons";
import { SkeletonFileList } from "@/components/ui/skeleton";
import { toast } from "@/store/toastStore";

const fileService = new RealFileService();

export const MainSearchScreen: React.FC = () => {
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [batchTagDialogOpen, setBatchTagDialogOpen] = useState(false);
  const [batchTagMode, setBatchTagMode] = useState<"add" | "remove">("add");
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search history
  const {
    addSearch,
    removeSearch: removeSearchHistory,
    clearHistory: clearSearchHistory,
    getRecentSearches,
  } = useSearchHistory();

  const {
    keyword,
    filters,
    activeTab,
    sortBy,
    isRegexMode,
    regexError,
    setKeyword,
    toggleFileType,
    setActiveTab,
    setFilters,
    setDateRange,
    setSortBy,
    setIsRegexMode,
  } = useSearchStore();

  const {
    searchResults,
    isSearching,
    error,
    toggleFavorite,
    openFile,
    openFileLocation,
    formatFileSize,
    formatRelativeTime,
    refetch,
  } = useSearchData();

  const { openModal } = useFileDetailStore();

  // Sort results
  const sortedResults = useSortedResults(searchResults, sortBy);

  // Reset selected index and clear batch selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
    setSelectedFiles(new Set());
  }, [sortedResults]);

  // Add search to history when search completes
  React.useEffect(() => {
    if (keyword && !isSearching && searchResults.length >= 0) {
      addSearch(keyword, searchResults.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, isSearching, searchResults.length]);

  // Batch operation helpers
  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedFiles(new Set(sortedResults.map((r) => r.filePath)));
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
    setBatchMode(false);
  };

  const handleBulkAddTag = async (tag: string) => {
    for (const filePath of selectedFiles) {
      try {
        const result = sortedResults.find((r) => r.filePath === filePath);
        if (result) {
          const currentTags = result.metadata.tags || [];
          if (!currentTags.includes(tag)) {
            await fileService.updateTags(filePath, [...currentTags, tag]);
          }
        }
      } catch (err) {
        console.error(`Failed to add tag to ${filePath}:`, err);
      }
    }
    refetch();
    clearSelection();
  };

  const handleBulkRemoveTag = async (tag: string) => {
    for (const filePath of selectedFiles) {
      try {
        const result = sortedResults.find((r) => r.filePath === filePath);
        if (result) {
          const currentTags = result.metadata.tags || [];
          await fileService.updateTags(
            filePath,
            currentTags.filter((t) => t !== tag),
          );
        }
      } catch (err) {
        console.error(`Failed to remove tag from ${filePath}:`, err);
      }
    }
    refetch();
    clearSelection();
  };

  const handleBulkToggleFavorite = async () => {
    for (const filePath of selectedFiles) {
      try {
        await fileService.toggleFavorite(filePath);
      } catch (err) {
        console.error(`Failed to toggle favorite for ${filePath}:`, err);
      }
    }
    refetch();
    clearSelection();
  };

  // Get all tags from selected files (for the dialog)
  const getSelectedFilesTags = (): string[] => {
    const allTags = new Set<string>();
    selectedFiles.forEach((filePath) => {
      const result = sortedResults.find((r) => r.filePath === filePath);
      if (result && result.metadata.tags) {
        result.metadata.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef: searchInputRef as RefObject<HTMLInputElement>,
    onArrowUp: () => {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    },
    onArrowDown: () => {
      setSelectedIndex((prev) => Math.min(sortedResults.length - 1, prev + 1));
    },
    onEnter: () => {
      if (sortedResults[selectedIndex]) {
        openModal(sortedResults[selectedIndex].metadata);
      }
    },
    onCtrlEnter: () => {
      if (sortedResults[selectedIndex]) {
        openFile(sortedResults[selectedIndex].filePath);
      }
    },
    onEscape: () => {
      setSelectedIndex(0);
    },
  });

  // Export handlers with toast notifications
  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        await exportToCSV(sortedResults, "search-results.csv");
        toast.success("エクスポート完了", "CSVファイルをダウンロードしました");
      } else {
        await exportToJSON(sortedResults, "search-results.json");
        toast.success("エクスポート完了", "JSONファイルをダウンロードしました");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("エクスポート失敗", "ファイルのエクスポートに失敗しました");
    }
  };

  const handleCopyResults = async () => {
    try {
      await copyToClipboard(sortedResults);
      toast.success("コピー完了", "検索結果をクリップボードにコピーしました");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("コピー失敗", "クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-md p-4 border border-border">
        {/* Header with Hotkey Hint */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h1 className="text-lg font-medium text-primary">CocoFile</h1>
          <div className="flex gap-2">
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Ctrl+K: 検索
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              ↑↓: 選択
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Enter: 詳細
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={
                  isRegexMode
                    ? "正規表現パターン (例: report\\d{4}\\.pdf)"
                    : "ファイルを検索 (例: 先週のABC社の見積もり)"
                }
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() =>
                  setTimeout(() => setShowSearchHistory(false), 200)
                }
                className={`pl-10 ${isRegexMode ? "border-purple-500 focus:ring-purple-500" : ""}`}
              />
              <SearchHistoryDropdown
                history={getRecentSearches(10)}
                onSelectSearch={(selectedKeyword) => {
                  setKeyword(selectedKeyword);
                  setShowSearchHistory(false);
                }}
                onRemoveSearch={removeSearchHistory}
                onClearHistory={clearSearchHistory}
                show={showSearchHistory}
              />
            </div>
            <Button
              variant={isRegexMode ? "default" : "outline"}
              onClick={() => setIsRegexMode(!isRegexMode)}
              className="gap-2"
              title="正規表現検索を有効化"
            >
              <Code className="h-4 w-4" />
              正規表現
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdvancedSearchOpen(true)}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              詳細検索
            </Button>
            <Button
              variant={batchMode ? "default" : "outline"}
              onClick={() => setBatchMode(!batchMode)}
              className="gap-2"
            >
              {batchMode ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              一括選択
            </Button>
          </div>

          {/* Regex Error Display */}
          {isRegexMode && regexError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{regexError}</span>
            </div>
          )}
        </div>

        {/* Batch Actions Toolbar */}
        {selectedFiles.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedFiles.size}件選択中
                </span>
                <Button size="sm" variant="outline" onClick={selectAll}>
                  全て選択
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  選択解除
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleBulkToggleFavorite}
                >
                  <Star className="h-4 w-4 mr-1" />
                  お気に入り切替
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setBatchTagMode("add");
                    setBatchTagDialogOpen(true);
                  }}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  タグ追加
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setBatchTagMode("remove");
                    setBatchTagDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  タグ削除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sort and Filters */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SORT_OPTIONS.RELEVANCE}>関連度順</SelectItem>
                <SelectItem value={SORT_OPTIONS.DATE_DESC}>
                  日付(新しい順)
                </SelectItem>
                <SelectItem value={SORT_OPTIONS.DATE_ASC}>
                  日付(古い順)
                </SelectItem>
                <SelectItem value={SORT_OPTIONS.NAME_ASC}>名前(A-Z)</SelectItem>
                <SelectItem value={SORT_OPTIONS.NAME_DESC}>
                  名前(Z-A)
                </SelectItem>
                <SelectItem value={SORT_OPTIONS.SIZE_DESC}>
                  サイズ(大きい順)
                </SelectItem>
                <SelectItem value={SORT_OPTIONS.SIZE_ASC}>
                  サイズ(小さい順)
                </SelectItem>
                <SelectItem value={SORT_OPTIONS.FREQUENT}>
                  アクセス頻度順
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          {sortedResults.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResults}
                className="gap-1"
                title="結果をクリップボードにコピー"
                aria-label="検索結果をクリップボードにコピー"
              >
                <Copy className="h-4 w-4" />
                コピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                className="gap-1"
                title="CSV形式でエクスポート"
                aria-label="CSV形式でエクスポート"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                className="gap-1"
                title="JSON形式でエクスポート"
                aria-label="JSON形式でエクスポート"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600 font-medium">フィルター:</span>

          <div className="flex gap-2 flex-wrap">
            {/* Tag Filter Button */}
            <Button
              variant={filters.tags.length > 0 ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setTagFilterOpen(true)}
            >
              <Tag className="h-4 w-4" />
              タグ
              {filters.tags.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {filters.tags.length}
                </span>
              )}
            </Button>

            {/* Date Range Filter Button */}
            <Button
              variant={
                filters.dateRange.startDate || filters.dateRange.endDate
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="gap-1"
              onClick={() => setDateFilterOpen(true)}
            >
              <Calendar className="h-4 w-4" />
              日付範囲
            </Button>

            {/* File Type Filters */}
            <div className="flex gap-1">
              <Button
                variant={
                  filters.fileTypes.includes(FILE_TYPES.PDF)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleFileType(FILE_TYPES.PDF)}
                className="gap-1"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>

              <Button
                variant={
                  filters.fileTypes.includes(FILE_TYPES.EXCEL)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleFileType(FILE_TYPES.EXCEL)}
                className="gap-1"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>

              <Button
                variant={
                  filters.fileTypes.includes(FILE_TYPES.WORD)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleFileType(FILE_TYPES.WORD)}
                className="gap-1"
              >
                <File className="h-4 w-4" />
                Word
              </Button>

              <Button
                variant={
                  filters.fileTypes.includes(FILE_TYPES.POWERPOINT)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleFileType(FILE_TYPES.POWERPOINT)}
                className="gap-1"
              >
                <Presentation className="h-4 w-4" />
                PPT
              </Button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {!isSearching && sortedResults.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">{sortedResults.length}件</span>
            の結果が見つかりました
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabType)}
        >
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value={TAB_TYPES.SEARCH_RESULTS}>
              検索結果
              {sortedResults.length > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {sortedResults.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value={TAB_TYPES.FAVORITES}>お気に入り</TabsTrigger>
            <TabsTrigger value={TAB_TYPES.RECENT}>最近使用</TabsTrigger>
          </TabsList>

          {/* Search Results Tab */}
          <TabsContent value={TAB_TYPES.SEARCH_RESULTS}>
            <ResultList
              results={sortedResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              selectedIndex={selectedIndex}
              batchMode={batchMode}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
            />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value={TAB_TYPES.FAVORITES}>
            <ResultList
              results={sortedResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              selectedIndex={selectedIndex}
              batchMode={batchMode}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
            />
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value={TAB_TYPES.RECENT}>
            <ResultList
              results={sortedResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              selectedIndex={selectedIndex}
              batchMode={batchMode}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
            />
          </TabsContent>
        </Tabs>

        {/* File Detail Modal */}
        <FileDetailModal onFileUpdated={refetch} />

        {/* Filter Dialogs */}
        <TagFilterDialog
          open={tagFilterOpen}
          onOpenChange={setTagFilterOpen}
          selectedTags={filters.tags}
          onTagsChange={(tags) => setFilters({ tags })}
        />

        <DateRangeFilterDialog
          open={dateFilterOpen}
          onOpenChange={setDateFilterOpen}
          dateRange={filters.dateRange}
          onDateRangeChange={(dateRange) => setDateRange(dateRange)}
        />

        <AdvancedSearchDialog
          open={advancedSearchOpen}
          onOpenChange={setAdvancedSearchOpen}
        />

        <BatchTagDialog
          open={batchTagDialogOpen}
          onOpenChange={setBatchTagDialogOpen}
          mode={batchTagMode}
          selectedCount={selectedFiles.size}
          existingTags={getSelectedFilesTags()}
          onAddTag={handleBulkAddTag}
          onRemoveTag={handleBulkRemoveTag}
        />
      </div>
    </div>
  );
};

// Result List Component
interface ResultListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  isSearching: boolean;
  error: string | null;
  onToggleFavorite: (filePath: string) => void;
  onOpenFile: (filePath: string) => void;
  onOpenFileLocation: (filePath: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onShowDetail: (metadata: any) => void;
  formatFileSize: (bytes: number) => string;
  formatRelativeTime: (date: Date) => string;
  selectedIndex?: number;
  batchMode?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelection?: (filePath: string) => void;
}

const ResultList: React.FC<ResultListProps> = React.memo(
  ({
    results,
    isSearching,
    error,
    onToggleFavorite,
    onOpenFileLocation,
    onShowDetail,
    formatFileSize,
    formatRelativeTime,
    selectedIndex = -1,
    batchMode = false,
    selectedFiles = new Set(),
    onToggleSelection,
  }) => {
    // Loading state
    if (isSearching) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <p className="text-sm text-muted-foreground">検索中...</p>
          </div>
          <SkeletonFileList count={5} />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchX className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    // Empty state
    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchX className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">検索結果が見つかりませんでした</p>
        </div>
      );
    }

    // Use virtualized list for large result sets (50+ items)
    if (results.length > 50) {
      return (
        <VirtualizedResultList
          results={results}
          onToggleFavorite={onToggleFavorite}
          onOpenFileLocation={onOpenFileLocation}
          onShowDetail={onShowDetail}
          formatFileSize={formatFileSize}
          formatRelativeTime={formatRelativeTime}
        />
      );
    }

    // Normal list for smaller result sets
    return (
      <div className="flex flex-col gap-3">
        {results.map((result, index) => {
          const isSelected = selectedFiles.has(result.filePath);
          return (
            <div
              key={result.filePath}
              className={`flex gap-3 p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md animate-fade-in ${
                index === selectedIndex
                  ? "bg-accent border-primary shadow-sm"
                  : isSelected
                    ? "bg-primary/10 border-primary/50"
                    : "border-border hover:bg-accent/50 hover:border-primary/30"
              }`}
              onClick={() => {
                if (batchMode && onToggleSelection) {
                  onToggleSelection(result.filePath);
                } else {
                  onShowDetail(result.metadata);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${result.fileName} を開く`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (batchMode && onToggleSelection) {
                    onToggleSelection(result.filePath);
                  } else {
                    onShowDetail(result.metadata);
                  }
                }
              }}
            >
              {/* Checkbox (Batch Mode) */}
              {batchMode && (
                <div className="flex items-start pt-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSelection) {
                        onToggleSelection(result.filePath);
                      }
                    }}
                    className="p-1 rounded hover:bg-background/50 transition-colors"
                    aria-label={isSelected ? "選択を解除" : "選択"}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

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
                    {result.metadata.tags.map((tag: string) => (
                      <TagBadge key={tag} tagName={tag} size="sm" />
                    ))}
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
          );
        })}
      </div>
    );
  },
);

ResultList.displayName = "ResultList";

export default MainSearchScreen;
