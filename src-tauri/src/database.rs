use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tauri::Manager;

/// データベースファイルのパスを取得
///
/// プラットフォーム別パス:
/// - Windows: C:\Users\{USER}\AppData\Roaming\CocoFile\cocofile.db
/// - macOS: ~/Library/Application Support/CocoFile/cocofile.db
/// - Linux: ~/.config/CocoFile/cocofile.db
pub fn get_db_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // ディレクトリが存在しない場合は作成
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;

    Ok(app_data_dir.join("cocofile.db"))
}

/// データベース接続を取得
pub fn get_connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let db_path = get_db_path(app)?;
    Connection::open(&db_path).map_err(|e| format!("Failed to open database: {}", e))
}

/// データベースを初期化（テーブル作成）
pub fn initialize_database(app: &tauri::AppHandle) -> Result<(), String> {
    let conn = get_connection(app)?;

    // 1. メインテーブル: ファイルメタデータ
    conn.execute(
        "CREATE TABLE IF NOT EXISTS file_metadata (
            file_path TEXT PRIMARY KEY,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            hash_value TEXT,
            created_at TEXT,
            updated_at TEXT,
            last_accessed_at TEXT,
            access_count INTEGER DEFAULT 0,
            is_favorite INTEGER DEFAULT 0,
            memo TEXT,
            indexed_at TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| format!("Failed to create file_metadata table: {}", e))?;

    // 2. FTS5仮想テーブル: 全文検索（N-gram処理済みテキスト）
    conn.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
            file_path UNINDEXED,
            content,
            tokenize='unicode61'
        )",
        [],
    )
    .map_err(|e| format!("Failed to create files_fts table: {}", e))?;

    // 3. タグテーブル
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tags (
            tag_name TEXT PRIMARY KEY,
            color TEXT,
            usage_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| format!("Failed to create tags table: {}", e))?;

    // 4. ファイル-タグ関連テーブル（多対多）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS file_tags (
            file_path TEXT,
            tag_name TEXT,
            PRIMARY KEY (file_path, tag_name),
            FOREIGN KEY (file_path) REFERENCES file_metadata(file_path) ON DELETE CASCADE,
            FOREIGN KEY (tag_name) REFERENCES tags(tag_name) ON DELETE CASCADE
        )",
        [],
    )
    .map_err(|e| format!("Failed to create file_tags table: {}", e))?;

    // 5. 重複グループテーブル
    conn.execute(
        "CREATE TABLE IF NOT EXISTS duplicate_groups (
            group_id TEXT PRIMARY KEY,
            hash_value TEXT NOT NULL,
            file_count INTEGER NOT NULL
        )",
        [],
    )
    .map_err(|e| format!("Failed to create duplicate_groups table: {}", e))?;

    // 6. スキャン履歴テーブル
    conn.execute(
        "CREATE TABLE IF NOT EXISTS scan_history (
            scan_id TEXT PRIMARY KEY,
            target_folder TEXT,
            processed_files INTEGER,
            start_time TEXT NOT NULL,
            end_time TEXT
        )",
        [],
    )
    .map_err(|e| format!("Failed to create scan_history table: {}", e))?;

    // 7. ファイル移動履歴テーブル（Phase 7: ファイル整理機能）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS file_move_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_path TEXT NOT NULL,
            destination_path TEXT NOT NULL,
            moved_at TEXT NOT NULL,
            rule_id TEXT,
            user_confirmed INTEGER DEFAULT 1
        )",
        [],
    )
    .map_err(|e| format!("Failed to create file_move_history table: {}", e))?;

    // 8. 整理ルールテーブル（Phase 7: ファイル整理機能）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS organization_rules (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            conditions TEXT NOT NULL,
            destination TEXT NOT NULL,
            priority INTEGER DEFAULT 0,
            enabled INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )
    .map_err(|e| format!("Failed to create organization_rules table: {}", e))?;

    // 9. 整理提案テーブル（Phase 7: ファイル整理機能）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS organization_suggestions (
            file_path TEXT PRIMARY KEY,
            suggested_destination TEXT NOT NULL,
            reason TEXT,
            confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
            rule_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (file_path) REFERENCES file_metadata(file_path) ON DELETE CASCADE,
            FOREIGN KEY (rule_id) REFERENCES organization_rules(id) ON DELETE SET NULL
        )",
        [],
    )
    .map_err(|e| format!("Failed to create organization_suggestions table: {}", e))?;

    // インデックス作成（パフォーマンス最適化）
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_file_type ON file_metadata(file_type)",
        [],
    )
    .map_err(|e| format!("Failed to create index: {}", e))?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_is_favorite ON file_metadata(is_favorite)",
        [],
    )
    .map_err(|e| format!("Failed to create index: {}", e))?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_hash_value ON file_metadata(hash_value)",
        [],
    )
    .map_err(|e| format!("Failed to create index: {}", e))?;

    // Phase 7: ファイル整理機能用インデックス
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_move_history_moved_at ON file_move_history(moved_at)",
        [],
    )
    .map_err(|e| format!("Failed to create index: {}", e))?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_organization_rules_enabled ON organization_rules(enabled, priority)",
        [],
    )
    .map_err(|e| format!("Failed to create index: {}", e))?;

    Ok(())
}

/// データベースの統計情報を取得
pub fn get_database_stats(app: &tauri::AppHandle) -> Result<DatabaseStats, String> {
    let conn = get_connection(app)?;

    let total_files: i64 = conn
        .query_row("SELECT COUNT(*) FROM file_metadata", [], |row| row.get(0))
        .unwrap_or(0);

    let total_tags: i64 = conn
        .query_row("SELECT COUNT(*) FROM tags", [], |row| row.get(0))
        .unwrap_or(0);

    let db_path = get_db_path(app)?;
    let db_size = std::fs::metadata(&db_path)
        .map(|m| m.len())
        .unwrap_or(0);

    Ok(DatabaseStats {
        total_files,
        total_tags,
        db_size_bytes: db_size,
    })
}

#[derive(Debug, serde::Serialize)]
pub struct DatabaseStats {
    pub total_files: i64,
    pub total_tags: i64,
    pub db_size_bytes: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_initialization() {
        // テストはTauriアプリコンテキストが必要なため、
        // 統合テストで実装予定
    }
}
