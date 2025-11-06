/**
 * Tauri Service - バックエンドAPI呼び出し
 *
 * Tauriコマンドを呼び出すためのサービスレイヤー
 * Phase 3: 全機能API統合完了
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * Tauri環境かどうかをチェック
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * データベース統計情報
 */
export interface DatabaseStats {
  total_files: number;
  total_tags: number;
  db_size_bytes: number;
}

/**
 * ファイル分析結果
 */
export interface AnalyzeResult {
  text: string;
  file_size: number;
  page_count?: number;
  sheet_count?: number;
  slide_count?: number;
}

/**
 * ファイルスキャン結果
 */
export interface ScanResult {
  total_files: number;
  processed_files: number;
  errors: string[];
}

/**
 * 検索結果
 */
export interface SearchResult {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  snippet?: string;
  rank?: number;
}

/**
 * Tauriバックエンドサービス
 */
export class TauriService {
  /**
   * データベースを初期化
   */
  static async initializeDatabase(): Promise<string> {
    return await invoke<string>('initialize_db');
  }

  /**
   * データベース統計情報を取得
   */
  static async getDatabaseStats(): Promise<DatabaseStats> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Using mock database stats (not in Tauri environment)');
      return {
        total_files: 1234,
        total_tags: 15,
        db_size_bytes: 5242880, // 5MB
      };
    }
    return await invoke<DatabaseStats>('get_db_stats');
  }

  /**
   * Pythonバックエンドのヘルスチェック
   */
  static async pythonHealthCheck(): Promise<string> {
    return await invoke<string>('python_health_check');
  }

  /**
   * PDFファイルを分析
   *
   * @param filePath - 分析するPDFファイルのパス
   * @returns 分析結果（テキスト、ページ数など）
   */
  static async analyzePdfFile(filePath: string): Promise<AnalyzeResult> {
    return await invoke<AnalyzeResult>('analyze_pdf_file', { filePath });
  }

  /**
   * Excelファイルを分析
   *
   * @param filePath - 分析するExcelファイルのパス
   * @returns 分析結果（テキスト、シート数など）
   */
  static async analyzeExcelFile(filePath: string): Promise<AnalyzeResult> {
    return await invoke<AnalyzeResult>('analyze_excel_file', { filePath });
  }

  /**
   * Wordファイルを分析
   *
   * @param filePath - 分析するWordファイルのパス
   * @returns 分析結果（テキストなど）
   */
  static async analyzeWordFile(filePath: string): Promise<AnalyzeResult> {
    return await invoke<AnalyzeResult>('analyze_word_file', { filePath });
  }

  /**
   * PowerPointファイルを分析
   *
   * @param filePath - 分析するPowerPointファイルのパス
   * @returns 分析結果（テキスト、スライド数など）
   */
  static async analyzePptFile(filePath: string): Promise<AnalyzeResult> {
    return await invoke<AnalyzeResult>('analyze_ppt_file', { filePath });
  }

  /**
   * ファイルタイプに応じて適切な分析関数を呼び出す
   *
   * @param filePath - ファイルパス
   * @returns 分析結果
   */
  static async analyzeFile(filePath: string): Promise<AnalyzeResult> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return await this.analyzePdfFile(filePath);
      case 'xlsx':
      case 'xls':
        return await this.analyzeExcelFile(filePath);
      case 'docx':
        return await this.analyzeWordFile(filePath);
      case 'pptx':
        return await this.analyzePptFile(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * ディレクトリをスキャンしてファイルをインデックス化
   *
   * @param directory - スキャンするディレクトリのパス
   * @returns スキャン結果
   */
  static async scanDirectory(directory: string): Promise<ScanResult> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock scanDirectory called:', directory);
      // モックでスキャンを模擬（2秒待機）
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        total_files: 150,
        processed_files: 150,
        errors: [],
      };
    }
    return await invoke<ScanResult>('scan_directory', { directory });
  }

  /**
   * ファイルを検索
   *
   * @param keyword - 検索キーワード
   * @returns 検索結果のリスト
   */
  static async searchFiles(keyword: string): Promise<SearchResult[]> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock searchFiles called:', keyword);
      // モック検索結果を返す
      return [
        {
          file_path: '/home/user/Documents/report.pdf',
          file_name: 'report.pdf',
          file_type: 'pdf',
          file_size: 1048576,
          snippet: `Sample text containing "${keyword}"...`,
          rank: 0.95,
        },
        {
          file_path: '/home/user/Documents/presentation.pptx',
          file_name: 'presentation.pptx',
          file_type: 'powerpoint',
          file_size: 2097152,
          snippet: `Found "${keyword}" in slide 3...`,
          rank: 0.82,
        },
        {
          file_path: '/home/user/Downloads/invoice.xlsx',
          file_name: 'invoice.xlsx',
          file_type: 'excel',
          file_size: 524288,
          snippet: `${keyword} appears in Sheet1...`,
          rank: 0.75,
        },
      ];
    }
    return await invoke<SearchResult[]>('search_files', { keyword });
  }

  // ========== タグ管理API ==========

  /**
   * タグ一覧を取得
   */
  static async getTags(): Promise<Tag[]> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Using mock tags (not in Tauri environment)');
      return [
        { tag_name: 'work', color: '#3b82f6', usage_count: 12, created_at: new Date().toISOString() },
        { tag_name: 'personal', color: '#10b981', usage_count: 8, created_at: new Date().toISOString() },
        { tag_name: 'important', color: '#ef4444', usage_count: 5, created_at: new Date().toISOString() },
      ];
    }
    return await invoke<Tag[]>('get_tags');
  }

  /**
   * タグを作成
   */
  static async createTag(
    tagName: string,
    color?: string
  ): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock createTag called:', tagName, color);
      return;
    }
    return await invoke('create_tag', { tagName, color });
  }

  /**
   * タグを更新
   */
  static async updateTag(
    tagName: string,
    color?: string
  ): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock updateTag called:', tagName, color);
      return;
    }
    return await invoke('update_tag', { tagName, color });
  }

  /**
   * タグを削除
   */
  static async deleteTag(tagName: string): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock deleteTag called:', tagName);
      return;
    }
    return await invoke('delete_tag', { tagName });
  }

  /**
   * ファイルにタグを追加
   */
  static async addTagToFile(
    filePath: string,
    tagName: string
  ): Promise<void> {
    return await invoke('add_tag_to_file', { filePath, tagName });
  }

  /**
   * ファイルからタグを削除
   */
  static async removeTagFromFile(
    filePath: string,
    tagName: string
  ): Promise<void> {
    return await invoke('remove_tag_from_file', { filePath, tagName });
  }

  /**
   * ファイルのタグ一覧を取得
   */
  static async getFileTags(filePath: string): Promise<string[]> {
    return await invoke<string[]>('get_file_tags', { filePath });
  }

  /**
   * ファイルのタグを一括更新
   */
  static async updateFileTags(
    filePath: string,
    tags: string[]
  ): Promise<void> {
    return await invoke('update_file_tags', { filePath, tags });
  }

  // ========== お気に入り管理API ==========

  /**
   * お気に入りを切り替え
   */
  static async toggleFavorite(filePath: string): Promise<boolean> {
    return await invoke<boolean>('toggle_favorite', { filePath });
  }

  /**
   * お気に入りファイル一覧を取得
   */
  static async getFavorites(): Promise<SearchResult[]> {
    return await invoke<SearchResult[]>('get_favorites');
  }

  /**
   * 最近使用したファイル一覧を取得
   */
  static async getRecentFiles(): Promise<SearchResult[]> {
    return await invoke<SearchResult[]>('get_recent_files');
  }

  /**
   * ファイルのアクセス記録を更新
   */
  static async recordFileAccess(filePath: string): Promise<void> {
    return await invoke('record_file_access', { filePath });
  }

  // ========== 設定管理API ==========

  /**
   * 設定を取得
   */
  static async getSettings(): Promise<TauriAppSettings> {
    if (!isTauriEnvironment()) {
      // ブラウザでの開発用モックデータ
      console.warn('[DEV] Using mock settings (not in Tauri environment)');
      return {
        watched_folders: ['/home/user/Documents', '/home/user/Downloads'],
        excluded_folders: ['/home/user/.cache'],
        excluded_extensions: ['.tmp', '.log'],
        scan_timing: 'realtime',
        hotkey: 'Ctrl+Shift+F',
        window_position: { x: 0, y: 0 },
        auto_hide: true,
        theme: 'light',
        default_tags: ['work', 'personal'],
      };
    }
    return await invoke<TauriAppSettings>('get_settings');
  }

  /**
   * 設定を保存
   */
  static async saveSettings(settings: TauriAppSettings): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock saveSettings called (not in Tauri environment)', settings);
      return;
    }
    return await invoke('save_settings', { settings });
  }

  /**
   * 監視フォルダを追加
   */
  static async addWatchedFolder(folderPath: string): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock addWatchedFolder called:', folderPath);
      return;
    }
    return await invoke('add_watched_folder', { folderPath });
  }

  /**
   * 監視フォルダを削除
   */
  static async removeWatchedFolder(folderPath: string): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock removeWatchedFolder called:', folderPath);
      return;
    }
    return await invoke('remove_watched_folder', { folderPath });
  }

  /**
   * 除外フォルダを追加
   */
  static async addExcludedFolder(folderPath: string): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock addExcludedFolder called:', folderPath);
      return;
    }
    return await invoke('add_excluded_folder', { folderPath });
  }

  /**
   * 除外フォルダを削除
   */
  static async removeExcludedFolder(folderPath: string): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[DEV] Mock removeExcludedFolder called:', folderPath);
      return;
    }
    return await invoke('remove_excluded_folder', { folderPath });
  }
}

// ========== 型定義 ==========

export interface Tag {
  tag_name: string;
  color: string | null;
  usage_count: number;
  created_at: string;
}

export interface TauriAppSettings {
  watched_folders: string[];
  excluded_folders: string[];
  excluded_extensions: string[];
  scan_timing: string;
  hotkey: string;
  window_position: { x: number; y: number };
  auto_hide: boolean;
  theme: string;
  default_tags: string[];
}
