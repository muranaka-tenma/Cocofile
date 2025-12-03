// CocoFile - Memo Management Module
// Provides memo update functionality for files

use crate::database;

/// Update memo for a file
pub fn update_memo(app: &tauri::AppHandle, file_path: String, memo: String) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    conn.execute(
        "UPDATE file_metadata SET memo = ?1 WHERE file_path = ?2",
        (memo, file_path),
    )
    .map_err(|e| format!("Failed to update memo: {}", e))?;

    Ok(())
}

/// Get memo for a file
pub fn get_memo(app: &tauri::AppHandle, file_path: String) -> Result<Option<String>, String> {
    let conn = database::get_connection(app)?;

    let memo: Option<String> = conn
        .query_row(
            "SELECT memo FROM file_metadata WHERE file_path = ?1",
            [&file_path],
            |row| row.get(0),
        )
        .map_err(|e| format!("File not found: {}", e))?;

    Ok(memo)
}
