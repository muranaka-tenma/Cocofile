// CocoFile - S-004 Tag Management Screen
// タグ管理画面

import React, { useState, useEffect } from 'react';
import { Tag, Edit, Trash2, Merge, Trash } from 'lucide-react';
import { useTagManagement } from '@/hooks/useTagManagement';
import { TAG_SORT_ORDER } from '@/types';
import type { TagStatistics } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const TagManagementScreen: React.FC = () => {
  const {
    tags,
    isLoading,
    isDeleting,
    isMerging,
    error,
    sortOrder,
    selectedTagIds,
    fetchStatistics,
    updateTag,
    deleteTag,
    mergeTags,
    deleteUnusedTags,
    toggleTagSelection,
    changeSortOrder,
  } = useTagManagement();

  // State for statistics
  const [statistics, setStatistics] = useState<TagStatistics | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [deleteUnusedDialogOpen, setDeleteUnusedDialogOpen] = useState(false);

  // Edit form state
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);

  // Merge form state
  const [mergeTargetName, setMergeTargetName] = useState('');

  // Delete target
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchStatistics();
      if (stats) {
        setStatistics(stats);
      }
    };
    loadStats();
  }, [tags, fetchStatistics]);

  // Handle edit
  const handleEditClick = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    if (tag) {
      setEditingTag({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSave = async () => {
    if (!editingTag) return;

    try {
      await updateTag(editingTag.name, editingTag.color);
      setEditDialogOpen(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  // Handle delete
  const handleDeleteClick = (tagId: string) => {
    setDeletingTagId(tagId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTagId) return;

    try {
      await deleteTag(deletingTagId);
      setDeleteDialogOpen(false);
      setDeletingTagId(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  // Handle merge
  const handleMergeClick = () => {
    if (selectedTagIds.length < 2) return;

    const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
    setMergeTargetName(selectedTags[0].name);
    setMergeDialogOpen(true);
  };

  const handleMergeConfirm = async () => {
    if (selectedTagIds.length < 2 || !mergeTargetName.trim()) return;

    try {
      await mergeTags(selectedTagIds, mergeTargetName.trim());
      setMergeDialogOpen(false);
      setMergeTargetName('');
    } catch (error) {
      console.error('Failed to merge tags:', error);
    }
  };

  // Handle delete unused
  const handleDeleteUnusedClick = () => {
    setDeleteUnusedDialogOpen(true);
  };

  const handleDeleteUnusedConfirm = async () => {
    try {
      await deleteUnusedTags();
      setDeleteUnusedDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete unused tags:', error);
    }
  };

  // Handle color change
  const handleColorChange = async (tagId: string, newColor: string) => {
    try {
      await updateTag(tagId, newColor);
    } catch (error) {
      console.error('Failed to update tag color:', error);
    }
  };

  if (isLoading && tags.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Tag className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">タグ管理</h1>
        </div>

        {/* Statistics */}
        {statistics && (
          <Card className="mb-6 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              全タグ数: <strong>{statistics.totalTags}</strong> | 使用中:{' '}
              <strong>{statistics.usedTags}</strong> | 未使用:{' '}
              <strong>{statistics.unusedTags}</strong>
            </div>
          </Card>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="sort-order" className="text-sm text-gray-600">
              並び順:
            </Label>
            <Select
              value={sortOrder}
              onValueChange={(value) =>
                changeSortOrder(value as typeof TAG_SORT_ORDER.USAGE)
              }
            >
              <SelectTrigger id="sort-order" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TAG_SORT_ORDER.USAGE}>使用頻度順</SelectItem>
                <SelectItem value={TAG_SORT_ORDER.NAME}>名前順</SelectItem>
                <SelectItem value={TAG_SORT_ORDER.CREATED}>作成日順</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleMergeClick}
              disabled={selectedTagIds.length < 2 || isMerging}
            >
              <Merge className="mr-2 h-4 w-4" />
              統合
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteUnusedClick}
              disabled={isDeleting}
            >
              <Trash className="mr-2 h-4 w-4" />
              未使用タグを削除
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Tag list */}
        <Card>
          <div className="divide-y">
            {tags.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Tag className="mx-auto mb-4 h-16 w-16 opacity-30" />
                <p>タグがありません</p>
              </div>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 ${
                    selectedTagIds.includes(tag.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => toggleTagSelection(tag.id)}
                  />

                  {/* Color indicator with color picker */}
                  <div className="relative">
                    <input
                      type="color"
                      value={tag.color}
                      onChange={(e) => handleColorChange(tag.id, e.target.value)}
                      className="h-6 w-6 cursor-pointer rounded-full border-2 border-gray-300"
                      title="カラーを変更"
                    />
                  </div>

                  {/* Tag name */}
                  <div className="flex-1 text-sm font-medium">{tag.name}</div>

                  {/* Use count */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{tag.useCount}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(tag.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを編集</DialogTitle>
            <DialogDescription>
              タグ名とカラーを変更できます。
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">タグ名</Label>
                <Input
                  id="edit-name"
                  value={editingTag.name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-color">カラー</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-color"
                    type="color"
                    value={editingTag.color}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, color: e.target.value })
                    }
                    className="h-10 w-20 cursor-pointer rounded border"
                  />
                  <span className="text-sm text-gray-600">
                    {editingTag.color}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleEditSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを削除</DialogTitle>
            <DialogDescription>
              このタグを削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを統合</DialogTitle>
            <DialogDescription>
              選択した {selectedTagIds.length} 個のタグを統合します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="merge-name">統合後のタグ名</Label>
              <Input
                id="merge-name"
                value={mergeTargetName}
                onChange={(e) => setMergeTargetName(e.target.value)}
                placeholder="新しいタグ名を入力"
              />
            </div>
            <div className="text-sm text-gray-600">
              統合元タグ:
              <ul className="mt-2 list-inside list-disc">
                {tags
                  .filter((tag) => selectedTagIds.includes(tag.id))
                  .map((tag) => (
                    <li key={tag.id}>{tag.name}</li>
                  ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMergeDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleMergeConfirm}
              disabled={!mergeTargetName.trim() || isMerging}
            >
              統合
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Unused Dialog */}
      <Dialog
        open={deleteUnusedDialogOpen}
        onOpenChange={setDeleteUnusedDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>未使用タグを削除</DialogTitle>
            <DialogDescription>
              使用回数が0のタグを全て削除します。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUnusedDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUnusedConfirm}
              disabled={isDeleting}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagManagementScreen;
