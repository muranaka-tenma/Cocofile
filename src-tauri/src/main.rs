// Prevents additional console window on Windows in release
// 一時的に無効化してデバッグログを表示可能にする
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    eprintln!("[DEBUG] main() started");
    cocofile_lib::run();
    eprintln!("[DEBUG] main() completed");
}
