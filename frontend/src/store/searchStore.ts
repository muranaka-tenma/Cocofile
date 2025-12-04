// CocoFile - Search State Store (Zustand)
// Manages the state for the main search screen

import { create } from "zustand";
import type {
  SearchResult,
  SearchFilters,
  TabType,
  FileType,
  DateRangeFilter,
} from "@/types";
import { TAB_TYPES } from "@/types";

export const SORT_OPTIONS = {
  RELEVANCE: "relevance",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  DATE_DESC: "date_desc",
  DATE_ASC: "date_asc",
  SIZE_DESC: "size_desc",
  SIZE_ASC: "size_asc",
  FREQUENT: "frequent",
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export const SEARCH_FIELDS = {
  ALL: "all",
  FILE_NAME: "fileName",
  CONTENT: "content",
  TAGS: "tags",
  MEMO: "memo",
} as const;

export type SearchField = (typeof SEARCH_FIELDS)[keyof typeof SEARCH_FIELDS];

export interface SearchHistoryItem {
  keyword: string;
  field: SearchField;
  timestamp: Date;
}

interface SearchState {
  // Search state
  keyword: string;
  filters: SearchFilters;
  activeTab: TabType;
  sortBy: SortOption;
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;
  searchHistory: SearchHistoryItem[];
  isRegexMode: boolean;
  regexError: string | null;

  // Actions
  setKeyword: (keyword: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setActiveTab: (tab: TabType) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  setIsRegexMode: (isRegexMode: boolean) => void;
  setRegexError: (error: string | null) => void;

  // Filter actions
  toggleTag: (tag: string) => void;
  toggleFileType: (fileType: FileType) => void;
  setDateRange: (dateRange: DateRangeFilter) => void;
  clearFilters: () => void;

  // Search history actions
  addSearchHistory: (item: SearchHistoryItem) => void;
  removeSearchHistory: (index: number) => void;
  clearSearchHistory: () => void;

  // Computed
  hasActiveFilters: () => boolean;
}

const initialFilters: SearchFilters = {
  tags: [],
  dateRange: {},
  fileTypes: [],
};

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  keyword: "",
  filters: initialFilters,
  activeTab: TAB_TYPES.SEARCH_RESULTS,
  sortBy: SORT_OPTIONS.RELEVANCE,
  searchResults: [],
  isSearching: false,
  error: null,
  searchHistory: [],
  isRegexMode: false,
  regexError: null,

  // Basic actions
  setKeyword: (keyword) => set({ keyword }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSearchResults: (results) => set({ searchResults: results }),

  setIsSearching: (isSearching) => set({ isSearching }),

  setError: (error) => set({ error }),

  setIsRegexMode: (isRegexMode) => set({ isRegexMode, regexError: null }),

  setRegexError: (regexError) => set({ regexError }),

  // Filter actions
  toggleTag: (tag) =>
    set((state) => {
      const tags = state.filters.tags.includes(tag)
        ? state.filters.tags.filter((t) => t !== tag)
        : [...state.filters.tags, tag];

      return {
        filters: { ...state.filters, tags },
      };
    }),

  toggleFileType: (fileType) =>
    set((state) => {
      const fileTypes = state.filters.fileTypes.includes(fileType)
        ? state.filters.fileTypes.filter((t) => t !== fileType)
        : [...state.filters.fileTypes, fileType];

      return {
        filters: { ...state.filters, fileTypes },
      };
    }),

  setDateRange: (dateRange) =>
    set((state) => ({
      filters: { ...state.filters, dateRange },
    })),

  clearFilters: () =>
    set({
      filters: initialFilters,
    }),

  // Search history actions
  addSearchHistory: (item) =>
    set((state) => {
      // Don't add duplicates - check if the same keyword already exists
      const isDuplicate = state.searchHistory.some(
        (h) => h.keyword === item.keyword && h.field === item.field,
      );

      if (isDuplicate) {
        return state;
      }

      // Add to the beginning and keep only last 50 items
      return {
        searchHistory: [item, ...state.searchHistory].slice(0, 50),
      };
    }),

  removeSearchHistory: (index) =>
    set((state) => ({
      searchHistory: state.searchHistory.filter((_, i) => i !== index),
    })),

  clearSearchHistory: () => set({ searchHistory: [] }),

  // Computed
  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.tags.length > 0 ||
      filters.fileTypes.length > 0 ||
      !!filters.dateRange.startDate ||
      !!filters.dateRange.endDate
    );
  },
}));
