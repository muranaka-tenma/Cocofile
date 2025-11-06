// CocoFile - Favorite Management Module
// Provides favorite toggle, favorites list, and recent files functionality

use crate::database;
use crate::file_scanner;

/// お気に入りを切り替え
pub fn toggle_favorite(app: &tauri::AppHandle, file_path: String) -> Result<bool, String> {
    let conn = database::get_connection(app)?;

    // 現在の状態を取得
    let current_state: i64 = conn
        .query_row(
            "SELECT is_favorite FROM file_metadata WHERE file_path = ?1",
            [&file_path],
            |row| row.get(0),
        )
        .map_err(|e| format!("File not found: {}", e))?;

    // 状態を反転
    let new_state = if current_state == 0 { 1 } else { 0 };

    conn.execute(
        "UPDATE file_metadata SET is_favorite = ?1 WHERE file_path = ?2",
        (new_state, &file_path),
    )
    .map_err(|e| format!("Failed to toggle favorite: {}", e))?;

    Ok(new_state == 1)
}

/// お気に入りファイル一覧を取得
pub fn get_favorites(
    app: &tauri::AppHandle,
) -> Result<Vec<file_scanner::SearchResult>, String> {
    let conn = database::get_connection(app)?;

    let mut stmt = conn
        .prepare(
            "SELECT file_path, file_name, file_type, file_size
             FROM file_metadata
             WHERE is_favorite = 1
             ORDER BY last_accessed_at DESC
             LIMIT 100",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let results: Vec<file_scanner::SearchResult> = stmt
        .query_map([], |row| {
            Ok(file_scanner::SearchResult {
                file_path: row.get(0)?,
                file_name: row.get(1)?,
                file_type: row.get(2)?,
                file_size: row.get(3)?,
                snippet: None,
                rank: None,
            })
        })
        .map_err(|e| format!("Failed to query favorites: {}", e))?
        .filter_map(Result::ok)
        .collect();

    Ok(results)
}

/// 最近使用したファイル一覧を取得
pub fn get_recent_files(
    app: &tauri::AppHandle,
) -> Result<Vec<file_scanner::SearchResult>, String> {
    let conn = database::get_connection(app)?;

    let mut stmt = conn
        .prepare(
            "SELECT file_path, file_name, file_type, file_size
             FROM file_metadata
             WHERE last_accessed_at IS NOT NULL
             ORDER BY last_accessed_at DESC
             LIMIT 100",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let results: Vec<file_scanner::SearchResult> = stmt
        .query_map([], |row| {
            Ok(file_scanner::SearchResult {
                file_path: row.get(0)?,
                file_name: row.get(1)?,
                file_type: row.get(2)?,
                file_size: row.get(3)?,
                snippet: None,
                rank: None,
            })
        })
        .map_err(|e| format!("Failed to query recent files: {}", e))?
        .filter_map(Result::ok)
        .collect();

    Ok(results)
}

/// ファイルのアクセス記録を更新（ファイルを開いた時に呼ばれる）
pub fn record_file_access(app: &tauri::AppHandle, file_path: String) -> Result<(), String> {
    let conn = database::get_connection(app)?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE file_metadata
         SET last_accessed_at = ?1, access_count = access_count + 1
         WHERE file_path = ?2",
        (now, file_path),
    )
    .map_err(|e| format!("Failed to record file access: {}", e))?;

    Ok(())
}
