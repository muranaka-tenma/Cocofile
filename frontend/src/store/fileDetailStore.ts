// CocoFile - File Detail Modal State Store (Zustand)
// Manages the state for the file detail modal (S-005)

import { create } from 'zustand';
import type { FileMetadata } from '@/types';

interface FileDetailState {
  // Modal state
  isOpen: boolean;
  fileMetadata: FileMetadata | null;

  // Editing state
  editedTags: string[];
  editedMemo: string;
  hasUnsavedChanges: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  openModal: (metadata: FileMetadata) => void;
  closeModal: () => void;
  setFileMetadata: (metadata: FileMetadata) => void;
  setEditedTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setEditedMemo: (memo: string) => void;
  toggleFavorite: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetEditState: () => void;
  markSaved: () => void;
}

export const useFileDetailStore = create<FileDetailState>((set, get) => ({
  // Initial state
  isOpen: false,
  fileMetadata: null,
  editedTags: [],
  editedMemo: '',
  hasUnsavedChanges: false,
  isLoading: false,
  error: null,

  // Modal actions
  openModal: (metadata) =>
    set({
      isOpen: true,
      fileMetadata: metadata,
      editedTags: [...metadata.tags],
      editedMemo: metadata.memo || '',
      hasUnsavedChanges: false,
      error: null,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      fileMetadata: null,
      editedTags: [],
      editedMemo: '',
      hasUnsavedChanges: false,
      error: null,
    }),

  setFileMetadata: (metadata) =>
    set({
      fileMetadata: metadata,
      editedTags: [...metadata.tags],
      editedMemo: metadata.memo || '',
    }),

  // Tag actions
  setEditedTags: (tags) =>
    set({
      editedTags: tags,
      hasUnsavedChanges: true,
    }),

  addTag: (tag) => {
    const { editedTags } = get();
    if (!editedTags.includes(tag)) {
      set({
        editedTags: [...editedTags, tag],
        hasUnsavedChanges: true,
      });
    }
  },

  removeTag: (tag) => {
    const { editedTags } = get();
    set({
      editedTags: editedTags.filter((t) => t !== tag),
      hasUnsavedChanges: true,
    });
  },

  // Memo actions
  setEditedMemo: (memo) =>
    set({
      editedMemo: memo,
      hasUnsavedChanges: true,
    }),

  // Favorite action
  toggleFavorite: () => {
    const { fileMetadata } = get();
    if (fileMetadata) {
      set({
        fileMetadata: {
          ...fileMetadata,
          isFavorite: !fileMetadata.isFavorite,
        },
        hasUnsavedChanges: true,
      });
    }
  },

  // Loading state
  setIsLoading: (isLoading) => set({ isLoading }),

  // Error state
  setError: (error) => set({ error }),

  // Reset edit state to match file metadata
  resetEditState: () => {
    const { fileMetadata } = get();
    if (fileMetadata) {
      set({
        editedTags: [...fileMetadata.tags],
        editedMemo: fileMetadata.memo || '',
        hasUnsavedChanges: false,
      });
    }
  },

  // Mark changes as saved
  markSaved: () => set({ hasUnsavedChanges: false }),
}));
