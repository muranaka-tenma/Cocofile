// CocoFile - File Watcher Module
// Monitors file system changes and updates the database automatically

use crate::database;
use crate::logger;
use crate::settings_manager;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};
use tauri::Emitter;

/// ファイル監視イベント
#[derive(Debug, Clone)]
struct FileEvent {
    path: PathBuf,
    event_type: FileEventType,
}

#[derive(Debug, Clone)]
enum FileEventType {
    Created,
    Modified,
    Deleted,
}

/// ファイル監視マネージャー
pub struct FileWatcherManager {
    watcher: Option<RecommendedWatcher>,
    event_receiver: Option<Receiver<FileEvent>>,
    watched_paths: Vec<PathBuf>,
    app_handle: Option<tauri::AppHandle>,
}

impl FileWatcherManager {
    /// 新しいファイル監視マネージャーを作成
    pub fn new() -> Self {
        Self {
            watcher: None,
            event_receiver: None,
            watched_paths: Vec::new(),
            app_handle: None,
        }
    }

    /// ファイルが除外対象かチェック
    fn is_excluded(
        path: &Path,
        excluded_folders: &[String],
        excluded_extensions: &[String],
    ) -> bool {
        // 除外フォルダをチェック
        let path_str = path.to_string_lossy();
        for excluded in excluded_folders {
            if path_str.contains(excluded) {
                return true;
            }
        }

        // 除外拡張子をチェック
        if let Some(ext) = path.extension() {
            let ext_str = format!(".{}", ext.to_string_lossy());
            if excluded_extensions.contains(&ext_str) {
                return true;
            }
        }

        false
    }

    /// ファイル監視を開始
    pub fn start(&mut self, app: tauri::AppHandle) -> Result<(), String> {
        logger::info("FileWatcher", "Starting file watcher...");

        // 設定から監視フォルダと除外設定を取得
        let settings = settings_manager::get_settings(&app)?;
        let watched_folders = settings.watched_folders;
        let excluded_folders = settings.excluded_folders.clone();
        let excluded_extensions = settings.excluded_extensions.clone();

        if watched_folders.is_empty() {
            logger::info(
                "FileWatcher",
                "No watched folders configured, skipping watcher start",
            );
            return Ok(());
        }

        self.app_handle = Some(app.clone());

        // イベントチャンネルを作成
        let (tx, rx) = channel::<FileEvent>();
        self.event_receiver = Some(rx);

        // notify用のチャンネルを作成
        let (notify_tx, notify_rx) = channel::<Result<Event, notify::Error>>();

        // Watcherを作成
        let mut watcher = RecommendedWatcher::new(notify_tx, Config::default()).map_err(|e| {
            logger::error("FileWatcher", &format!("Failed to create watcher: {}", e));
            format!("Failed to create file watcher: {}", e)
        })?;

        // 監視フォルダを登録
        for folder in &watched_folders {
            let path = Path::new(folder);
            if path.exists() {
                match watcher.watch(path, RecursiveMode::Recursive) {
                    Ok(()) => {
                        logger::info("FileWatcher", &format!("Now watching: {}", folder));
                        self.watched_paths.push(path.to_path_buf());
                    }
                    Err(e) => {
                        logger::error("FileWatcher", &format!("Failed to watch {}: {}", folder, e));
                    }
                }
            } else {
                logger::error("FileWatcher", &format!("Folder does not exist: {}", folder));
            }
        }

        self.watcher = Some(watcher);

        // イベント処理スレッドを起動
        let event_sender = tx.clone();
        let excluded_folders_clone = excluded_folders.clone();
        let excluded_extensions_clone = excluded_extensions.clone();
        thread::spawn(move || {
            logger::info("FileWatcher", "Event processing thread started");
            for res in notify_rx {
                match res {
                    Ok(event) => {
                        Self::process_notify_event(
                            event,
                            &event_sender,
                            &excluded_folders_clone,
                            &excluded_extensions_clone,
                        );
                    }
                    Err(e) => {
                        logger::error("FileWatcher", &format!("Watch error: {:?}", e));
                    }
                }
            }
            logger::info("FileWatcher", "Event processing thread stopped");
        });

        // データベース更新スレッドを起動
        let app_handle = app.clone();
        if let Some(receiver) = self.event_receiver.take() {
            thread::spawn(move || {
                Self::update_database_loop(app_handle, receiver);
            });
        }

        logger::info("FileWatcher", "File watcher started successfully");
        Ok(())
    }

    /// notifyイベントを内部イベントに変換
    fn process_notify_event(
        event: Event,
        sender: &Sender<FileEvent>,
        excluded_folders: &[String],
        excluded_extensions: &[String],
    ) {
        use notify::EventKind;

        let event_type = match event.kind {
            EventKind::Create(_) => Some(FileEventType::Created),
            EventKind::Modify(_) => Some(FileEventType::Modified),
            EventKind::Remove(_) => Some(FileEventType::Deleted),
            _ => None,
        };

        if let Some(event_type) = event_type {
            for path in event.paths {
                // ディレクトリは無視
                if !path.is_file() {
                    continue;
                }

                // 除外パターンをチェック
                if Self::is_excluded(&path, excluded_folders, excluded_extensions) {
                    // 除外ファイルは大量になるので、詳細ログは出力しない
                    continue;
                }

                let file_event = FileEvent {
                    path: path.clone(),
                    event_type: event_type.clone(),
                };
                let _ = sender.send(file_event);
            }
        }
    }

    /// データベース更新ループ（改善版debounce処理）
    fn update_database_loop(app: tauri::AppHandle, receiver: Receiver<FileEvent>) {
        logger::info("FileWatcher", "Database update thread started");

        // ファイルパスごとの最後のイベント時刻を記録
        let mut pending_events: HashMap<PathBuf, (FileEvent, Instant)> = HashMap::new();
        let batch_delay = Duration::from_millis(500); // 500ms
        let debounce_delay = Duration::from_millis(1000); // 1秒

        loop {
            // イベントを受信（タイムアウト付き）
            match receiver.recv_timeout(batch_delay) {
                Ok(event) => {
                    // 同じファイルのイベントは最新のものだけを保持（debounce）
                    let path = event.path.clone();
                    pending_events.insert(path, (event, Instant::now()));
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                    // タイムアウト: バッチ処理を実行
                }
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                    logger::info("FileWatcher", "Event channel disconnected, stopping...");
                    break;
                }
            }

            // debounce期間が経過したイベントを処理
            let now = Instant::now();
            let mut events_to_process: Vec<FileEvent> = Vec::new();
            pending_events.retain(|_path, (event, timestamp)| {
                if now.duration_since(*timestamp) >= debounce_delay {
                    events_to_process.push(event.clone());
                    false // このイベントを削除
                } else {
                    true // このイベントを保持
                }
            });

            if !events_to_process.is_empty() {
                logger::info(
                    "FileWatcher",
                    &format!("Processing {} debounced events", events_to_process.len()),
                );

                // イベントをバッチ処理
                Self::process_events_batch(&app, &events_to_process);
            }
        }

        logger::info("FileWatcher", "Database update thread stopped");
    }

    /// イベントバッチを処理
    fn process_events_batch(app: &tauri::AppHandle, events: &[FileEvent]) {
        let mut indexed_count = 0;
        let mut deleted_count = 0;
        let mut error_count = 0;

        for event in events {
            let path_str = event.path.to_string_lossy().to_string();

            match event.event_type {
                FileEventType::Created | FileEventType::Modified => {
                    // ファイルをスキャンしてDBに追加/更新
                    if event.path.exists() {
                        logger::info("FileWatcher", &format!("Indexing file: {}", path_str));

                        match Self::index_file(app, &event.path) {
                            Ok(_) => indexed_count += 1,
                            Err(e) => {
                                logger::error(
                                    "FileWatcher",
                                    &format!("Failed to index {}: {}", path_str, e),
                                );
                                error_count += 1;
                            }
                        }
                    }
                }
                FileEventType::Deleted => {
                    // ファイルをDBから削除
                    logger::info(
                        "FileWatcher",
                        &format!("Removing file from index: {}", path_str),
                    );

                    match Self::remove_file_from_index(app, &path_str) {
                        Ok(_) => deleted_count += 1,
                        Err(e) => {
                            logger::error(
                                "FileWatcher",
                                &format!("Failed to remove {}: {}", path_str, e),
                            );
                            error_count += 1;
                        }
                    }
                }
            }
        }

        // フロントエンドにイベントを通知
        if indexed_count > 0 || deleted_count > 0 {
            let _ = app.emit(
                "file-watcher-update",
                serde_json::json!({
                    "indexed": indexed_count,
                    "deleted": deleted_count,
                    "errors": error_count,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }),
            );
        }
    }

    /// ファイルをインデックス化
    fn index_file(app: &tauri::AppHandle, path: &Path) -> Result<(), String> {
        let file_path = path.to_string_lossy().to_string();

        // ファイル情報を取得
        let metadata =
            std::fs::metadata(path).map_err(|e| format!("Failed to get metadata: {}", e))?;

        let file_name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let file_extension = path
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let file_size = metadata.len();

        // ファイルタイプを判定（拡張子をそのまま使用）
        let file_type = file_extension.clone();

        // データベースに挿入/更新
        let conn = database::get_connection(app)?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT OR REPLACE INTO file_metadata (
                file_path, file_name, file_type, file_size, indexed_at
            ) VALUES (?1, ?2, ?3, ?4, ?5)",
            (&file_path, &file_name, &file_type, file_size as i64, &now),
        )
        .map_err(|e| format!("Failed to insert file: {}", e))?;

        Ok(())
    }

    /// ファイルをインデックスから削除
    fn remove_file_from_index(app: &tauri::AppHandle, file_path: &str) -> Result<(), String> {
        let conn = database::get_connection(app)?;

        conn.execute(
            "DELETE FROM file_metadata WHERE file_path = ?1",
            [file_path],
        )
        .map_err(|e| format!("Failed to delete file: {}", e))?;

        Ok(())
    }

    /// 監視を停止
    pub fn stop(&mut self) -> Result<(), String> {
        logger::info("FileWatcher", "Stopping file watcher...");

        if let Some(mut watcher) = self.watcher.take() {
            for path in &self.watched_paths {
                let _ = watcher.unwatch(path);
            }
            self.watched_paths.clear();
        }

        self.event_receiver = None;

        logger::info("FileWatcher", "File watcher stopped");
        Ok(())
    }
}

/// グローバルなファイル監視マネージャー
static FILE_WATCHER: Mutex<Option<FileWatcherManager>> = Mutex::new(None);

/// ファイル監視を開始
#[tauri::command]
pub fn start_file_watcher(app: tauri::AppHandle) -> Result<(), String> {
    let mut watcher_lock = FILE_WATCHER
        .lock()
        .map_err(|e| format!("Failed to lock FILE_WATCHER: {}", e))?;

    if watcher_lock.is_none() {
        let mut manager = FileWatcherManager::new();
        manager.start(app)?;
        *watcher_lock = Some(manager);
        Ok(())
    } else {
        Err("File watcher is already running".to_string())
    }
}

/// ファイル監視を停止
#[tauri::command]
pub fn stop_file_watcher() -> Result<(), String> {
    let mut watcher_lock = FILE_WATCHER
        .lock()
        .map_err(|e| format!("Failed to lock FILE_WATCHER: {}", e))?;

    if let Some(ref mut manager) = *watcher_lock {
        manager.stop()?;
        *watcher_lock = None;
        Ok(())
    } else {
        Err("File watcher is not running".to_string())
    }
}

/// ファイル監視の状態を取得
#[tauri::command]
pub fn get_file_watcher_status() -> Result<bool, String> {
    let watcher_lock = FILE_WATCHER
        .lock()
        .map_err(|e| format!("Failed to lock FILE_WATCHER: {}", e))?;

    Ok(watcher_lock.is_some())
}
