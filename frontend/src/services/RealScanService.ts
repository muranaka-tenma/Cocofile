// CocoFile - Real Scan Service (Tauri API Integration)
// Phase 1: Basic scan and statistics integration

import { TauriService } from './TauriService';
import type {
  ScanSession,
  IndexStatistics,
  DuplicateFileGroup,
  DatabaseOperationResult,
} from '@/types';
import { SCAN_STATUS } from '@/types';

/**
 * Real Scan Service - Tauri API統合版
 * Phase 1: スキャン開始とDB統計のみ実装
 * Phase 2: 進捗管理、停止、重複検出、クリーンアップを実装予定
 */
export class RealScanService {
  private currentSession: ScanSession | null = null;

  /**
   * Start directory scan
   * Phase 1: 基本的なスキャン開始（進捗管理はPhase 2）
   */
  async startScan(targetFolder?: string): Promise<ScanSession> {
    try {
      if (!targetFolder) {
        throw new Error('Target folder is required');
      }

      const sessionId = `scan-${Date.now()}`;

      // セッションを作成（進捗管理はPhase 2で実装）
      this.currentSession = {
        sessionId,
        status: SCAN_STATUS.SCANNING,
        targetFolder,
        currentFile: '',
        processedFiles: 0,
        totalFiles: 0,
        progressPercent: 0,
        startedAt: new Date(),
        estimatedTimeRemaining: 0,
        elapsedTime: 0,
      };

      // Tauriバックエンドでスキャン開始（非同期）
      TauriService.scanDirectory(targetFolder)
        .then((result) => {
          console.log('Scan completed:', result);
          if (this.currentSession) {
            this.currentSession.status = SCAN_STATUS.COMPLETED;
            this.currentSession.processedFiles = result.processed_files;
            this.currentSession.totalFiles = result.total_files;
            this.currentSession.progressPercent = 100;
          }
        })
        .catch((error) => {
          console.error('Scan failed:', error);
          if (this.currentSession) {
            this.currentSession.status = SCAN_STATUS.ERROR;
          }
        });

      return this.currentSession;
    } catch (error) {
      console.error('Start scan error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to start scan'
      );
    }
  }

  /**
   * Get scan status
   * Phase 1: 簡易実装（Phase 2で進捗管理を完全実装）
   */
  async getScanStatus(): Promise<ScanSession | null> {
    return this.currentSession;
  }

  /**
   * Stop scan
   * Phase 2: バックエンドAPI実装後に統合
   */
  async stopScan(): Promise<void> {
    console.warn('Stop scan not yet implemented (Phase 2)');
    if (this.currentSession) {
      this.currentSession.status = SCAN_STATUS.PAUSED;
    }
  }

  /**
   * Get database statistics
   * Phase 1: Tauri API統合完了
   */
  async getStatistics(): Promise<IndexStatistics> {
    try {
      const stats = await TauriService.getDatabaseStats();

      // Tauri結果をフロントエンド型に変換
      return {
        totalFiles: stats.total_files,
        totalSize: 0, // Phase 2で実装
        databaseSize: stats.db_size_bytes,
        fileTypeBreakdown: [], // Phase 2で実装
        lastUpdatedAt: new Date(),
        lastScannedAt: new Date(),
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get statistics'
      );
    }
  }

  /**
   * Get duplicate files
   * Phase 2: バックエンドAPI実装後に統合
   */
  async getDuplicates(): Promise<DuplicateFileGroup[]> {
    console.warn('Get duplicates not yet implemented (Phase 2)');
    return [];
  }

  /**
   * Cleanup database
   * Phase 2: バックエンドAPI実装後に統合
   */
  async cleanup(): Promise<DatabaseOperationResult> {
    console.warn('Cleanup not yet implemented (Phase 2)');
    return {
      success: false,
      message: 'Cleanup feature not yet implemented (Phase 2)',
    };
  }

  /**
   * Rebuild database
   * Phase 2: バックエンドAPI実装後に統合
   */
  async rebuild(): Promise<DatabaseOperationResult> {
    console.warn('Rebuild not yet implemented (Phase 2)');
    return {
      success: false,
      message: 'Rebuild feature not yet implemented (Phase 2)',
    };
  }

  /**
   * Cleanup method (for component unmount)
   */
  destroy() {
    // Phase 2で実装
  }
}
