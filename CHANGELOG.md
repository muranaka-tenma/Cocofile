# Changelog

All notable changes to CocoFile will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-05

### Overview

CocoFile v0.1.0 - 完全ローカル動作のファイル管理デスクトップアプリケーションの初回リリース（MVP Alpha版）

### Added

#### コア機能
- **高速全文検索**: SQLite FTS5 + N-gram tokenizer による日本語対応検索
- **部分一致検索**: 日本語の部分一致に対応（0.5秒以内目標）
- **ファイル内容検索**: ファイル名とファイル内容の両方を検索対象に

#### 対応ファイル形式
- PDF分析 (pdfplumber v0.11.0)
- Excel分析 (.xlsx/.xls - openpyxl v3.1.2)
- Word分析 (.docx - docx2txt v0.8)
- PowerPoint分析 (.pptx - python-pptx v0.6.23)

#### ファイル管理機能
- タグ管理: ファイルにタグを付けて分類
- お気に入り: よく使うファイルをお気に入りに登録
- 重複ファイル検出: ハッシュ値によるファイル重複検出
- 最近使用: 最近開いたファイルの履歴表示

#### UI機能
- 5つの画面実装
  - S-001: メイン検索画面
  - S-002: 設定画面
  - S-003: スキャン・インデックス管理画面
  - S-004: タグ管理画面
  - S-005: ファイル詳細モーダル
- グローバルホットキー: Ctrl+Shift+F (Windows/Linux) / Cmd+Shift+F (macOS)
- shadcn/uiによるモダンなレスポンシブデザイン

#### バックエンドAPI
- 9つのTauri Commandsを実装
  - `scan_folder` - フォルダスキャン
  - `search_files` - ファイル検索
  - `add_tag` / `remove_tag` - タグ管理
  - `set_favorite` - お気に入り管理
  - `get_file_details` - ファイル詳細取得
  - `find_duplicates` - 重複検出
  - `get_recent_files` - 最近使用取得
  - `open_file_location` - ファイル位置表示

#### 技術スタック
- Tauri 2.0 - デスクトップフレームワーク
- React 18 + TypeScript - フロントエンド
- Vite - ビルドツール
- Zustand - 状態管理
- Rust - バックエンド
- Python 3.10+ - ファイル分析エンジン
- SQLite 3.35+ (FTS5 + N-gram) - データベース

#### プラットフォーム
- Linux (x86_64) - プロダクションビルド完了

#### ドキュメント
- README.md - プロジェクト概要
- SETUP.md - 開発環境構築ガイド
- USER_MANUAL.md - ユーザーマニュアル
- GUI_TEST_GUIDE.md - GUIテストガイド
- RELEASE_NOTES_v0.1.0.md - リリースノート
- PHASE7_COMPLETION_REPORT.md - Phase 7完了報告

### Known Issues

#### 未実装機能（今後のリリースで対応予定）
- 日付範囲フィルターUI（データベース側は対応済み）
- ファイルプレビュー機能
- 自動スキャン（フォルダ監視）
- テーマ変更（ライト/ダークモード）
- 多言語対応（英語UI）
- OCR対応（画像内テキスト認識）

#### 技術的制約
- ファイルサイズ制限: 500MB超のファイルは分析に時間がかかります
- 同時スキャン数: 1フォルダずつ順次処理
- データベース容量: 10万ファイルで約100-150MB
- 対応ファイル形式: PDF、Excel(.xlsx/.xls)、Word(.docx)、PowerPoint(.pptx)のみ

#### プラットフォーム制約
- WSL2環境: X11サーバー（VcXsrv等）が必要
- macOS: 初回起動時にセキュリティ許可が必要
- Windows/macOS: 今後のリリースで対応予定

### Security

- 完全ローカル動作（インターネット接続不要）
- データ送信なし（すべてローカル保存）
- 外部サービス不使用
- ファイル読み取り専用（変更なし）

### Performance Targets

- メモリ使用量: アイドル時150MB以下（目標30-40MB）
- 検索速度: 0.5秒以内
- CPU使用率: アイドル時1%以下
- ファイル分析速度:
  - 小容量（5MB以下）: 2秒以内
  - 中容量（5-100MB）: 10秒以内
  - 大容量（100MB超）: 警告表示

### Technical Details

**バイナリサイズ**:
- Rust: 15MB (ELF 64-bit LSB pie executable)
- Python: 36MB (PyInstaller bundled)
- 合計: 51MB

**データ保存場所**:
- Linux: `~/.local/share/cocofile/cocofile.db`
- ログ: `~/.config/CocoFile/logs/cocofile.log`

**ライセンス**: MIT License

---

## Roadmap

### [0.2.0] - 2025年12月予定

- Windows 10/11対応 (MSIインストーラー)
- macOS対応 (DMGインストーラー)
- 日付範囲フィルターUI実装
- ファイルプレビュー機能
- テーマ変更機能（ライト/ダークモード）
- 自動スキャン機能

### [0.3.0] - 2026年1月以降予定

- AI機能統合 (Ollama)
- 意味検索 (ChromaDB/LanceDB)
- タグ提案の高精度化
- OCR対応（画像内テキスト認識）
- 多言語対応（英語UI）

---

[0.1.0]: https://github.com/yourusername/CocoFile/releases/tag/v0.1.0
