// CocoFile - Search Data Hook
// Custom hook for managing search operations and data fetching
// Phase 1: Integrated with real Tauri backend API

import { useEffect, useCallback } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { RealFileService } from '@/services/RealFileService';
import { TAB_TYPES, type SearchResult } from '@/types';

const fileService = new RealFileService();

export const useSearchData = () => {
  const {
    keyword,
    filters,
    activeTab,
    searchResults,
    isSearching,
    error,
    setSearchResults,
    setIsSearching,
    setError,
  } = useSearchStore();

  // Perform search based on current keyword and filters
  const performSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);

      let results: SearchResult[] = [];

      switch (activeTab) {
        case TAB_TYPES.SEARCH_RESULTS:
          results = await fileService.searchFiles(keyword, filters);
          break;

        case TAB_TYPES.FAVORITES:
          results = await fileService.getFavorites();
          break;

        case TAB_TYPES.RECENT:
          results = await fileService.getRecentFiles();
          break;

        default:
          results = [];
      }

      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, filters, activeTab, setSearchResults, setIsSearching, setError]);

  // Auto-search when keyword, filters, or tab changes
  useEffect(() => {
    // Debounce search for keyword input
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (filePath: string) => {
      try {
        await fileService.toggleFavorite(filePath);
        // Refresh search results
        await performSearch();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
        console.error('Toggle favorite error:', err);
      }
    },
    [performSearch, setError]
  );

  // Open file in default application
  const openFile = useCallback(
    async (filePath: string) => {
      try {
        await fileService.openFile(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to open file');
        console.error('Open file error:', err);
      }
    },
    [setError]
  );

  // Open file location in explorer
  const openFileLocation = useCallback(
    async (filePath: string) => {
      try {
        await fileService.openFileLocation(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to open folder');
        console.error('Open folder error:', err);
      }
    },
    [setError]
  );

  // Format helpers (expose from service)
  const formatFileSize = useCallback(
    (bytes: number) => fileService.formatFileSize(bytes),
    []
  );

  const formatRelativeTime = useCallback(
    (date: Date) => fileService.formatRelativeTime(date),
    []
  );

  return {
    // State
    searchResults,
    isSearching,
    error,

    // Actions
    performSearch,
    toggleFavorite,
    openFile,
    openFileLocation,
    refetch: performSearch,

    // Helpers
    formatFileSize,
    formatRelativeTime,
  };
};
