// CocoFile - File Watcher Module
// Monitors file system changes and updates the database automatically

use crate::database;
use crate::logger;
use crate::settings_manager;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, SystemTime};

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
}

impl FileWatcherManager {
    /// 新しいファイル監視マネージャーを作成
    pub fn new() -> Self {
        Self {
            watcher: None,
            event_receiver: None,
            watched_paths: Vec::new(),
        }
    }

    /// ファイル監視を開始
    pub fn start(&mut self, app: tauri::AppHandle) -> Result<(), String> {
        logger::info("FileWatcher", "Starting file watcher...");

        // 設定から監視フォルダを取得
        let settings = settings_manager::get_settings(&app)?;
        let watched_folders = settings.watched_folders;

        if watched_folders.is_empty() {
            logger::info(
                "FileWatcher",
                "No watched folders configured, skipping watcher start",
            );
            return Ok(());
        }

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
        thread::spawn(move || {
            logger::info("FileWatcher", "Event processing thread started");
            for res in notify_rx {
                match res {
                    Ok(event) => {
                        Self::process_notify_event(event, &event_sender);
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
    fn process_notify_event(event: Event, sender: &Sender<FileEvent>) {
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
                if path.is_file() {
                    let file_event = FileEvent {
                        path: path.clone(),
                        event_type: event_type.clone(),
                    };
                    let _ = sender.send(file_event);
                }
            }
        }
    }

    /// データベース更新ループ
    fn update_database_loop(app: tauri::AppHandle, receiver: Receiver<FileEvent>) {
        logger::info("FileWatcher", "Database update thread started");

        let mut pending_events: Vec<FileEvent> = Vec::new();
        let batch_delay = Duration::from_secs(2);
        let mut last_batch_time = SystemTime::now();

        loop {
            // イベントを受信（タイムアウト付き）
            match receiver.recv_timeout(batch_delay) {
                Ok(event) => {
                    pending_events.push(event);
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                    // タイムアウト: バッチ処理を実行
                }
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                    logger::info("FileWatcher", "Event channel disconnected, stopping...");
                    break;
                }
            }

            // 一定時間経過またはイベントが溜まったら処理
            let elapsed = SystemTime::now()
                .duration_since(last_batch_time)
                .unwrap_or(Duration::from_secs(0));

            if !pending_events.is_empty() && elapsed >= batch_delay {
                logger::info(
                    "FileWatcher",
                    &format!("Processing {} pending events", pending_events.len()),
                );

                // イベントをバッチ処理
                Self::process_events_batch(&app, &pending_events);

                pending_events.clear();
                last_batch_time = SystemTime::now();
            }
        }

        logger::info("FileWatcher", "Database update thread stopped");
    }

    /// イベントバッチを処理
    fn process_events_batch(app: &tauri::AppHandle, events: &[FileEvent]) {
        for event in events {
            let path_str = event.path.to_string_lossy().to_string();

            match event.event_type {
                FileEventType::Created | FileEventType::Modified => {
                    // ファイルをスキャンしてDBに追加/更新
                    if event.path.exists() {
                        logger::info("FileWatcher", &format!("Indexing file: {}", path_str));

                        if let Err(e) = Self::index_file(app, &event.path) {
                            logger::error(
                                "FileWatcher",
                                &format!("Failed to index {}: {}", path_str, e),
                            );
                        }
                    }
                }
                FileEventType::Deleted => {
                    // ファイルをDBから削除
                    logger::info(
                        "FileWatcher",
                        &format!("Removing file from index: {}", path_str),
                    );

                    if let Err(e) = Self::remove_file_from_index(app, &path_str) {
                        logger::error(
                            "FileWatcher",
                            &format!("Failed to remove {}: {}", path_str, e),
                        );
                    }
                }
            }
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
