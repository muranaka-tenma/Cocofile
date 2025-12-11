use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs::{create_dir_all, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::{mpsc, Mutex};
use std::time::Duration;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// デバッグログをファイルに書き込む
fn debug_log(message: &str) {
    let log_message = format!(
        "[{}] {}\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
        message
    );

    // コンソールにも出力
    eprintln!("{}", log_message.trim());

    // ログディレクトリを取得
    if let Some(app_data) = dirs::config_dir() {
        let log_dir = app_data.join("com.cocofile.app").join("logs");
        let _ = create_dir_all(&log_dir);

        let log_file = log_dir.join("python-bridge-debug.log");
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&log_file) {
            let _ = file.write_all(log_message.as_bytes());
        }
    }
}

/// Pythonプロセスとの通信を管理する構造体
pub struct PythonBridge {
    process: Option<Child>,
    stdin: Option<ChildStdin>,
    stdout: Option<BufReader<ChildStdout>>,
}

impl PythonBridge {
    /// 新しいPythonブリッジを作成（プロセスは未起動）
    pub fn new() -> Self {
        Self {
            process: None,
            stdin: None,
            stdout: None,
        }
    }

    /// Pythonプロセスを起動
    ///
    /// 開発中はpython3コマンドで直接実行
    /// 本番環境ではPyInstallerでバイナリ化したファイルを実行
    pub fn start(&mut self) -> Result<(), String> {
        debug_log("PythonBridge::start() called");

        // 既に起動している場合はエラー
        if self.process.is_some() {
            debug_log("ERROR: Python process is already running");
            return Err("Python process is already running".to_string());
        }

        // Pythonバックエンドの実行パスを取得
        debug_log("Getting Python backend command...");
        let (program, args) = match get_python_backend_command() {
            Ok(cmd) => {
                debug_log(&format!("Python command: {} {:?}", cmd.0, cmd.1));
                cmd
            }
            Err(e) => {
                debug_log(&format!(
                    "ERROR: Failed to get Python backend command: {}",
                    e
                ));
                return Err(e);
            }
        };

        // プロセス起動
        debug_log(&format!("Spawning Python process: {}", program));

        let mut cmd = Command::new(&program);
        cmd.args(&args)
            .env("PYTHONUNBUFFERED", "1") // stdout/stderrアンバッファリング強制
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        // Windowsではコンソールウィンドウを非表示にする
        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        let mut child = match cmd.spawn() {
            Ok(child) => {
                debug_log("Python process spawned successfully");
                child
            }
            Err(e) => {
                debug_log(&format!("ERROR: Failed to spawn Python process: {}", e));
                return Err(format!("Failed to start Python process: {}", e));
            }
        };

        // stdinとstdoutを取得
        let stdin = child
            .stdin
            .take()
            .ok_or("Failed to get stdin".to_string())?;

        let stdout = child
            .stdout
            .take()
            .ok_or("Failed to get stdout".to_string())?;

        self.stdin = Some(stdin);
        self.stdout = Some(BufReader::new(stdout));
        self.process = Some(child);

        debug_log("Python process started successfully");
        println!("Python backend started successfully");

        Ok(())
    }

    /// Pythonプロセスにコマンドを送信
    fn send_command(&mut self, command: &Value) -> Result<(), String> {
        // stdinがNoneの場合、自動再起動
        if self.stdin.is_none() {
            debug_log("stdin is None, auto-restarting Python process...");
            self.start()?;
        }

        if let Some(ref mut stdin) = self.stdin {
            let command_str = serde_json::to_string(command)
                .map_err(|e| format!("Failed to serialize command: {}", e))?;

            stdin
                .write_all(command_str.as_bytes())
                .map_err(|e| format!("Failed to write to stdin: {}", e))?;

            stdin
                .write_all(b"\n")
                .map_err(|e| format!("Failed to write newline: {}", e))?;

            stdin
                .flush()
                .map_err(|e| format!("Failed to flush stdin: {}", e))?;

            Ok(())
        } else {
            Err("Python process is not running".to_string())
        }
    }

    /// Pythonプロセスからレスポンスを読み取り（15秒タイムアウトに短縮）
    fn read_response(&mut self) -> Result<Value, String> {
        // stdoutがNoneの場合、自動再起動
        if self.stdout.is_none() {
            debug_log("stdout is None, auto-restarting Python process...");
            self.start()?;
        }

        if self.stdout.is_none() {
            return Err("Python process is not running".to_string());
        }

        // stdoutを一時的に取り出す
        let stdout = self.stdout.take().unwrap();

        // チャンネルでタイムアウト処理
        let (tx, rx) = mpsc::channel();

        std::thread::spawn(move || {
            let mut stdout = stdout;
            let mut line = String::with_capacity(1024); // 事前容量確保
            let result = stdout.read_line(&mut line);
            let _ = tx.send((stdout, result, line));
        });

        // 15秒タイムアウト（メモリ節約のため短縮）
        match rx.recv_timeout(Duration::from_secs(15)) {
            Ok((stdout_back, result, line)) => {
                // stdoutを戻す
                self.stdout = Some(stdout_back);

                result.map_err(|e| format!("Failed to read from stdout: {}", e))?;

                if line.is_empty() {
                    return Err("Empty response from Python".to_string());
                }

                let response: Value = serde_json::from_str(&line).map_err(|e| {
                    format!(
                        "Failed to parse JSON response: {} (raw: {})",
                        e,
                        line.trim()
                    )
                })?;

                Ok(response)
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                debug_log(
                    "ERROR: Python response timeout (15 seconds) - killing process for restart",
                );
                // プロセスを強制終了してクリア（次回呼び出し時に自動再起動）
                if let Some(ref mut process) = self.process {
                    let _ = process.kill();
                    let _ = process.wait();
                }
                self.process = None;
                self.stdin = None;
                self.stdout = None;
                Err("Python response timeout after 15 seconds".to_string())
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                Err("Python reader thread disconnected unexpectedly".to_string())
            }
        }
    }

    /// ヘルスチェック
    pub fn health_check(&mut self) -> Result<String, String> {
        let command = json!({"command": "health"});
        self.send_command(&command)?;

        let response = self.read_response()?;

        if response["status"].as_str() == Some("success") {
            Ok("Python backend is healthy".to_string())
        } else {
            Err("Health check failed".to_string())
        }
    }

    /// PDFファイルを分析
    pub fn analyze_pdf(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_pdf", file_path)
    }

    /// Excelファイルを分析
    pub fn analyze_excel(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_excel", file_path)
    }

    /// Wordファイルを分析
    pub fn analyze_word(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_word", file_path)
    }

    /// PowerPointファイルを分析
    pub fn analyze_ppt(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_ppt", file_path)
    }

    /// テキストファイルを分析 (.txt, .md)
    pub fn analyze_text(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_text", file_path)
    }

    /// 画像ファイルをOCR分析 (.png, .jpg, .jpeg, .gif, .bmp, .tiff)
    pub fn analyze_image_ocr(&mut self, file_path: &str) -> Result<AnalyzeResult, String> {
        self.analyze_file("analyze_image_ocr", file_path)
    }

    /// ファイルを分析（内部共通処理）
    fn analyze_file(&mut self, command: &str, file_path: &str) -> Result<AnalyzeResult, String> {
        let command_json = json!({
            "command": command,
            "path": file_path
        });

        self.send_command(&command_json)?;
        let response = self.read_response()?;

        if response["status"].as_str() == Some("success") {
            let data = &response["data"];
            Ok(AnalyzeResult {
                text: data["text"].as_str().unwrap_or("").to_string(),
                file_size: data["file_size"].as_u64().unwrap_or(0),
                page_count: data.get("page_count").and_then(|v| v.as_u64()),
                sheet_count: data.get("sheet_count").and_then(|v| v.as_u64()),
                slide_count: data.get("slide_count").and_then(|v| v.as_u64()),
            })
        } else {
            Err(response["error"]
                .as_str()
                .unwrap_or("Unknown error")
                .to_string())
        }
    }

    /// Pythonプロセスを停止
    pub fn stop(&mut self) -> Result<(), String> {
        if let Some(ref mut process) = self.process {
            process
                .kill()
                .map_err(|e| format!("Failed to kill Python process: {}", e))?;

            process
                .wait()
                .map_err(|e| format!("Failed to wait for Python process: {}", e))?;

            self.process = None;
            self.stdin = None;
            self.stdout = None;

            println!("Python process stopped");
            Ok(())
        } else {
            Err("Python process is not running".to_string())
        }
    }
}

impl Drop for PythonBridge {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}

/// 分析結果の構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzeResult {
    pub text: String,
    pub file_size: u64,
    pub page_count: Option<u64>,
    pub sheet_count: Option<u64>,
    pub slide_count: Option<u64>,
}

/// グローバルなPythonブリッジインスタンス（スレッドセーフ）
pub static PYTHON_BRIDGE: Mutex<Option<PythonBridge>> = Mutex::new(None);

/// Pythonブリッジを初期化
#[allow(dead_code)]
pub fn initialize_python_bridge() -> Result<(), String> {
    let mut bridge_lock = PYTHON_BRIDGE
        .lock()
        .map_err(|e| format!("Failed to lock PYTHON_BRIDGE: {}", e))?;

    if bridge_lock.is_some() {
        return Ok(());
    }

    let mut bridge = PythonBridge::new();
    bridge.start()?;

    *bridge_lock = Some(bridge);

    Ok(())
}

/// Pythonブリッジを取得（遅延初期化対応）
pub fn get_python_bridge() -> Result<std::sync::MutexGuard<'static, Option<PythonBridge>>, String> {
    let mut bridge_lock = PYTHON_BRIDGE
        .lock()
        .map_err(|e| format!("Failed to lock PYTHON_BRIDGE: {}", e))?;

    // 未初期化の場合は自動的に初期化
    if bridge_lock.is_none() {
        debug_log("Python bridge not initialized, initializing now...");
        let mut bridge = PythonBridge::new();
        match bridge.start() {
            Ok(()) => {
                debug_log("Python bridge initialized successfully (lazy)");
                *bridge_lock = Some(bridge);
            }
            Err(e) => {
                debug_log(&format!("Failed to initialize Python bridge: {}", e));
                return Err(format!("Failed to initialize Python bridge: {}", e));
            }
        }
    }

    Ok(bridge_lock)
}

/// Pythonバックエンドの実行コマンドを取得
///
/// 優先順位:
/// 1. 環境変数 COCOFILE_PYTHON_BINARY が設定されていればそれを使用
/// 2. バイナリディレクトリにpython-analyzerがあればそれを使用
/// 3. 開発環境としてpython3コマンドを使用
fn get_python_backend_command() -> Result<(String, Vec<String>), String> {
    // 1. 環境変数チェック
    if let Ok(binary_path) = std::env::var("COCOFILE_PYTHON_BINARY") {
        println!("Using Python backend from environment: {}", binary_path);
        return Ok((binary_path, vec![]));
    }

    // 2. バイナリディレクトリチェック
    let binary_name = if cfg!(target_os = "windows") {
        "python-analyzer.exe"
    } else {
        "python-analyzer"
    };

    let mut binary_paths = vec![];

    // 実行ファイルの場所から探す（本番環境）
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // 実行ファイルと同じディレクトリの binaries/
            binary_paths.push(exe_dir.join("binaries").join(binary_name));
            // 実行ファイルの親ディレクトリの binaries/
            if let Some(parent_dir) = exe_dir.parent() {
                binary_paths.push(parent_dir.join("binaries").join(binary_name));
            }
        }
    }

    // カレントディレクトリからの相対パス（開発時）
    binary_paths.push(PathBuf::from(format!("src-tauri/binaries/{}", binary_name)));
    // カレントディレクトリの binaries/（開発時）
    binary_paths.push(PathBuf::from(format!("binaries/{}", binary_name)));
    // 絶対パス（Unix系本番時）
    binary_paths.push(PathBuf::from(format!("/usr/local/bin/{}", binary_name)));

    for binary_path in binary_paths {
        if binary_path.exists() {
            println!("Using Python backend binary: {}", binary_path.display());
            return Ok((binary_path.to_string_lossy().to_string(), vec![]));
        }
    }

    // 3. 開発環境フォールバック
    println!("Using development Python backend (python3)");
    Ok((
        "python3".to_string(),
        vec!["-u".to_string(), "python-backend/main.py".to_string()],
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_python_backend_command() {
        let (program, args) = get_python_backend_command().unwrap();
        assert!(!program.is_empty());
        println!("Program: {}", program);
        println!("Args: {:?}", args);
    }
}
