// CocoFile - Tag Filter Dialog Component
// Allows users to select multiple tags for filtering search results

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
import { useTagManagementStore } from "@/store/tagManagementStore";
import { TagBadge } from "@/components/TagBadge";
import { Search, X } from "lucide-react";

interface TagFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagFilterDialog: React.FC<TagFilterDialogProps> = ({
  open,
  onOpenChange,
  selectedTags,
  onTagsChange,
}) => {
  const { tags } = useTagManagementStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>タグで絞り込み</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  選択中のタグ ({selectedTags.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  すべて解除
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                {selectedTags.map((tagName) => (
                  <TagBadge
                    key={tagName}
                    tagName={tagName}
                    size="sm"
                    onRemove={() => handleToggleTag(tagName)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available tags */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              タグ一覧 ({filteredTags.length})
            </p>
            <div className="max-h-96 overflow-y-auto border rounded-md p-3">
              {filteredTags.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  タグが見つかりませんでした
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-all text-left ${
                        selectedTags.includes(tag.name)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.name)}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {tag.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tag.useCount}件のファイル
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={() => onOpenChange(false)}>適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagFilterDialog;
