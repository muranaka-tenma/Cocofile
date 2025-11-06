// CocoFile - Main Search Screen (S-001)
// Desktop window UI for file search with filters and tabs

import React from 'react';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSearchStore } from '@/store/searchStore';
import { useSearchData } from '@/hooks/useSearchData';
import { useFileDetailStore } from '@/store/fileDetailStore';
import { TAB_TYPES, FILE_TYPES } from '@/types';
import { FileDetailModal } from '@/components/FileDetailModal';

export const MainSearchScreen: React.FC = () => {
  const {
    keyword,
    filters,
    activeTab,
    setKeyword,
    toggleFileType,
    setActiveTab,
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

  // File type icon mapping
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.PDF:
        return <FileText className="h-8 w-8 text-gray-500" />;
      case FILE_TYPES.EXCEL:
        return <FileSpreadsheet className="h-8 w-8 text-gray-500" />;
      case FILE_TYPES.WORD:
        return <File className="h-8 w-8 text-gray-500" />;
      case FILE_TYPES.POWERPOINT:
        return <Presentation className="h-8 w-8 text-gray-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4">
        {/* Header with Hotkey Hint */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h1 className="text-lg font-medium text-blue-600">CocoFile</h1>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Ctrl+Shift+F で呼び出し
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ファイルを検索 (例: 先週のABC社の見積もり)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Tag Filter Button (placeholder) */}
          <Button variant="outline" size="sm" className="gap-1">
            <Tag className="h-4 w-4" />
            タグ
          </Button>

          {/* Date Range Filter Button (placeholder) */}
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            日付範囲
          </Button>

          {/* File Type Filters */}
          <div className="flex gap-1">
            <Button
              variant={
                filters.fileTypes.includes(FILE_TYPES.PDF)
                  ? 'default'
                  : 'outline'
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
                  ? 'default'
                  : 'outline'
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
                  ? 'default'
                  : 'outline'
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
                  ? 'default'
                  : 'outline'
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value={TAB_TYPES.SEARCH_RESULTS}>
              検索結果
            </TabsTrigger>
            <TabsTrigger value={TAB_TYPES.FAVORITES}>
              お気に入り
            </TabsTrigger>
            <TabsTrigger value={TAB_TYPES.RECENT}>最近使用</TabsTrigger>
          </TabsList>

          {/* Search Results Tab */}
          <TabsContent value={TAB_TYPES.SEARCH_RESULTS}>
            <ResultList
              results={searchResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              getFileIcon={getFileIcon}
            />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value={TAB_TYPES.FAVORITES}>
            <ResultList
              results={searchResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              getFileIcon={getFileIcon}
            />
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value={TAB_TYPES.RECENT}>
            <ResultList
              results={searchResults}
              isSearching={isSearching}
              error={error}
              onToggleFavorite={toggleFavorite}
              onOpenFile={openFile}
              onOpenFileLocation={openFileLocation}
              onShowDetail={openModal}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              getFileIcon={getFileIcon}
            />
          </TabsContent>
        </Tabs>

        {/* File Detail Modal */}
        <FileDetailModal onFileUpdated={refetch} />
      </div>
    </div>
  );
};

// Result List Component
interface ResultListProps {
  results: any[];
  isSearching: boolean;
  error: string | null;
  onToggleFavorite: (filePath: string) => void;
  onOpenFile: (filePath: string) => void;
  onOpenFileLocation: (filePath: string) => void;
  onShowDetail: (metadata: any) => void;
  formatFileSize: (bytes: number) => string;
  formatRelativeTime: (date: Date) => string;
  getFileIcon: (fileType: string) => React.JSX.Element;
}

const ResultList: React.FC<ResultListProps> = ({
  results,
  isSearching,
  error,
  onToggleFavorite,
  onOpenFileLocation,
  onShowDetail,
  formatFileSize,
  formatRelativeTime,
  getFileIcon,
}) => {
  // Loading state
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">検索中...</p>
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

  // Results list
  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => (
        <div
          key={result.filePath}
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
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
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
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex gap-3 text-xs text-gray-400">
              <span>{formatFileSize(result.fileSize)}</span>
              <span>{result.metadata.createdAt.toLocaleDateString('ja-JP')}</span>
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
      ))}
    </div>
  );
};

export default MainSearchScreen;
