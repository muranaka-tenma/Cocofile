import { invoke } from '@tauri-apps/api/core';
import type {
  OrganizationSuggestion,
  FileMove,
  BatchMoveResult,
  OrganizationRule,
  MoveHistoryEntry,
  CloudFileStatus,
} from '../types';

/**
 * OrganizationService
 *
 * ファイル整理機能を提供するサービス
 * Phase 7: ファイル整理支援機能
 */
class OrganizationService {
  /**
   * 整理提案を取得
   */
  async getOrganizationSuggestions(): Promise<OrganizationSuggestion[]> {
    try {
      const suggestions = await invoke<OrganizationSuggestion[]>(
        'get_organization_suggestions'
      );
      return suggestions;
    } catch (error) {
      console.error('Failed to get organization suggestions:', error);
      throw new Error(`提案の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 整理提案を適用（ファイルを移動）
   */
  async applyOrganizationSuggestion(
    filePath: string,
    destination: string
  ): Promise<void> {
    try {
      await invoke('apply_organization_suggestion', {
        filePath,
        destination,
      });
    } catch (error) {
      console.error('Failed to apply organization suggestion:', error);
      throw new Error(`ファイル移動に失敗しました: ${error}`);
    }
  }

  /**
   * ファイルを一括移動
   */
  async moveFilesBatch(moves: FileMove[]): Promise<BatchMoveResult> {
    try {
      const result = await invoke<BatchMoveResult>('move_files_batch', {
        moves,
      });
      return result;
    } catch (error) {
      console.error('Failed to move files batch:', error);
      throw new Error(`一括移動に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザー定義ルール一覧を取得
   */
  async getUserRules(): Promise<OrganizationRule[]> {
    try {
      const rules = await invoke<OrganizationRule[]>('get_user_rules');
      return rules;
    } catch (error) {
      console.error('Failed to get user rules:', error);
      throw new Error(`ルール取得に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザー定義ルールを保存
   */
  async saveUserRule(rule: OrganizationRule): Promise<void> {
    try {
      await invoke('save_user_rule', { rule });
    } catch (error) {
      console.error('Failed to save user rule:', error);
      throw new Error(`ルール保存に失敗しました: ${error}`);
    }
  }

  /**
   * ユーザー定義ルールを削除
   */
  async deleteUserRule(ruleId: string): Promise<void> {
    try {
      await invoke('delete_user_rule', { ruleId });
    } catch (error) {
      console.error('Failed to delete user rule:', error);
      throw new Error(`ルール削除に失敗しました: ${error}`);
    }
  }

  /**
   * 移動履歴を取得
   */
  async getMoveHistory(limit?: number): Promise<MoveHistoryEntry[]> {
    try {
      const history = await invoke<MoveHistoryEntry[]>('get_move_history', {
        limit,
      });
      return history;
    } catch (error) {
      console.error('Failed to get move history:', error);
      throw new Error(`履歴取得に失敗しました: ${error}`);
    }
  }

  /**
   * クラウドファイルステータスを検出
   */
  async detectCloudFileStatus(filePath: string): Promise<CloudFileStatus> {
    try {
      const status = await invoke<CloudFileStatus>(
        'detect_cloud_file_status',
        { filePath }
      );
      return status;
    } catch (error) {
      console.error('Failed to detect cloud file status:', error);
      throw new Error(`クラウドステータス検出に失敗しました: ${error}`);
    }
  }
}

// シングルトンインスタンスをエクスポート
export const organizationService = new OrganizationService();
