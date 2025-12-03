// CocoFile - Batch Tag Management Dialog
// Dialog for adding/removing tags from multiple files

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
import { TagBadge } from "@/components/TagBadge";
import { Plus, Tag, Trash2 } from "lucide-react";

interface BatchTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "remove";
  selectedCount: number;
  existingTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const BatchTagDialog: React.FC<BatchTagDialogProps> = ({
  open,
  onOpenChange,
  mode,
  selectedCount,
  existingTags,
  onAddTag,
  onRemoveTag,
}) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      onAddTag(trimmedTag);
      setNewTag("");
      onOpenChange(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onRemoveTag(tag);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "add" ? (
              <>
                <Plus className="h-5 w-5 text-blue-600" />
                タグを一括追加
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 text-red-600" />
                タグを一括削除
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selection info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            {selectedCount}件のファイルが選択されています
          </div>

          {mode === "add" ? (
            /* Add tag mode */
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  追加するタグ名
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="タグ名を入力..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    autoFocus
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    追加
                  </Button>
                </div>
              </div>

              {/* Existing tags for quick add */}
              {existingTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    既存のタグから選択
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {existingTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          onAddTag(tag);
                          onOpenChange(false);
                        }}
                        className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Remove tag mode */
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                削除するタグを選択
              </label>
              {existingTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {existingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="group"
                    >
                      <TagBadge
                        tagName={tag}
                        onRemove={() => handleRemoveTag(tag)}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  選択されたファイルに共通するタグがありません
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchTagDialog;
