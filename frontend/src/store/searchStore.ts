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

interface SearchState {
  // Search state
  keyword: string;
  filters: SearchFilters;
  activeTab: TabType;
  sortBy: SortOption;
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;

  // Actions
  setKeyword: (keyword: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setActiveTab: (tab: TabType) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  toggleTag: (tag: string) => void;
  toggleFileType: (fileType: FileType) => void;
  setDateRange: (dateRange: DateRangeFilter) => void;
  clearFilters: () => void;

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
