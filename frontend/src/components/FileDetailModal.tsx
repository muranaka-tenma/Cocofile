// CocoFile - File Detail Modal Component (S-005)
// Displays file details with editing capabilities for tags and memo

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFileDetailStore } from '@/store/fileDetailStore';
import { RealFileService } from '@/services/RealFileService';
import {
  FileText,
  Star,
  FolderOpen,
  ExternalLink,
  Tag,
  Edit,
  X,
  Plus,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fileService = new RealFileService();

interface FileDetailModalProps {
  onFileUpdated?: () => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({
  onFileUpdated,
}) => {
  const {
    isOpen,
    fileMetadata,
    editedTags,
    editedMemo,
    hasUnsavedChanges,
    isLoading,
    error,
    closeModal,
    addTag,
    removeTag,
    setEditedMemo,
    setIsLoading,
    setError,
    setFileMetadata,
    markSaved,
  } = useFileDetailStore();

  const [newTag, setNewTag] = useState('');

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editedTags.includes(trimmedTag)) {
      addTag(trimmedTag);
      setNewTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    removeTag(tag);
  };

  // Handle save changes
  const handleSave = async () => {
    if (!fileMetadata) return;

    try {
      setIsLoading(true);
      setError(null);

      // Update tags
      await fileService.updateTags(fileMetadata.filePath, editedTags);

      // Update memo
      await fileService.updateMemo(fileMetadata.filePath, editedMemo);

      // Update favorite status if changed
      if (fileMetadata.isFavorite !== (fileMetadata.isFavorite !== fileMetadata.isFavorite)) {
        await fileService.toggleFavorite(fileMetadata.filePath);
      }

      // Refresh metadata (Phase 2で完全実装)
      const updatedMetadata = await fileService.getFileMetadata(
        fileMetadata.filePath
      );
      if (updatedMetadata) {
        setFileMetadata(updatedMetadata);
      }
      markSaved();

      // Notify parent component
      if (onFileUpdated) {
        onFileUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!fileMetadata) return;

    try {
      setIsLoading(true);
      setError(null);

      await fileService.toggleFavorite(fileMetadata.filePath);
      // Phase 2でメタデータ更新を実装
      // const updatedMetadata = await fileService.getFileMetadata(fileMetadata.filePath);
      // if (updatedMetadata) setFileMetadata(updatedMetadata);

      // Notify parent component
      if (onFileUpdated) {
        onFileUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle open file
  const handleOpenFile = async () => {
    if (!fileMetadata) return;

    try {
      await fileService.openFile(fileMetadata.filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file');
    }
  };

  // Handle open folder
  const handleOpenFolder = async () => {
    if (!fileMetadata) return;

    try {
      await fileService.openFileLocation(fileMetadata.filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open folder');
    }
  };

  // Get file icon based on file type
  const getFileIcon = () => {
    if (!fileMetadata) return <FileText className="h-6 w-6" />;

    switch (fileMetadata.fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'excel':
        return <FileText className="h-6 w-6 text-green-500" />;
      case 'word':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'powerpoint':
        return <FileText className="h-6 w-6 text-orange-500" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  if (!fileMetadata) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            {fileMetadata.fileName}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Preview section */}
          <div className="bg-muted rounded-lg p-6">
            <div className="bg-background border rounded-md min-h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p>ファイルプレビュー</p>
              </div>
            </div>
          </div>

          {/* File information section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" />
              ファイル情報
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4 text-sm">
              <div className="text-muted-foreground font-medium">
                ファイルパス
              </div>
              <div className="break-all">{fileMetadata.filePath}</div>

              <div className="text-muted-foreground font-medium">
                ファイルサイズ
              </div>
              <div>{fileService.formatFileSize(fileMetadata.fileSize)}</div>

              <div className="text-muted-foreground font-medium">作成日時</div>
              <div>{fileMetadata.createdAt.toLocaleString('ja-JP')}</div>

              <div className="text-muted-foreground font-medium">更新日時</div>
              <div>{fileMetadata.updatedAt.toLocaleString('ja-JP')}</div>

              <div className="text-muted-foreground font-medium">
                最終アクセス
              </div>
              <div>
                {fileMetadata.lastAccessedAt.toLocaleString('ja-JP')} (
                {fileService.formatRelativeTime(fileMetadata.lastAccessedAt)})
              </div>

              <div className="text-muted-foreground font-medium">
                アクセス回数
              </div>
              <div>{fileMetadata.accessCount}回</div>
            </div>
          </div>

          {/* Tag editing section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-primary" />
              タグ
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="タグを追加..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {editedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Memo editing section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Edit className="h-4 w-4 text-primary" />
              メモ
            </div>

            <Textarea
              placeholder="このファイルについてのメモを追加..."
              value={editedMemo}
              onChange={(e) => setEditedMemo(e.target.value)}
              rows={4}
              className="resize-y"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="flex-row justify-between items-center pt-4 border-t">
          <Button
            variant={fileMetadata.isFavorite ? 'default' : 'outline'}
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={cn(
              fileMetadata.isFavorite &&
                'bg-yellow-500 hover:bg-yellow-600 text-white'
            )}
          >
            <Star
              className={cn(
                'h-4 w-4 mr-2',
                fileMetadata.isFavorite && 'fill-current'
              )}
            />
            お気に入り
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenFolder}
              disabled={isLoading}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              フォルダを開く
            </Button>
            <Button onClick={handleOpenFile} disabled={isLoading}>
              <ExternalLink className="h-4 w-4 mr-2" />
              ファイルを開く
            </Button>
          </div>
        </DialogFooter>

        {/* Save button (appears when there are unsaved changes) */}
        {hasUnsavedChanges && (
          <div className="border-t pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '保存中...' : '変更を保存'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileDetailModal;
