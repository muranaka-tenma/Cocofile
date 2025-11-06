use crate::database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::AppHandle;

/// ファイル整理提案
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrganizationSuggestion {
    pub file_path: String,
    pub file_name: String,
    pub current_location: String,
    pub suggested_destination: String,
    pub reason: String,
    pub confidence: f32,
    pub rule_id: Option<String>,
}

/// ファイル移動操作
#[derive(Debug, Serialize, Deserialize)]
pub struct FileMove {
    pub source: String,
    pub destination: String,
}

/// 一括移動結果
#[derive(Debug, Serialize, Deserialize)]
pub struct BatchMoveResult {
    pub success_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

/// 整理ルール
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrganizationRule {
    pub id: String,
    pub name: String,
    pub conditions: String, // JSON文字列
    pub destination: String,
    pub priority: i32,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// ファイル移動履歴
#[derive(Debug, Serialize, Deserialize)]
pub struct MoveHistoryEntry {
    pub id: i64,
    pub original_path: String,
    pub destination_path: String,
    pub moved_at: String,
    pub rule_id: Option<String>,
    pub user_confirmed: bool,
}

/// クラウドプロバイダー
#[derive(Debug, Serialize, Deserialize)]
pub enum CloudProvider {
    OneDrive,
    GoogleDrive,
    Dropbox,
}

/// 同期ステータス
#[derive(Debug, Serialize, Deserialize)]
pub enum SyncStatus {
    Synced,
    Syncing,
    OnlineOnly,
    Unknown,
}

/// クラウドファイルステータス
#[derive(Debug, Serialize, Deserialize)]
pub struct CloudFileStatus {
    pub is_cloud_file: bool,
    pub provider: Option<CloudProvider>,
    pub sync_status: SyncStatus,
    pub local_path: String,
    pub cloud_path: Option<String>,
}

/// 整理提案を取得
#[tauri::command]
pub fn get_organization_suggestions(app: AppHandle) -> Result<Vec<OrganizationSuggestion>, String> {
    let conn = database::get_connection(&app)?;

    // デスクトップとダウンロードフォルダの古いファイルを検出
    let mut stmt = conn
        .prepare(
            "SELECT file_path, file_name, file_type, file_size, created_at
             FROM file_metadata
             WHERE (file_path LIKE '%Desktop%' OR file_path LIKE '%Downloads%')
             ORDER BY created_at ASC
             LIMIT 100",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let suggestions_iter = stmt
        .query_map([], |row| {
            let file_path: String = row.get(0)?;
            let file_name: String = row.get(1)?;
            let file_type: String = row.get(2)?;

            // ファイルパスから現在の場所を取得
            let path = Path::new(&file_path);
            let current_location = path
                .parent()
                .and_then(|p| p.to_str())
                .unwrap_or("")
                .to_string();

            // 簡単なルールベースで提案先を決定
            let (suggested_destination, reason, confidence) = suggest_destination(&file_name, &file_type, &current_location);

            Ok(OrganizationSuggestion {
                file_path: file_path.clone(),
                file_name: file_name.clone(),
                current_location,
                suggested_destination,
                reason,
                confidence,
                rule_id: None,
            })
        })
        .map_err(|e| format!("Failed to query suggestions: {}", e))?;

    let mut suggestions = Vec::new();
    for suggestion in suggestions_iter {
        if let Ok(s) = suggestion {
            suggestions.push(s);
        }
    }

    Ok(suggestions)
}

/// 提案先を決定（シンプルなルールベース）
fn suggest_destination(file_name: &str, file_type: &str, current_location: &str) -> (String, String, f32) {
    let lower_name = file_name.to_lowercase();
    let home_dir = std::env::var("USERPROFILE").unwrap_or_else(|_| std::env::var("HOME").unwrap_or_default());

    // PDFレポート
    if file_type == "pdf" && (lower_name.contains("report") || lower_name.contains("レポート")) {
        return (
            format!("{}/Documents/Reports", home_dir),
            "PDFレポートファイル".to_string(),
            0.9,
        );
    }

    // 請求書・領収書
    if lower_name.contains("invoice") || lower_name.contains("請求書") || lower_name.contains("領収書") {
        return (
            format!("{}/Documents/Finance", home_dir),
            "請求書・領収書".to_string(),
            0.95,
        );
    }

    // Excel/Word/PowerPointファイル
    if file_type == "excel" || file_type == "xlsx" || file_type == "xls" {
        return (
            format!("{}/Documents/Spreadsheets", home_dir),
            "Excelファイル".to_string(),
            0.8,
        );
    }

    if file_type == "word" || file_type == "docx" {
        return (
            format!("{}/Documents/TextDocuments", home_dir),
            "Wordファイル".to_string(),
            0.8,
        );
    }

    if file_type == "powerpoint" || file_type == "pptx" {
        return (
            format!("{}/Documents/Presentations", home_dir),
            "PowerPointファイル".to_string(),
            0.8,
        );
    }

    // ダウンロードフォルダの古いファイル
    if current_location.contains("Downloads") {
        return (
            format!("{}/Documents/Archive", home_dir),
            "ダウンロードフォルダの古いファイル".to_string(),
            0.7,
        );
    }

    // デフォルト
    (
        format!("{}/Documents", home_dir),
        "一般的なドキュメント".to_string(),
        0.6,
    )
}

/// 整理提案を適用（ファイル移動）
#[tauri::command]
pub fn apply_organization_suggestion(
    app: AppHandle,
    file_path: String,
    destination: String,
) -> Result<(), String> {
    let source_path = Path::new(&file_path);
    if !source_path.exists() {
        return Err(format!("Source file not found: {}", file_path));
    }

    // 移動先ディレクトリを作成
    let dest_path = Path::new(&destination);
    if let Some(parent) = dest_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create destination directory: {}", e))?;
    }

    // ファイル移動
    fs::rename(&file_path, &destination).map_err(|e| format!("Failed to move file: {}", e))?;

    // 移動履歴を保存
    let conn = database::get_connection(&app)?;
    let now = chrono::Local::now().to_rfc3339();
    conn.execute(
        "INSERT INTO file_move_history (original_path, destination_path, moved_at, rule_id, user_confirmed)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![file_path, destination, now, Option::<String>::None, 1],
    )
    .map_err(|e| format!("Failed to save move history: {}", e))?;

    // ファイルメタデータを更新
    conn.execute(
        "UPDATE file_metadata SET file_path = ?1 WHERE file_path = ?2",
        params![destination, file_path],
    )
    .map_err(|e| format!("Failed to update file metadata: {}", e))?;

    Ok(())
}

/// ファイルを一括移動
#[tauri::command]
pub fn move_files_batch(app: AppHandle, moves: Vec<FileMove>) -> Result<BatchMoveResult, String> {
    let mut success_count = 0;
    let mut failed_count = 0;
    let mut errors = Vec::new();

    for file_move in moves {
        match apply_organization_suggestion(app.clone(), file_move.source.clone(), file_move.destination) {
            Ok(_) => success_count += 1,
            Err(e) => {
                failed_count += 1;
                errors.push(format!("{}: {}", file_move.source, e));
            }
        }
    }

    Ok(BatchMoveResult {
        success_count,
        failed_count,
        errors,
    })
}

/// ユーザー定義ルールを取得
#[tauri::command]
pub fn get_user_rules(app: AppHandle) -> Result<Vec<OrganizationRule>, String> {
    let conn = database::get_connection(&app)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, conditions, destination, priority, enabled, created_at, updated_at
             FROM organization_rules
             ORDER BY priority DESC, created_at DESC",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let rules_iter = stmt
        .query_map([], |row| {
            Ok(OrganizationRule {
                id: row.get(0)?,
                name: row.get(1)?,
                conditions: row.get(2)?,
                destination: row.get(3)?,
                priority: row.get(4)?,
                enabled: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| format!("Failed to query rules: {}", e))?;

    let mut rules = Vec::new();
    for rule in rules_iter {
        if let Ok(r) = rule {
            rules.push(r);
        }
    }

    Ok(rules)
}

/// ユーザー定義ルールを保存
#[tauri::command]
pub fn save_user_rule(app: AppHandle, rule: OrganizationRule) -> Result<(), String> {
    let conn = database::get_connection(&app)?;
    let now = chrono::Local::now().to_rfc3339();

    // 既存ルールがあれば更新、なければ挿入
    conn.execute(
        "INSERT OR REPLACE INTO organization_rules
         (id, name, conditions, destination, priority, enabled, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE((SELECT created_at FROM organization_rules WHERE id = ?1), ?7), ?8)",
        params![
            rule.id,
            rule.name,
            rule.conditions,
            rule.destination,
            rule.priority,
            if rule.enabled { 1 } else { 0 },
            now.clone(),
            now
        ],
    )
    .map_err(|e| format!("Failed to save rule: {}", e))?;

    Ok(())
}

/// ユーザー定義ルールを削除
#[tauri::command]
pub fn delete_user_rule(app: AppHandle, rule_id: String) -> Result<(), String> {
    let conn = database::get_connection(&app)?;

    conn.execute("DELETE FROM organization_rules WHERE id = ?1", params![rule_id])
        .map_err(|e| format!("Failed to delete rule: {}", e))?;

    Ok(())
}

/// 移動履歴を取得
#[tauri::command]
pub fn get_move_history(app: AppHandle, limit: Option<usize>) -> Result<Vec<MoveHistoryEntry>, String> {
    let conn = database::get_connection(&app)?;
    let limit_value = limit.unwrap_or(100);

    let mut stmt = conn
        .prepare(
            "SELECT id, original_path, destination_path, moved_at, rule_id, user_confirmed
             FROM file_move_history
             ORDER BY moved_at DESC
             LIMIT ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let history_iter = stmt
        .query_map(params![limit_value], |row| {
            Ok(MoveHistoryEntry {
                id: row.get(0)?,
                original_path: row.get(1)?,
                destination_path: row.get(2)?,
                moved_at: row.get(3)?,
                rule_id: row.get(4)?,
                user_confirmed: row.get::<_, i32>(5)? != 0,
            })
        })
        .map_err(|e| format!("Failed to query history: {}", e))?;

    let mut history = Vec::new();
    for entry in history_iter {
        if let Ok(h) = entry {
            history.push(h);
        }
    }

    Ok(history)
}

/// クラウドファイルステータスを検出
#[tauri::command]
pub fn detect_cloud_file_status(file_path: String) -> Result<CloudFileStatus, String> {
    let path_lower = file_path.to_lowercase();

    // クラウドプロバイダーを検出
    let (is_cloud, provider) = if path_lower.contains("onedrive") {
        (true, Some(CloudProvider::OneDrive))
    } else if path_lower.contains("google drive") || path_lower.contains("googledrive") {
        (true, Some(CloudProvider::GoogleDrive))
    } else if path_lower.contains("dropbox") {
        (true, Some(CloudProvider::Dropbox))
    } else {
        (false, None)
    };

    // 同期ステータス（簡易版 - Phase 5-Eで拡張予定）
    let sync_status = if is_cloud {
        SyncStatus::Synced // デフォルトは同期済み
    } else {
        SyncStatus::Unknown
    };

    Ok(CloudFileStatus {
        is_cloud_file: is_cloud,
        provider,
        sync_status,
        local_path: file_path.clone(),
        cloud_path: if is_cloud { Some(file_path) } else { None },
    })
}
