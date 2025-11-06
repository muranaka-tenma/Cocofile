// CocoFile - Real File Service (Tauri API Integration)
// Phase 1: Basic search integration with Tauri backend

import { TauriService } from './TauriService';
import type {
  SearchResult,
  FileMetadata,
  SearchFilters,
  FileType,
} from '@/types';
import { FILE_TYPES } from '@/types';

/**
 * Real File Service - Tauri API統合版
 * Phase 1: 検索機能のみ実装（お気に入り・最近使用はPhase 2）
 */
export class RealFileService {
  /**
   * Search files based on keyword and filters
   * Integrated with Tauri backend search_files command
   */
  async searchFiles(
    keyword?: string,
    filters?: Partial<SearchFilters>
  ): Promise<SearchResult[]> {
    try {
      // キーワードが空の場合は空配列を返す
      if (!keyword || keyword.trim() === '') {
        return [];
      }

      // Tauri バックエンドを呼び出し
      const tauriResults = await TauriService.searchFiles(keyword.trim());

      // Tauri結果をフロントエンド型に変換
      const searchResults: SearchResult[] = tauriResults.map((result) =>
        this.convertToSearchResult(result)
      );

      // フィルター適用（Phase 1ではファイル種別のみ）
      let filteredResults = searchResults;

      if (filters?.fileTypes && filters.fileTypes.length > 0) {
        filteredResults = filteredResults.filter((result) =>
          filters.fileTypes!.includes(result.fileType)
        );
      }

      // タグフィルターは Phase 2 で実装（バックエンドでタグ取得が必要）
      if (filters?.tags && filters.tags.length > 0) {
        console.warn('Tag filtering not yet implemented (Phase 2)');
      }

      return filteredResults;
    } catch (error) {
      console.error('Search files error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to search files'
      );
    }
  }

  /**
   * Get favorite files
   * Phase 3: 統合完了
   */
  async getFavorites(): Promise<SearchResult[]> {
    try {
      const tauriResults = await TauriService.getFavorites();
      return tauriResults.map((result) => this.convertToSearchResult(result));
    } catch (error) {
      console.error('Get favorites error:', error);
      throw new Error('Failed to get favorites');
    }
  }

  /**
   * Get recent files
   * Phase 3: 統合完了
   */
  async getRecentFiles(): Promise<SearchResult[]> {
    try {
      const tauriResults = await TauriService.getRecentFiles();
      return tauriResults.map((result) => this.convertToSearchResult(result));
    } catch (error) {
      console.error('Get recent files error:', error);
      throw new Error('Failed to get recent files');
    }
  }

  /**
   * Toggle favorite status
   * Phase 3: 統合完了
   */
  async toggleFavorite(filePath: string): Promise<void> {
    try {
      await TauriService.toggleFavorite(filePath);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  /**
   * Open file in default application
   * Phase 3: アクセス記録も更新
   */
  async openFile(filePath: string): Promise<void> {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(filePath);
      // アクセス記録を更新
      await TauriService.recordFileAccess(filePath);
    } catch (error) {
      console.error('Failed to open file:', error);
      throw new Error('Failed to open file');
    }
  }

  /**
   * Open file location in explorer
   * Tauriのshellプラグインを使用
   */
  async openFileLocation(filePath: string): Promise<void> {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      // ファイルパスからディレクトリを抽出
      const directory = filePath.substring(0, filePath.lastIndexOf('/'));
      await open(directory);
    } catch (error) {
      console.error('Failed to open folder:', error);
      throw new Error('Failed to open folder');
    }
  }

  /**
   * Get file details
   * Phase 2: バックエンドAPI実装後に統合
   */
  async getFileDetails(filePath: string): Promise<FileMetadata | null> {
    console.warn('File details not yet implemented (Phase 2):', filePath);
    return null;
  }

  /**
   * Get file metadata
   * Phase 2: バックエンドAPI実装後に統合
   */
  async getFileMetadata(filePath: string): Promise<FileMetadata | null> {
    console.warn('Get file metadata not yet implemented (Phase 2):', filePath);
    return null;
  }

  /**
   * Update file tags
   * Phase 3: 統合完了
   */
  async updateTags(filePath: string, tags: string[]): Promise<void> {
    try {
      await TauriService.updateFileTags(filePath, tags);
    } catch (error) {
      console.error('Update tags error:', error);
      throw new Error('Failed to update tags');
    }
  }

  /**
   * Update file memo
   * Phase 3: memoはDBにあるが、Tauri APIは未実装
   * TODO: Rust側にupdate_file_memo APIを追加する必要あり
   */
  async updateMemo(filePath: string, memo: string): Promise<void> {
    console.warn('Update memo API not yet exposed (TODO):', filePath, memo);
    // Rust側にAPIを追加する必要がある
  }

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Format date to relative time
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return new Date(date).toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return 'たった今';
    }
  }

  /**
   * Convert Tauri SearchResult to frontend SearchResult
   * Phase 1: 最小限の変換（メタデータは Phase 2 で完全実装）
   */
  private convertToSearchResult(
    tauriResult: Awaited<ReturnType<typeof TauriService.searchFiles>>[0]
  ): SearchResult {
    // ファイル拡張子から FileType を推定
    const fileType = this.inferFileType(tauriResult.file_type);

    // Phase 1: 最小限のメタデータ（Phase 2で完全実装）
    const metadata: FileMetadata = {
      fileName: tauriResult.file_name,
      filePath: tauriResult.file_path,
      fileType,
      fileSize: tauriResult.file_size,
      hashValue: '', // Phase 2で実装
      extractedText: tauriResult.snippet || '',
      extractedKeywords: [],
      tags: [], // Phase 2で実装
      isFavorite: false, // Phase 2で実装
      createdAt: new Date(), // Phase 2で実装
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 0,
      indexedAt: new Date(),
      lastIndexUpdatedAt: new Date(),
    };

    return {
      filePath: tauriResult.file_path,
      fileName: tauriResult.file_name,
      fileType,
      fileSize: tauriResult.file_size,
      relevanceScore: tauriResult.rank || 0,
      frequencyScore: 0, // Phase 2で実装
      lastAccessedAt: new Date(),
      metadata,
    };
  }

  /**
   * Infer FileType from file extension
   */
  private inferFileType(fileTypeStr: string): FileType {
    const lowerType = fileTypeStr.toLowerCase();

    if (lowerType === 'pdf') return FILE_TYPES.PDF;
    if (lowerType === 'xlsx' || lowerType === 'xls' || lowerType === 'excel')
      return FILE_TYPES.EXCEL;
    if (lowerType === 'docx' || lowerType === 'doc' || lowerType === 'word')
      return FILE_TYPES.WORD;
    if (
      lowerType === 'pptx' ||
      lowerType === 'ppt' ||
      lowerType === 'powerpoint'
    )
      return FILE_TYPES.POWERPOINT;

    // デフォルトはPDF
    return FILE_TYPES.PDF;
  }
}
