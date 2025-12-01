// CocoFile - Search Results Cache Hook
// Implements LRU cache for search results to improve performance

import { useMemo, useCallback, useRef } from "react";
import type { SearchResult, SearchFilters } from "@/types";

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

interface SearchCacheConfig {
  maxSize?: number; // Maximum number of cached queries
  ttl?: number; // Time to live in milliseconds
}

/**
 * Creates a cache key from search parameters
 */
const createCacheKey = (keyword: string, filters: SearchFilters): string => {
  return JSON.stringify({
    keyword: keyword.trim().toLowerCase(),
    tags: filters.tags.sort(),
    fileTypes: filters.fileTypes.sort(),
    dateRange: filters.dateRange,
  });
};

/**
 * LRU Cache for search results
 */
class SearchCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(config: SearchCacheConfig = {}) {
    this.cache = new Map();
    this.maxSize = config.maxSize || 50;
    this.ttl = config.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  get(key: string): SearchResult[] | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.results;
  }

  set(key: string, results: SearchResult[]): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      results: [...results], // Create a copy to avoid mutations
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

/**
 * Hook for managing search result cache
 */
export const useSearchCache = (config?: SearchCacheConfig) => {
  // Use ref to persist cache across renders
  const cacheRef = useRef<SearchCache>(new SearchCache(config));

  const getCached = useCallback(
    (keyword: string, filters: SearchFilters): SearchResult[] | null => {
      const key = createCacheKey(keyword, filters);
      return cacheRef.current.get(key);
    },
    [],
  );

  const setCached = useCallback(
    (
      keyword: string,
      filters: SearchFilters,
      results: SearchResult[],
    ): void => {
      const key = createCacheKey(keyword, filters);
      cacheRef.current.set(key, results);
    },
    [],
  );

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const cacheStats = useMemo(() => {
    return cacheRef.current.getStats();
  }, []);

  return {
    getCached,
    setCached,
    clearCache,
    cacheStats,
  };
};

export default useSearchCache;
