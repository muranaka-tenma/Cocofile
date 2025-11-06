// CocoFile - Tag Management Module
// Provides CRUD operations for tags and file-tag associations

use crate::database;
use rusqlite::{Connection, Result};

/// タグ情報
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Tag {
    pub tag_name: String,
    pub color: Option<String>,
    pub usage_count: i64,
    pub created_at: String,
}

/// ファイルのタグ一覧
#[derive(Debug, serde::Serialize)]
pub struct FileTags {
    pub file_path: String,
    pub tags: Vec<String>,
}

/// タグ一覧を取得
pub fn get_tags(app: &tauri::AppHandle) -> Result<Vec<Tag>, String> {
    let conn = database::get_connection(app)?;

    let mut stmt = conn
        .prepare(
            "SELECT tag_name, color, usage_count, created_at
             FROM tags
             ORDER BY usage_count DESC, tag_name ASC",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let tags: Vec<Tag> = stmt
        .query_map([], |row| {
            Ok(Tag {
                tag_name: row.get(0)?,
                color: row.get(1)?,
                usage_count: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| format!("Failed to query tags: {}", e))?
        .filter_map(Result::ok)
        .collect();

    Ok(tags)
}

/// タグを作成
pub fn create_tag(
    app: &tauri::AppHandle,
    tag_name: String,
    color: Option<String>,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO tags (tag_name, color, usage_count, created_at)
         VALUES (?1, ?2, 0, ?3)",
        (tag_name, color, now),
    )
    .map_err(|e| format!("Failed to create tag: {}", e))?;

    Ok(())
}

/// タグを更新（色変更）
pub fn update_tag(
    app: &tauri::AppHandle,
    tag_name: String,
    color: Option<String>,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    conn.execute(
        "UPDATE tags SET color = ?1 WHERE tag_name = ?2",
        (color, tag_name),
    )
    .map_err(|e| format!("Failed to update tag: {}", e))?;

    Ok(())
}

/// タグを削除
pub fn delete_tag(app: &tauri::AppHandle, tag_name: String) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    // file_tagsテーブルからも削除（ON DELETE CASCADEで自動削除されるが明示的に実行）
    conn.execute("DELETE FROM tags WHERE tag_name = ?1", [tag_name])
        .map_err(|e| format!("Failed to delete tag: {}", e))?;

    Ok(())
}

/// ファイルにタグを追加
pub fn add_tag_to_file(
    app: &tauri::AppHandle,
    file_path: String,
    tag_name: String,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    // タグが存在しない場合は自動作成
    ensure_tag_exists(&conn, &tag_name)?;

    // ファイル-タグ関連を追加
    conn.execute(
        "INSERT OR IGNORE INTO file_tags (file_path, tag_name) VALUES (?1, ?2)",
        (file_path, &tag_name),
    )
    .map_err(|e| format!("Failed to add tag to file: {}", e))?;

    // タグの使用カウントを更新
    conn.execute(
        "UPDATE tags SET usage_count = (
            SELECT COUNT(*) FROM file_tags WHERE tag_name = ?1
        ) WHERE tag_name = ?1",
        [&tag_name],
    )
    .map_err(|e| format!("Failed to update tag usage count: {}", e))?;

    Ok(())
}

/// ファイルからタグを削除
pub fn remove_tag_from_file(
    app: &tauri::AppHandle,
    file_path: String,
    tag_name: String,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    conn.execute(
        "DELETE FROM file_tags WHERE file_path = ?1 AND tag_name = ?2",
        (file_path, &tag_name),
    )
    .map_err(|e| format!("Failed to remove tag from file: {}", e))?;

    // タグの使用カウントを更新
    conn.execute(
        "UPDATE tags SET usage_count = (
            SELECT COUNT(*) FROM file_tags WHERE tag_name = ?1
        ) WHERE tag_name = ?1",
        [&tag_name],
    )
    .map_err(|e| format!("Failed to update tag usage count: {}", e))?;

    Ok(())
}

/// ファイルのタグ一覧を取得
pub fn get_file_tags(app: &tauri::AppHandle, file_path: String) -> Result<Vec<String>, String> {
    let conn = database::get_connection(app)?;

    let mut stmt = conn
        .prepare("SELECT tag_name FROM file_tags WHERE file_path = ?1")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let tags: Vec<String> = stmt
        .query_map([file_path], |row| row.get(0))
        .map_err(|e| format!("Failed to query file tags: {}", e))?
        .filter_map(Result::ok)
        .collect();

    Ok(tags)
}

/// ファイルのタグを一括更新
pub fn update_file_tags(
    app: &tauri::AppHandle,
    file_path: String,
    tags: Vec<String>,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;

    // トランザクション開始
    conn.execute("BEGIN TRANSACTION", [])
        .map_err(|e| format!("Failed to begin transaction: {}", e))?;

    // 既存のタグを削除
    if let Err(e) = conn.execute("DELETE FROM file_tags WHERE file_path = ?1", [&file_path]) {
        let _ = conn.execute("ROLLBACK", []);
        return Err(format!("Failed to delete existing tags: {}", e));
    }

    // 新しいタグを追加
    for tag_name in tags {
        // タグが存在しない場合は自動作成
        if let Err(e) = ensure_tag_exists(&conn, &tag_name) {
            let _ = conn.execute("ROLLBACK", []);
            return Err(e);
        }

        if let Err(e) = conn.execute(
            "INSERT INTO file_tags (file_path, tag_name) VALUES (?1, ?2)",
            (&file_path, &tag_name),
        ) {
            let _ = conn.execute("ROLLBACK", []);
            return Err(format!("Failed to insert tag: {}", e));
        }

        // タグの使用カウントを更新
        if let Err(e) = conn.execute(
            "UPDATE tags SET usage_count = (
                SELECT COUNT(*) FROM file_tags WHERE tag_name = ?1
            ) WHERE tag_name = ?1",
            [&tag_name],
        ) {
            let _ = conn.execute("ROLLBACK", []);
            return Err(format!("Failed to update usage count: {}", e));
        }
    }

    // トランザクションコミット
    conn.execute("COMMIT", [])
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

    Ok(())
}

/// タグが存在するか確認し、存在しない場合は作成
fn ensure_tag_exists(conn: &Connection, tag_name: &str) -> Result<(), String> {
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM tags WHERE tag_name = ?1",
            [tag_name],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if !exists {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO tags (tag_name, color, usage_count, created_at)
             VALUES (?1, NULL, 0, ?2)",
            (tag_name, now),
        )
        .map_err(|e| format!("Failed to create tag: {}", e))?;
    }

    Ok(())
}
