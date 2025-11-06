// CocoFile - Scan Index Screen (S-003)
// Scan execution, index statistics, and duplicate file management

import React, { useState } from 'react';
import {
  RefreshCw,
  Trash2,
  RotateCcw,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScanData } from '@/hooks/useScanData';
import type { DuplicateFileGroup } from '@/types';

export const ScanIndexScreen: React.FC = () => {
  const {
    scanSession,
    statistics,
    duplicates,
    loading,
    error,
    isScanning,
    startScan,
    cleanupDatabase,
    rebuildDatabase,
  } = useScanData();

  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分`;
  };

  // Handle manual scan start
  const handleStartScan = async () => {
    try {
      setOperationMessage(null);
      await startScan();
    } catch (err) {
      setOperationMessage('スキャンの開始に失敗しました');
    }
  };

  // Handle cleanup
  const handleCleanup = async () => {
    if (
      !window.confirm(
        '存在しないファイルをインデックスから削除します。よろしいですか？'
      )
    ) {
      return;
    }

    try {
      setIsCleaningUp(true);
      setOperationMessage(null);
      const result = await cleanupDatabase();
      setOperationMessage(result.message);
    } catch (err) {
      setOperationMessage('クリーンアップに失敗しました');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Handle rebuild
  const handleRebuild = async () => {
    if (
      !window.confirm(
        'すべてのインデックスを削除して再スキャンします。この処理には時間がかかります。よろしいですか？'
      )
    ) {
      return;
    }

    try {
      setIsRebuilding(true);
      setOperationMessage(null);
      const result = await rebuildDatabase();
      setOperationMessage(result.message);
    } catch (err) {
      setOperationMessage('再構築に失敗しました');
    } finally {
      setIsRebuilding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">
          スキャン・インデックス管理
        </h1>

        {/* Operation Message */}
        {operationMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            {operationMessage}
          </div>
        )}

        {/* Scan Execution Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-medium text-gray-700 mb-4">
            スキャン実行
          </h2>
          <div className="flex gap-3 mb-4">
            <Button
              onClick={handleStartScan}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`}
              />
              手動スキャン開始
            </Button>
          </div>

          {/* Scan Progress */}
          {isScanning && scanSession && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-600">
                現在処理中: {scanSession.currentFile}
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${scanSession.progressPercent}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {scanSession.processedFiles.toLocaleString()} /{' '}
                {scanSession.totalFiles.toLocaleString()} ファイル (
                {scanSession.progressPercent}%) - 残り約
                {formatTimeRemaining(scanSession.estimatedTimeRemaining)}
              </div>
            </div>
          )}
        </div>

        {/* Index Statistics Section */}
        {statistics && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-base font-medium text-gray-700 mb-4">
              インデックス統計
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded p-4">
                <div className="text-xs text-gray-500 mb-1">総ファイル数</div>
                <div className="text-2xl font-medium text-gray-900">
                  {statistics.totalFiles.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="text-xs text-gray-500 mb-1">総サイズ</div>
                <div className="text-2xl font-medium text-gray-900">
                  {formatFileSize(statistics.totalSize)}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="text-xs text-gray-500 mb-1">最終更新日時</div>
                <div className="text-base font-medium text-gray-900">
                  {new Date(statistics.lastUpdatedAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Files Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-medium text-gray-700 mb-4">
            重複ファイル
          </h2>

          {duplicates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              重複ファイルはありません
            </div>
          ) : (
            <div className="space-y-3">
              {duplicates.map((group: DuplicateFileGroup, index: number) => (
                <div
                  key={group.groupId}
                  className="border border-gray-200 rounded p-3"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    グループ {index + 1} - {group.fileName} (
                    {formatFileSize(group.fileSize)})
                  </div>
                  <div className="space-y-1">
                    {group.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center gap-2 bg-gray-50 rounded px-2 py-2 text-xs"
                      >
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="flex-1 text-gray-600 truncate">
                          {file.filePath}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatFileSize(file.fileSize)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-base font-medium text-gray-700 mb-4">
            データベース管理
          </h2>
          <div className="flex gap-3 mb-2">
            <Button
              variant="secondary"
              onClick={handleCleanup}
              disabled={isCleaningUp || isScanning}
              className="flex items-center gap-2"
            >
              {isCleaningUp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              クリーンアップ
            </Button>
            <Button
              variant="destructive"
              onClick={handleRebuild}
              disabled={isRebuilding || isScanning}
              className="flex items-center gap-2"
            >
              {isRebuilding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
              再構築
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            クリーンアップ: 存在しないファイルをインデックスから削除
            <br />
            再構築: 全インデックスを削除して再スキャン（時間がかかります）
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanIndexScreen;
