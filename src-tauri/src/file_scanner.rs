use crate::database;
use crate::python_bridge;
use crate::settings_manager;
use rusqlite::Connection;
use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::Emitter;

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

/// ファイルのメタデータのみを登録（内容分析なし）
fn register_file_metadata(conn: &Connection, path: &Path) -> Result<(), String> {
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
        .unwrap_or("")
        .to_lowercase();

    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;

    let file_size = metadata.len() as i64;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT OR IGNORE INTO file_metadata
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
    crate::logger::info("FileScanner", &format!("Getting Python bridge for: {}", file_name));

    let mut bridge_lock = python_bridge::get_python_bridge()
        .map_err(|e| format!("Failed to get Python bridge: {}", e))?;

    crate::logger::info("FileScanner", &format!("Analyzing file: {} (type: {})", file_name, file_type));

    if let Some(ref mut bridge) = *bridge_lock {
        // ファイルタイプに応じて適切な分析関数を呼び出す
        let analyze_result = match file_type.as_str() {
            "pdf" => bridge.analyze_pdf(&file_path),
            "xlsx" | "xls" => bridge.analyze_excel(&file_path),
            "docx" => bridge.analyze_word(&file_path),
            "pptx" => bridge.analyze_ppt(&file_path),
            "txt" | "md" => bridge.analyze_text(&file_path),
            _ => Err(format!("Unsupported file type: {}", file_type)),
        };

        match analyze_result {
            Ok(result) => {
                crate::logger::info("FileScanner", &format!("Analysis success: {} ({} chars)", file_name, result.text.len()));

                // N-gram処理してFTS5に登録
                let ngram_text = ngram_tokenize(&result.text);

                conn.execute(
                    "INSERT OR REPLACE INTO files_fts (file_path, content) VALUES (?1, ?2)",
                    (&file_path, &ngram_text),
                )
                .map_err(|e| format!("Failed to insert into FTS5: {}", e))?;

                crate::logger::info("FileScanner", &format!("Indexed: {} ({} bytes)", file_name, result.text.len()));
            }
            Err(e) => {
                // 分析失敗時もメタデータは登録済み（ファイル名検索可能）
                crate::logger::error("FileScanner", &format!("Analysis failed: {} - {}", file_name, e));
                // エラー詳細をログに記録
                log_analysis_error(&file_path, &file_type, &e);
            }
        }
    } else {
        crate::logger::error("FileScanner", "Python bridge is None");
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
    // 文字数制限（1MB相当）
    const MAX_CHARS: usize = 1_000_000;

    // 改行・余分なスペースを削除
    let cleaned = text.replace("\n", " ").replace("\r", "");
    let cleaned = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");

    // 2-gram生成（文字数制限付き）
    let chars: Vec<char> = cleaned.chars().take(MAX_CHARS).collect();
    let char_count = chars.len();

    if char_count < n {
        return String::new();
    }

    // 事前容量確保（各gramは2文字+スペース1文字で約3バイト）
    let estimated_capacity = (char_count.saturating_sub(n - 1)) * 3;
    let mut tokens = Vec::with_capacity(char_count.saturating_sub(n - 1));

    for i in 0..char_count.saturating_sub(n - 1) {
        let gram: String = chars[i..i + n].iter().collect();
        if !gram.trim().is_empty() {
            tokens.push(gram);
        }
    }

    let mut result = String::with_capacity(estimated_capacity);
    result.push_str(&tokens.join(" "));
    result
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

/// スキャン進捗イベント
#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanProgress {
    pub current_drive: String,
    pub current_folder: String,
    pub total_files: usize,
    pub processed_files: usize,
    pub status: String, // "scanning" | "completed" | "error"
}

/// 全ドライブを検出（Windows/Linux対応）
pub fn get_all_drives() -> Vec<String> {
    let mut drives = Vec::new();

    #[cfg(target_os = "windows")]
    {
        // Windows: A:からZ:までチェック
        for letter in b'A'..=b'Z' {
            let drive = format!("{}:\\", letter as char);
            let path = Path::new(&drive);
            if path.exists() && path.is_dir() {
                drives.push(drive);
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Linux/macOS: ホームディレクトリをスキャン
        if let Some(home) = dirs::home_dir() {
            drives.push(home.to_string_lossy().to_string());
        }
    }

    crate::logger::info("FileScanner", &format!("Detected drives: {:?}", drives));
    drives
}

/// 全ドライブをバックグラウンドでスキャン
pub fn scan_all_drives(app: tauri::AppHandle) -> Result<(), String> {
    let app_clone = app.clone();

    // バックグラウンドスレッドでスキャン実行
    std::thread::spawn(move || {
        crate::logger::info("FileScanner", "Starting full system scan...");

        // 設定から除外フォルダを取得
        let settings = match settings_manager::get_settings(&app_clone) {
            Ok(s) => s,
            Err(e) => {
                crate::logger::error("FileScanner", &format!("Failed to get settings: {}", e));
                return;
            }
        };

        let excluded_folders: Vec<String> = settings.excluded_folders
            .iter()
            .map(|f| f.to_lowercase())
            .collect();

        let excluded_extensions: Vec<String> = settings.excluded_extensions
            .iter()
            .map(|e| e.to_lowercase())
            .collect();

        // 全ドライブを取得
        let drives = get_all_drives();

        let total_files = Arc::new(Mutex::new(0usize));
        let processed_files = Arc::new(Mutex::new(0usize));

        for drive in drives {
            // 進捗通知
            let progress = ScanProgress {
                current_drive: drive.clone(),
                current_folder: drive.clone(),
                total_files: *total_files.lock().unwrap(),
                processed_files: *processed_files.lock().unwrap(),
                status: "scanning".to_string(),
            };
            let _ = app_clone.emit("scan-progress", progress);

            // ドライブをスキャン
            if let Err(e) = scan_drive_with_exclusions(
                &app_clone,
                &drive,
                &excluded_folders,
                &excluded_extensions,
                total_files.clone(),
                processed_files.clone(),
            ) {
                crate::logger::error("FileScanner", &format!("Error scanning {}: {}", drive, e));
            }
        }

        // 完了通知
        let final_progress = ScanProgress {
            current_drive: "".to_string(),
            current_folder: "".to_string(),
            total_files: *total_files.lock().unwrap(),
            processed_files: *processed_files.lock().unwrap(),
            status: "completed".to_string(),
        };
        let _ = app_clone.emit("scan-progress", final_progress);

        crate::logger::info(
            "FileScanner",
            &format!(
                "Full system scan completed: {} files processed out of {}",
                *processed_files.lock().unwrap(),
                *total_files.lock().unwrap()
            ),
        );
    });

    Ok(())
}

/// ドライブを除外設定付きでスキャン
fn scan_drive_with_exclusions(
    app: &tauri::AppHandle,
    drive: &str,
    excluded_folders: &[String],
    excluded_extensions: &[String],
    total_files: Arc<Mutex<usize>>,
    processed_files: Arc<Mutex<usize>>,
) -> Result<(), String> {
    let conn = database::get_connection(app)?;
    let path = Path::new(drive);

    scan_directory_with_exclusions(
        app,
        &conn,
        path,
        excluded_folders,
        excluded_extensions,
        total_files,
        processed_files,
    )
}

/// ディレクトリを除外設定付きで再帰スキャン
fn scan_directory_with_exclusions(
    app: &tauri::AppHandle,
    conn: &Connection,
    path: &Path,
    excluded_folders: &[String],
    excluded_extensions: &[String],
    total_files: Arc<Mutex<usize>>,
    processed_files: Arc<Mutex<usize>>,
) -> Result<(), String> {
    // 除外フォルダチェック
    let path_str = path.to_string_lossy().to_lowercase();
    for excluded in excluded_folders {
        if path_str.starts_with(excluded) || path_str.contains(excluded) {
            return Ok(());
        }
    }

    // デバッグ: スキャン中のディレクトリをログ（最初の20回、その後は100ごと）
    let total = *total_files.lock().unwrap();
    if total <= 20 || total % 100 == 0 {
        crate::logger::info("FileScanner", &format!("Scanning: {} (total: {})", path.display(), total));
    }

    // 特殊フォルダを除外
    let folder_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_lowercase();

    let skip_folders = [
        "node_modules", ".git", ".svn", "__pycache__",
        "venv", ".venv", "target", "build", "dist",
        "$recycle.bin", "system volume information",
        "appdata", "programdata"
    ];

    if skip_folders.contains(&folder_name.as_str()) {
        return Ok(());
    }

    let entries = match fs::read_dir(path) {
        Ok(e) => e,
        Err(e) => {
            crate::logger::error("FileScanner", &format!("Cannot read directory {}: {}", path.display(), e));
            return Ok(()); // アクセス拒否等は無視
        }
    };

    let mut file_count_in_dir = 0;
    let mut dir_count_in_dir = 0;

    for entry in entries.flatten() {
        let entry_path = entry.path();

        if entry_path.is_dir() {
            dir_count_in_dir += 1;
            // 再帰的にスキャン
            let _ = scan_directory_with_exclusions(
                app,
                conn,
                &entry_path,
                excluded_folders,
                excluded_extensions,
                total_files.clone(),
                processed_files.clone(),
            );
        } else if entry_path.is_file() {
            file_count_in_dir += 1;

            // 拡張子チェック
            let ext_str = entry_path.extension()
                .and_then(|e| e.to_str())
                .map(|s| s.to_lowercase())
                .unwrap_or_default();

            let ext_with_dot = format!(".{}", ext_str);

            // 除外拡張子チェック
            if excluded_extensions.contains(&ext_with_dot) {
                continue;
            }

            *total_files.lock().unwrap() += 1;

            // デバッグ: 最初の100ファイルをログ
            let current_total = *total_files.lock().unwrap();
            if current_total <= 100 {
                crate::logger::info("FileScanner", &format!("Found file #{}: {}", current_total, entry_path.display()));
            }

            // 全てのファイルをメタデータに登録（ファイル名検索可能）
            let _ = register_file_metadata(conn, &entry_path);

            // 対応ファイル形式のみ内容分析
            if matches!(ext_str.as_str(), "pdf" | "xlsx" | "xls" | "docx" | "pptx" | "txt" | "md") {
                // デバッグ: 処理するファイルをログ
                let total_now = *total_files.lock().unwrap();
                if total_now <= 10 || total_now % 100 == 0 {
                    crate::logger::info("FileScanner", &format!("Processing file: {} (type: {})", entry_path.display(), ext_str));
                }

                match process_file(conn, &entry_path) {
                    Ok(_) => {
                        *processed_files.lock().unwrap() += 1;
                    }
                    Err(e) => {
                        crate::logger::error("FileScanner", &format!("Failed to process {}: {}", entry_path.display(), e));
                    }
                }
            }

            // 進捗通知（最初は頻繁に、その後は50ファイルごと）
            let total = *total_files.lock().unwrap();
            let processed = *processed_files.lock().unwrap();
            // 最初の10ファイルは毎回、その後は50ごと
            if total <= 10 || total % 50 == 0 {
                let progress = ScanProgress {
                    current_drive: path.to_string_lossy().chars().take(3).collect(),
                    current_folder: path.to_string_lossy().to_string(),
                    total_files: total,
                    processed_files: processed,
                    status: "scanning".to_string(),
                };
                let _ = app.emit("scan-progress", progress);
            }
        }
    }

    Ok(())
}

/// 初回起動かどうかを確認
pub fn is_first_run(app: &tauri::AppHandle) -> Result<bool, String> {
    let conn = database::get_connection(app)?;

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM file_metadata", [], |row| row.get(0))
        .map_err(|e| format!("Failed to check file count: {}", e))?;

    Ok(count == 0)
}
