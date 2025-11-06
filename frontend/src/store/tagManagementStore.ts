// CocoFile - Tag Management Store (Zustand)

import { create } from 'zustand';
import { TAG_SORT_ORDER } from '@/types';
import type { TagManagementItem, TagSortOrder } from '@/types';

interface TagManagementState {
  // Tag list
  tags: TagManagementItem[];

  // Loading states
  isLoading: boolean;
  isDeleting: boolean;
  isMerging: boolean;

  // Error state
  error: string | null;

  // UI state
  sortOrder: TagSortOrder;
  selectedTagIds: string[];

  // Actions
  setTags: (tags: TagManagementItem[]) => void;
  setLoading: (loading: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setMerging: (merging: boolean) => void;
  setError: (error: string | null) => void;
  setSortOrder: (order: TagSortOrder) => void;
  toggleTagSelection: (tagId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  updateTag: (tagId: string, updates: Partial<TagManagementItem>) => void;
  removeTag: (tagId: string) => void;
  removeTags: (tagIds: string[]) => void;
  addTag: (tag: TagManagementItem) => void;
  reset: () => void;
}

const initialState = {
  tags: [],
  isLoading: false,
  isDeleting: false,
  isMerging: false,
  error: null,
  sortOrder: TAG_SORT_ORDER.USAGE as TagSortOrder,
  selectedTagIds: [],
};

export const useTagManagementStore = create<TagManagementState>((set) => ({
  ...initialState,

  setTags: (tags) => set({ tags }),

  setLoading: (loading) => set({ isLoading: loading }),

  setDeleting: (deleting) => set({ isDeleting: deleting }),

  setMerging: (merging) => set({ isMerging: merging }),

  setError: (error) => set({ error }),

  setSortOrder: (order) => set({ sortOrder: order }),

  toggleTagSelection: (tagId) =>
    set((state) => {
      const isSelected = state.selectedTagIds.includes(tagId);
      return {
        selectedTagIds: isSelected
          ? state.selectedTagIds.filter((id) => id !== tagId)
          : [...state.selectedTagIds, tagId],
      };
    }),

  clearSelection: () => set({ selectedTagIds: [] }),

  selectAll: () =>
    set((state) => ({
      selectedTagIds: state.tags.map((tag) => tag.id),
    })),

  updateTag: (tagId, updates) =>
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === tagId ? { ...tag, ...updates } : tag
      ),
    })),

  removeTag: (tagId) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== tagId),
      selectedTagIds: state.selectedTagIds.filter((id) => id !== tagId),
    })),

  removeTags: (tagIds) =>
    set((state) => ({
      tags: state.tags.filter((tag) => !tagIds.includes(tag.id)),
      selectedTagIds: state.selectedTagIds.filter((id) => !tagIds.includes(id)),
    })),

  addTag: (tag) =>
    set((state) => ({
      tags: [...state.tags, tag],
    })),

  reset: () => set(initialState),
}));
