// CocoFile - Search History Hook
// Manages search history with localStorage persistence

import { useEffect, useState } from "react";

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: Date;
  resultCount?: number;
}

const STORAGE_KEY = "cocofile_search_history";
const MAX_HISTORY_ITEMS = 20;

/**
 * Hook for managing search history
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, [history]);

  /**
   * Add a new search to history
   */
  const addSearch = (keyword: string, resultCount?: number) => {
    if (!keyword.trim()) return;

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (item) => item.keyword.toLowerCase() !== keyword.toLowerCase(),
      );

      // Add new item at the beginning
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        keyword: keyword.trim(),
        timestamp: new Date(),
        resultCount,
      };

      // Keep only the most recent items
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      return updated;
    });
  };

  /**
   * Remove a specific search from history
   */
  const removeSearch = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Get recent searches (top N items)
   */
  const getRecentSearches = (count: number = 10): SearchHistoryItem[] => {
    return history.slice(0, count);
  };

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches,
  };
};

export default useSearchHistory;
