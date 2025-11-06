import React, { useEffect, useState } from 'react';
import { organizationService } from '../services/OrganizationService';
import type { OrganizationSuggestion, OrganizationSummary } from '../types';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

/**
 * S-006: ファイル整理画面
 * Phase 7: ファイル整理支援機能
 */
const FileOrganizationScreen: React.FC = () => {
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrganizationSummary>({
    needsOrganization: 0,
    suggested: 0,
    completed: 0,
  });

  // 提案を読み込み
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationService.getOrganizationSuggestions();
      setSuggestions(data);
      setSummary({
        needsOrganization: data.length,
        suggested: data.length,
        completed: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '提案の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル選択のトグル
  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedFiles.size === suggestions.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(suggestions.map((s) => s.filePath)));
    }
  };

  // 単一ファイルを移動
  const moveFile = async (filePath: string, destination: string) => {
    try {
      await organizationService.applyOrganizationSuggestion(
        filePath,
        destination
      );
      // 成功したら提案リストから削除
      setSuggestions((prev) => prev.filter((s) => s.filePath !== filePath));
      setSummary((prev) => ({
        ...prev,
        completed: prev.completed + 1,
        needsOrganization: prev.needsOrganization - 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイル移動に失敗しました');
    }
  };

  // 選択したファイルを一括移動
  const moveSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;

    setIsLoading(true);
    try {
      const moves = suggestions
        .filter((s) => selectedFiles.has(s.filePath))
        .map((s) => ({
          source: s.filePath,
          destination: s.suggestedDestination,
        }));

      const result = await organizationService.moveFilesBatch(moves);

      // 成功したファイルを提案リストから削除
      if (result.successCount > 0) {
        const movedFiles = new Set(moves.map((m) => m.source));
        setSuggestions((prev) =>
          prev.filter((s) => !movedFiles.has(s.filePath))
        );
        setSummary((prev) => ({
          ...prev,
          completed: prev.completed + result.successCount,
          needsOrganization: prev.needsOrganization - result.successCount,
        }));
        setSelectedFiles(new Set());
      }

      // エラーがあれば表示
      if (result.failedCount > 0) {
        setError(
          `${result.failedCount}件のファイル移動に失敗しました:\n${result.errors.join('\n')}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '一括移動に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 信頼度バッジの色
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📁 ファイル整理アシスタント
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          散らばったファイルを適切な場所に整理しましょう
        </p>
      </div>

      {/* サマリーカード */}
      <Card className="mb-6 p-4">
        <div className="flex gap-6">
          <div>
            <div className="text-sm text-gray-600">要整理</div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.needsOrganization}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">提案済み</div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.suggested}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">完了</div>
            <div className="text-2xl font-bold text-green-600">
              {summary.completed}
            </div>
          </div>
        </div>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-2 mb-4">
        <Button onClick={toggleSelectAll} variant="outline">
          {selectedFiles.size === suggestions.length
            ? '全選択解除'
            : '全選択'}
        </Button>
        <Button
          onClick={moveSelectedFiles}
          disabled={selectedFiles.size === 0 || isLoading}
        >
          選択項目を移動 ({selectedFiles.size})
        </Button>
        <Button onClick={loadSuggestions} variant="outline" disabled={isLoading}>
          🔄 再読み込み
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* ファイル一覧 */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading && suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            読み込み中...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            整理が必要なファイルはありません
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.filePath} className="p-4">
              <div className="flex items-start gap-3">
                {/* チェックボックス */}
                <input
                  type="checkbox"
                  checked={selectedFiles.has(suggestion.filePath)}
                  onChange={() => toggleFileSelection(suggestion.filePath)}
                  className="mt-1"
                />

                {/* ファイル情報 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {suggestion.fileName}
                    </h3>
                    <Badge className={getConfidenceBadgeColor(suggestion.confidence)}>
                      信頼度: {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">📍 現在:</span>
                      <span className="font-mono text-xs">
                        {suggestion.currentLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">💡 提案:</span>
                      <span className="font-mono text-xs text-blue-600">
                        {suggestion.suggestedDestination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="font-medium">理由:</span>
                      <span>{suggestion.reason}</span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        moveFile(
                          suggestion.filePath,
                          suggestion.suggestedDestination
                        )
                      }
                    >
                      移動する
                    </Button>
                    <Button size="sm" variant="outline">
                      別の場所...
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FileOrganizationScreen;
