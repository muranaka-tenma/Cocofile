use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

/// ロガーの設定
static LOG_FILE: Mutex<Option<PathBuf>> = Mutex::new(None);

/// ログレベル
#[derive(Debug, Clone, Copy)]
pub enum LogLevel {
    Info,
    Warn,
    Error,
}

impl LogLevel {
    fn as_str(&self) -> &str {
        match self {
            LogLevel::Info => "INFO",
            LogLevel::Warn => "WARN",
            LogLevel::Error => "ERROR",
        }
    }
}

/// ロガーを初期化
///
/// app_data_dir/logs/cocofile.log にログファイルを作成
pub fn initialize_logger(app: &tauri::AppHandle) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let log_dir = app_data_dir.join("logs");
    fs::create_dir_all(&log_dir)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;

    let log_file_path = log_dir.join("cocofile.log");

    // グローバルにログファイルパスを保存
    let mut log_file = LOG_FILE
        .lock()
        .map_err(|e| format!("Failed to lock LOG_FILE: {}", e))?;
    *log_file = Some(log_file_path.clone());

    // 初期化メッセージ
    log(
        LogLevel::Info,
        "Logger",
        &format!("Log file initialized: {}", log_file_path.display()),
    );

    Ok(())
}

/// ログを記録
///
/// # Arguments
/// * `level` - ログレベル
/// * `module` - モジュール名
/// * `message` - ログメッセージ
pub fn log(level: LogLevel, module: &str, message: &str) {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let log_line = format!(
        "[{}] [{}] [{}] {}\n",
        timestamp,
        level.as_str(),
        module,
        message
    );

    // 標準エラー出力にも出力
    eprint!("{}", log_line);

    // ファイルに書き込み
    if let Ok(log_file) = LOG_FILE.lock() {
        if let Some(ref path) = *log_file {
            if let Ok(mut file) = OpenOptions::new()
                .create(true)
                .append(true)
                .open(path)
            {
                let _ = file.write_all(log_line.as_bytes());
            }
        }
    }
}

/// Infoレベルのログ
pub fn info(module: &str, message: &str) {
    log(LogLevel::Info, module, message);
}

/// Warnレベルのログ
pub fn warn(module: &str, message: &str) {
    log(LogLevel::Warn, module, message);
}

/// Errorレベルのログ
pub fn error(module: &str, message: &str) {
    log(LogLevel::Error, module, message);
}

/// ログファイルのパスを取得
pub fn get_log_file_path() -> Option<PathBuf> {
    LOG_FILE.lock().ok().and_then(|f| f.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_level() {
        assert_eq!(LogLevel::Info.as_str(), "INFO");
        assert_eq!(LogLevel::Warn.as_str(), "WARN");
        assert_eq!(LogLevel::Error.as_str(), "ERROR");
    }
}
