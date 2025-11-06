use crate::database;
use crate::python_bridge;
use rusqlite::Connection;
use std::fs;
use std::path::Path;

/// ファイルスキャン結果
#[derive(Debug, serde::Serialize)]
pub struct ScanResult {
    pub total_files: usize,
    pub processed_files: usize,
    pub errors: Vec<String>,
}

/// ディレクトリをスキャンしてファイルをデータベースに登録
pub fn scan_directory(
    app: &tauri::AppHandle,
    directory: &str,
) -> Result<ScanResult, String> {
    crate::logger::info("FileScanner", &format!("Starting scan: {}", directory));

    let conn = database::get_connection(app)?;
    let path = Path::new(directory);

    if !path.exists() {
        let error_msg = format!("Directory does not exist: {}", directory);
        crate::logger::error("FileScanner", &error_msg);
        return Err(error_msg);
    }

    let mut total_files = 0;
    let mut processed_files = 0;
    let mut errors = Vec::new();

    // ディレクトリを再帰的に走査
    if let Err(e) = scan_directory_recursive(&conn, path, &mut total_files, &mut processed_files, &mut errors) {
        errors.push(format!("Scan error: {}", e));
    }

    crate::logger::info(
        "FileScanner",
        &format!(
            "Scan completed: {} files processed out of {}",
            processed_files, total_files
        ),
    );

    Ok(ScanResult {
        total_files,
        processed_files,
        errors,
    })
}

/// ディレクトリを再帰的にスキャン
fn scan_directory_recursive(
    conn: &Connection,
    path: &Path,
    total_files: &mut usize,
    processed_files: &mut usize,
    errors: &mut Vec<String>,
) -> Result<(), String> {
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                // 再帰的にスキャン
                let _ = scan_directory_recursive(conn, &path, total_files, processed_files, errors);
            } else if path.is_file() {
                *total_files += 1;

                // 対応ファイル形式のみ処理
                if let Some(ext) = path.extension() {
                    let ext_str = ext.to_string_lossy().to_lowercase();
                    if matches!(ext_str.as_str(), "pdf" | "xlsx" | "xls" | "docx" | "pptx") {
                        if let Err(e) = process_file(conn, &path) {
                            errors.push(format!("Failed to process {}: {}", path.display(), e));
                        } else {
                            *processed_files += 1;
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

/// ファイルを処理してデータベースに登録
fn process_file(conn: &Connection, path: &Path) -> Result<(), String> {
    let file_path = path
        .to_str()
        .ok_or("Invalid file path")?
        .to_string();

    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid file name")?
        .to_string();

    let file_type = path
        .extension()
        .and_then(|e| e.to_str())
        .ok_or("Invalid file type")?
        .to_lowercase();

    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;

    let file_size = metadata.len() as i64;

    // ファイルサイズチェック（100MB超は警告）
    if file_size > 100_000_000 {
        return Err(format!(
            "File too large: {} bytes (max 100MB recommended)",
            file_size
        ));
    }

    // メタデータを登録
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT OR REPLACE INTO file_metadata
         (file_path, file_name, file_type, file_size, indexed_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        (
            &file_path,
            &file_name,
            &file_type,
            file_size,
            &now,
        ),
    )
    .map_err(|e| format!("Failed to insert file metadata: {}", e))?;

    // Pythonバックエンドでファイル分析
    let mut bridge_lock = python_bridge::get_python_bridge()
        .map_err(|e| format!("Failed to get Python bridge: {}", e))?;

    if let Some(ref mut bridge) = *bridge_lock {
        // ファイルタイプに応じて適切な分析関数を呼び出す
        let analyze_result = match file_type.as_str() {
            "pdf" => bridge.analyze_pdf(&file_path),
            "xlsx" | "xls" => bridge.analyze_excel(&file_path),
            "docx" => bridge.analyze_word(&file_path),
            "pptx" => bridge.analyze_ppt(&file_path),
            _ => Err(format!("Unsupported file type: {}", file_type)),
        };

        match analyze_result {
            Ok(result) => {
                // N-gram処理してFTS5に登録
                let ngram_text = ngram_tokenize(&result.text);

                conn.execute(
                    "INSERT OR REPLACE INTO files_fts (file_path, content) VALUES (?1, ?2)",
                    (&file_path, &ngram_text),
                )
                .map_err(|e| format!("Failed to insert into FTS5: {}", e))?;

                println!(
                    "Successfully indexed: {} ({} bytes of text)",
                    file_name,
                    result.text.len()
                );
            }
            Err(e) => {
                // 分析失敗時もメタデータは登録済み（ファイル名検索可能）
                eprintln!(
                    "[WARN] Failed to analyze file '{}' ({}): {}",
                    file_name, file_type, e
                );
                // エラー詳細をログに記録（将来的にファイルに保存）
                log_analysis_error(&file_path, &file_type, &e);
            }
        }
    }

    Ok(())
}

/// エラーログを記録
fn log_analysis_error(file_path: &str, file_type: &str, error: &str) {
    let message = format!(
        "Analysis failed - File='{}', Type='{}', Error='{}'",
        file_path, file_type, error
    );
    crate::logger::error("FileAnalyzer", &message);
}

/// テキストをN-gram（2-gram）に変換
/// 例: "営業資料" → "営業 業資 資料"
fn ngram_tokenize(text: &str) -> String {
    let n = 2;
    let mut tokens = Vec::new();

    // 改行・余分なスペースを削除
    let cleaned = text.replace("\n", " ").replace("\r", "");
    let cleaned = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");

    // 2-gram生成
    let chars: Vec<char> = cleaned.chars().collect();
    for i in 0..chars.len().saturating_sub(n - 1) {
        let gram: String = chars[i..i + n].iter().collect();
        if !gram.trim().is_empty() {
            tokens.push(gram);
        }
    }

    tokens.join(" ")
}

/// 検索クエリをN-gram化してFTS5で検索
pub fn search_files(
    app: &tauri::AppHandle,
    keyword: &str,
) -> Result<Vec<SearchResult>, String> {
    let conn = database::get_connection(app)?;

    if keyword.trim().is_empty() {
        return Ok(Vec::new());
    }

    // N-gram化した検索クエリを生成
    let search_query = prepare_fts5_query(keyword);

    // FTS5で全文検索（スニペット付き）
    let mut stmt = conn
        .prepare(
            "SELECT
                m.file_path,
                m.file_name,
                m.file_type,
                m.file_size,
                snippet(files_fts, 1, '[', ']', '...', 64) as snippet,
                bm25(files_fts) as rank
             FROM files_fts
             JOIN file_metadata m ON files_fts.file_path = m.file_path
             WHERE files_fts MATCH ?1
             ORDER BY rank
             LIMIT 100"
        )
        .map_err(|e| format!("Failed to prepare FTS5 query: {}", e))?;

    let results: Vec<SearchResult> = stmt
        .query_map([&search_query], |row| {
            let snippet: String = row.get(4)?;
            let rank: f64 = row.get(5)?;

            Ok(SearchResult {
                file_path: row.get(0)?,
                file_name: row.get(1)?,
                file_type: row.get(2)?,
                file_size: row.get(3)?,
                snippet: Some(snippet),
                rank: Some(rank),
            })
        })
        .map_err(|e| format!("Failed to execute FTS5 query: {}", e))?
        .filter_map(Result::ok)
        .collect();

    // FTS5で結果が0件の場合、ファイル名で LIKE 検索（フォールバック）
    if results.is_empty() {
        let mut stmt_fallback = conn
            .prepare(
                "SELECT file_path, file_name, file_type, file_size
                 FROM file_metadata
                 WHERE file_name LIKE ?1
                 LIMIT 100"
            )
            .map_err(|e| format!("Failed to prepare fallback query: {}", e))?;

        let keyword_pattern = format!("%{}%", keyword);

        return Ok(stmt_fallback
            .query_map([&keyword_pattern], |row| {
                Ok(SearchResult {
                    file_path: row.get(0)?,
                    file_name: row.get(1)?,
                    file_type: row.get(2)?,
                    file_size: row.get(3)?,
                    snippet: None,
                    rank: None,
                })
            })
            .map_err(|e| format!("Failed to execute fallback query: {}", e))?
            .filter_map(Result::ok)
            .collect());
    }

    Ok(results)
}

/// FTS5検索クエリを生成（N-gram + AND条件）
/// 例: "営業資料" → "営業 AND 業資 AND 資料"
fn prepare_fts5_query(keyword: &str) -> String {
    let tokens = ngram_tokenize(keyword);
    let token_vec: Vec<&str> = tokens.split_whitespace().collect();

    if token_vec.is_empty() {
        return String::new();
    }

    // 各トークンをダブルクォートで囲んでAND条件で連結
    token_vec
        .iter()
        .map(|t| format!("\"{}\"", t))
        .collect::<Vec<_>>()
        .join(" AND ")
}

#[derive(Debug, serde::Serialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub file_type: String,
    pub file_size: i64,
    pub snippet: Option<String>,
    pub rank: Option<f64>,
}
