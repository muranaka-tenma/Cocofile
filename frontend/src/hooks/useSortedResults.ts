// CocoFile - Sorted Results Hook
// Sorts search results based on selected sort option

import { useMemo } from "react";
import type { SearchResult } from "@/types";
import { SORT_OPTIONS, type SortOption } from "@/store/searchStore";

export const useSortedResults = (
  results: SearchResult[],
  sortBy: SortOption,
): SearchResult[] => {
  return useMemo(() => {
    const sorted = [...results];

    switch (sortBy) {
      case SORT_OPTIONS.RELEVANCE:
        // Sort by relevance score (highest first)
        return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);

      case SORT_OPTIONS.NAME_ASC:
        // Sort by file name A-Z
        return sorted.sort((a, b) =>
          a.fileName.localeCompare(b.fileName, "ja"),
        );

      case SORT_OPTIONS.NAME_DESC:
        // Sort by file name Z-A
        return sorted.sort((a, b) =>
          b.fileName.localeCompare(a.fileName, "ja"),
        );

      case SORT_OPTIONS.DATE_DESC:
        // Sort by date (newest first)
        return sorted.sort(
          (a, b) =>
            b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime(),
        );

      case SORT_OPTIONS.DATE_ASC:
        // Sort by date (oldest first)
        return sorted.sort(
          (a, b) =>
            a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime(),
        );

      case SORT_OPTIONS.SIZE_DESC:
        // Sort by file size (largest first)
        return sorted.sort((a, b) => b.fileSize - a.fileSize);

      case SORT_OPTIONS.SIZE_ASC:
        // Sort by file size (smallest first)
        return sorted.sort((a, b) => a.fileSize - b.fileSize);

      case SORT_OPTIONS.FREQUENT:
        // Sort by access frequency (most accessed first)
        return sorted.sort(
          (a, b) => b.metadata.accessCount - a.metadata.accessCount,
        );

      default:
        return sorted;
    }
  }, [results, sortBy]);
};

export default useSortedResults;
