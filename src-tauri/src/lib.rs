mod database;
mod python_bridge;
mod file_scanner;
mod logger;
mod tag_manager;
mod favorite_manager;
mod settings_manager;
mod organization_manager;

// Tauri Commands

/// データベースを初期化（アプリ起動時に自動実行）
#[tauri::command]
fn initialize_db(app: tauri::AppHandle) -> Result<String, String> {
    database::initialize_database(&app)?;
    let db_path = database::get_db_path(&app)?;
    Ok(format!("Database initialized at: {}", db_path.display()))
}

/// データベース統計情報を取得
#[tauri::command]
fn get_db_stats(app: tauri::AppHandle) -> Result<database::DatabaseStats, String> {
    database::get_database_stats(&app)
}

/// Pythonブリッジのヘルスチェック
#[tauri::command]
fn python_health_check() -> Result<String, String> {
    let mut bridge = python_bridge::get_python_bridge()?;
    if let Some(ref mut b) = *bridge {
        b.health_check()
    } else {
        Err("Python bridge is not initialized".to_string())
    }
}

/// PDFファイルを分析
#[tauri::command]
fn analyze_pdf_file(file_path: String) -> Result<python_bridge::AnalyzeResult, String> {
    let mut bridge = python_bridge::get_python_bridge()?;
    if let Some(ref mut b) = *bridge {
        b.analyze_pdf(&file_path)
    } else {
        Err("Python bridge is not initialized".to_string())
    }
}

/// Excelファイルを分析
#[tauri::command]
fn analyze_excel_file(file_path: String) -> Result<python_bridge::AnalyzeResult, String> {
    let mut bridge = python_bridge::get_python_bridge()?;
    if let Some(ref mut b) = *bridge {
        b.analyze_excel(&file_path)
    } else {
        Err("Python bridge is not initialized".to_string())
    }
}

/// Wordファイルを分析
#[tauri::command]
fn analyze_word_file(file_path: String) -> Result<python_bridge::AnalyzeResult, String> {
    let mut bridge = python_bridge::get_python_bridge()?;
    if let Some(ref mut b) = *bridge {
        b.analyze_word(&file_path)
    } else {
        Err("Python bridge is not initialized".to_string())
    }
}

/// PowerPointファイルを分析
#[tauri::command]
fn analyze_ppt_file(file_path: String) -> Result<python_bridge::AnalyzeResult, String> {
    let mut bridge = python_bridge::get_python_bridge()?;
    if let Some(ref mut b) = *bridge {
        b.analyze_ppt(&file_path)
    } else {
        Err("Python bridge is not initialized".to_string())
    }
}

/// ディレクトリをスキャンしてファイルをインデックス化
#[tauri::command]
fn scan_directory(app: tauri::AppHandle, directory: String) -> Result<file_scanner::ScanResult, String> {
    file_scanner::scan_directory(&app, &directory)
}

/// ファイルを検索
#[tauri::command]
fn search_files(app: tauri::AppHandle, keyword: String) -> Result<Vec<file_scanner::SearchResult>, String> {
    file_scanner::search_files(&app, &keyword)
}

// ========== タグ管理API ==========

/// タグ一覧を取得
#[tauri::command]
fn get_tags(app: tauri::AppHandle) -> Result<Vec<tag_manager::Tag>, String> {
    tag_manager::get_tags(&app)
}

/// タグを作成
#[tauri::command]
fn create_tag(app: tauri::AppHandle, tag_name: String, color: Option<String>) -> Result<(), String> {
    tag_manager::create_tag(&app, tag_name, color)
}

/// タグを更新
#[tauri::command]
fn update_tag(app: tauri::AppHandle, tag_name: String, color: Option<String>) -> Result<(), String> {
    tag_manager::update_tag(&app, tag_name, color)
}

/// タグを削除
#[tauri::command]
fn delete_tag(app: tauri::AppHandle, tag_name: String) -> Result<(), String> {
    tag_manager::delete_tag(&app, tag_name)
}

/// ファイルにタグを追加
#[tauri::command]
fn add_tag_to_file(app: tauri::AppHandle, file_path: String, tag_name: String) -> Result<(), String> {
    tag_manager::add_tag_to_file(&app, file_path, tag_name)
}

/// ファイルからタグを削除
#[tauri::command]
fn remove_tag_from_file(app: tauri::AppHandle, file_path: String, tag_name: String) -> Result<(), String> {
    tag_manager::remove_tag_from_file(&app, file_path, tag_name)
}

/// ファイルのタグ一覧を取得
#[tauri::command]
fn get_file_tags(app: tauri::AppHandle, file_path: String) -> Result<Vec<String>, String> {
    tag_manager::get_file_tags(&app, file_path)
}

/// ファイルのタグを一括更新
#[tauri::command]
fn update_file_tags(app: tauri::AppHandle, file_path: String, tags: Vec<String>) -> Result<(), String> {
    tag_manager::update_file_tags(&app, file_path, tags)
}

// ========== お気に入り管理API ==========

/// お気に入りを切り替え
#[tauri::command]
fn toggle_favorite(app: tauri::AppHandle, file_path: String) -> Result<bool, String> {
    favorite_manager::toggle_favorite(&app, file_path)
}

/// お気に入りファイル一覧を取得
#[tauri::command]
fn get_favorites(app: tauri::AppHandle) -> Result<Vec<file_scanner::SearchResult>, String> {
    favorite_manager::get_favorites(&app)
}

/// 最近使用したファイル一覧を取得
#[tauri::command]
fn get_recent_files(app: tauri::AppHandle) -> Result<Vec<file_scanner::SearchResult>, String> {
    favorite_manager::get_recent_files(&app)
}

/// ファイルのアクセス記録を更新
#[tauri::command]
fn record_file_access(app: tauri::AppHandle, file_path: String) -> Result<(), String> {
    favorite_manager::record_file_access(&app, file_path)
}

// ========== 設定管理API ==========

/// 設定を取得
#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> Result<settings_manager::AppSettings, String> {
    settings_manager::get_settings(&app)
}

/// 設定を保存
#[tauri::command]
fn save_settings(app: tauri::AppHandle, settings: settings_manager::AppSettings) -> Result<(), String> {
    settings_manager::save_settings(&app, settings)
}

/// 監視フォルダを追加
#[tauri::command]
fn add_watched_folder(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    settings_manager::add_watched_folder(&app, folder_path)
}

/// 監視フォルダを削除
#[tauri::command]
fn remove_watched_folder(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    settings_manager::remove_watched_folder(&app, folder_path)
}

/// 除外フォルダを追加
#[tauri::command]
fn add_excluded_folder(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    settings_manager::add_excluded_folder(&app, folder_path)
}

/// 除外フォルダを削除
#[tauri::command]
fn remove_excluded_folder(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    settings_manager::remove_excluded_folder(&app, folder_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    eprintln!("[DEBUG] run() called - creating Tauri builder");

    let builder = tauri::Builder::default();
    eprintln!("[DEBUG] Builder created");

    let builder = builder.plugin(tauri_plugin_shell::init());
    eprintln!("[DEBUG] Shell plugin registered");

    // .plugin(tauri_plugin_global_shortcut::Builder::new().build())  // 一時的に無効化（デバッグ用）

    let builder = builder.setup(|app| {
        // 最小限の初期化のみ（デバッグ用）
        eprintln!("[DEBUG] Setup callback started");

        // ロガーのみ初期化
        let app_handle = app.handle().clone();
        eprintln!("[DEBUG] App handle cloned");

        if let Err(e) = logger::initialize_logger(&app_handle) {
            eprintln!("[DEBUG] Failed to initialize logger: {}", e);
        } else {
            eprintln!("[DEBUG] Logger initialized successfully");
        }

        eprintln!("[DEBUG] Setup callback completed");
        Ok(())
    });
    eprintln!("[DEBUG] Setup registered");

    let builder = builder.invoke_handler(tauri::generate_handler![
            initialize_db,
            get_db_stats,
            python_health_check,
            analyze_pdf_file,
            analyze_excel_file,
            analyze_word_file,
            analyze_ppt_file,
            scan_directory,
            search_files,
            get_tags,
            create_tag,
            update_tag,
            delete_tag,
            add_tag_to_file,
            remove_tag_from_file,
            get_file_tags,
            update_file_tags,
            toggle_favorite,
            get_favorites,
            get_recent_files,
            record_file_access,
            get_settings,
            save_settings,
            add_watched_folder,
            remove_watched_folder,
            add_excluded_folder,
            remove_excluded_folder,
            organization_manager::get_organization_suggestions,
            organization_manager::apply_organization_suggestion,
            organization_manager::move_files_batch,
            organization_manager::get_user_rules,
            organization_manager::save_user_rule,
            organization_manager::delete_user_rule,
            organization_manager::get_move_history,
            organization_manager::detect_cloud_file_status
        ]);
    eprintln!("[DEBUG] Invoke handler registered");

    eprintln!("[DEBUG] About to call builder.run()");
    let result = builder.run(tauri::generate_context!());
    eprintln!("[DEBUG] builder.run() returned");

    result.expect("error while running tauri application");
    eprintln!("[DEBUG] Application exited normally");
}
