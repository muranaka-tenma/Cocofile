// CocoFile - Tag Management Custom Hook
// Phase 4: Real API integrated

import { useEffect, useCallback } from 'react';
import { TauriService } from '@/services/TauriService';
import { useTagManagementStore } from '@/store/tagManagementStore';
import type { TagSortOrder } from '@/types';

export const useTagManagement = () => {
  const {
    tags,
    isLoading,
    isDeleting,
    error,
    sortOrder,
    selectedTagIds,
    setTags,
    setLoading,
    setDeleting,
    setError,
    setSortOrder,
    toggleTagSelection,
    clearSelection,
    selectAll,
    removeTag,
    removeTags,
  } = useTagManagementStore();

  /**
   * タグ一覧を取得
   */
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Tauri APIからタグ一覧を取得
      const tauriTags = await TauriService.getTags();

      // フロントエンド型に変換
      const convertedTags = tauriTags.map((tag) => ({
        id: tag.tag_name,
        name: tag.tag_name,
        color: tag.color || '#gray',
        useCount: tag.usage_count,
        createdAt: new Date(tag.created_at),
        lastUsedAt: new Date(), // Phase 2で実装予定
      }));

      setTags(convertedTags);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'タグ一覧の取得に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  }, [setTags, setLoading, setError]);

  /**
   * タグを作成
   */
  const createTag = useCallback(
    async (tagName: string, color?: string) => {
      try {
        setLoading(true);
        setError(null);

        await TauriService.createTag(tagName, color);
        await fetchTags();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'タグの作成に失敗しました'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTags, setLoading, setError]
  );

  /**
   * タグを編集
   */
  const editTag = useCallback(
    async (tagName: string, color?: string) => {
      try {
        setLoading(true);
        setError(null);

        await TauriService.updateTag(tagName, color);
        await fetchTags();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'タグの更新に失敗しました'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTags, setLoading, setError]
  );

  /**
   * タグを削除
   */
  const deleteTag = useCallback(
    async (tagName: string) => {
      try {
        setDeleting(true);
        setError(null);

        await TauriService.deleteTag(tagName);
        removeTag(tagName);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'タグの削除に失敗しました'
        );
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [removeTag, setDeleting, setError]
  );

  /**
   * 複数タグを一括削除
   */
  const deleteTags = useCallback(
    async (tagNames: string[]) => {
      try {
        setDeleting(true);
        setError(null);

        // 並列削除
        await Promise.all(
          tagNames.map((tagName) => TauriService.deleteTag(tagName))
        );

        removeTags(tagNames);
        clearSelection();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'タグの削除に失敗しました'
        );
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [removeTags, clearSelection, setDeleting, setError]
  );

  /**
   * タグをマージ（Phase 2で実装予定）
   */
  const mergeTags = useCallback(
    async (_sourceTagNames: string[], _targetTagName: string) => {
      console.warn('Tag merge not yet implemented (Phase 2)');
      setError('タグマージ機能は未実装です');
    },
    [setError]
  );

  /**
   * ソート順変更
   */
  const changeSortOrder = useCallback(
    (newSortOrder: TagSortOrder) => {
      setSortOrder(newSortOrder);
    },
    [setSortOrder]
  );

  /**
   * タグ統計情報を取得（Phase 2で実装予定）
   */
  const fetchStatistics = useCallback(async () => {
    console.warn('Tag statistics not yet implemented (Phase 2)');
    return {
      totalTags: tags.length,
      usedTags: tags.filter((t) => t.useCount > 0).length,
      unusedTags: tags.filter((t) => t.useCount === 0).length,
    };
  }, [tags]);

  /**
   * 未使用タグを一括削除（Phase 2で実装予定）
   */
  const deleteUnusedTags = useCallback(async () => {
    console.warn('Delete unused tags not yet implemented (Phase 2)');
    const unusedTags = tags.filter((t) => t.useCount === 0);
    if (unusedTags.length > 0) {
      await deleteTags(unusedTags.map((t) => t.id));
    }
  }, [tags, deleteTags]);

  // 初回ロード
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    isDeleting,
    isMerging: false,
    error,
    sortOrder,
    selectedTagIds,
    fetchTags,
    createTag,
    editTag,
    updateTag: editTag, // エイリアス
    deleteTag,
    deleteTags,
    deleteUnusedTags,
    mergeTags,
    changeSortOrder,
    toggleTagSelection,
    clearSelection,
    selectAll,
    fetchStatistics,
  };
};
