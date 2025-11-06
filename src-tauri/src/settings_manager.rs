// CocoFile - Settings Management Module
// Provides application settings persistence via JSON file

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// アプリケーション設定
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    // 監視設定
    pub watched_folders: Vec<String>,
    pub excluded_folders: Vec<String>,
    pub excluded_extensions: Vec<String>,
    pub scan_timing: String, // "realtime" | "idle" | "manual"

    // UI設定
    pub hotkey: String,
    pub window_position: WindowPosition,
    pub auto_hide: bool,
    pub theme: String, // "light" | "dark"

    // タグ設定
    pub default_tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            watched_folders: vec![],
            excluded_folders: vec!["C:\\Windows".to_string(), "C:\\Program Files".to_string()],
            excluded_extensions: vec![".tmp".to_string(), ".log".to_string(), ".cache".to_string()],
            scan_timing: "realtime".to_string(),
            hotkey: "Ctrl+Shift+F".to_string(),
            window_position: WindowPosition { x: 0, y: 0 },
            auto_hide: true,
            theme: "light".to_string(),
            default_tags: vec![],
        }
    }
}

/// 設定ファイルのパスを取得
fn get_settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // ディレクトリが存在しない場合は作成
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;

    Ok(app_data_dir.join("settings.json"))
}

/// 設定を取得
pub fn get_settings(app: &tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(app)?;

    if !settings_path.exists() {
        // 設定ファイルが存在しない場合はデフォルト設定を返す
        return Ok(AppSettings::default());
    }

    let settings_json = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    let settings: AppSettings = serde_json::from_str(&settings_json)
        .map_err(|e| format!("Failed to parse settings JSON: {}", e))?;

    Ok(settings)
}

/// 設定を保存
pub fn save_settings(app: &tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path(app)?;

    let settings_json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, settings_json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;

    Ok(())
}

/// 監視フォルダを追加
pub fn add_watched_folder(app: &tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut settings = get_settings(app)?;

    if !settings.watched_folders.contains(&folder_path) {
        settings.watched_folders.push(folder_path);
        save_settings(app, settings)?;
    }

    Ok(())
}

/// 監視フォルダを削除
pub fn remove_watched_folder(app: &tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut settings = get_settings(app)?;

    settings.watched_folders.retain(|f| f != &folder_path);
    save_settings(app, settings)?;

    Ok(())
}

/// 除外フォルダを追加
pub fn add_excluded_folder(app: &tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut settings = get_settings(app)?;

    if !settings.excluded_folders.contains(&folder_path) {
        settings.excluded_folders.push(folder_path);
        save_settings(app, settings)?;
    }

    Ok(())
}

/// 除外フォルダを削除
pub fn remove_excluded_folder(app: &tauri::AppHandle, folder_path: String) -> Result<(), String> {
    let mut settings = get_settings(app)?;

    settings.excluded_folders.retain(|f| f != &folder_path);
    save_settings(app, settings)?;

    Ok(())
}
