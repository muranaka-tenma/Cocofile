# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 正規表現検索機能
- ファイルプレビュー機能
- 日付範囲フィルターUI
- 自動スキャン機能

---

## [0.1.1-alpha] - 2025-11-10

### Added
- **クロスプラットフォーム対応** - Windows/macOS/Linux 全プラットフォーム自動ビルド
- **GitHub Actions CI/CD** - タグプッシュで全バイナリ自動生成
- **Windows インストーラー** - MSI と NSIS インストーラー
- **macOS インストーラー** - DMG パッケージ（Apple Silicon対応）
- **Linux 追加形式** - .deb パッケージと AppImage
- **Issue テンプレート** - Bug Report, Feature Request, Beta Feedback
- **ベータテストガイド** - テスター向け詳細ガイド
- **CONTRIBUTING.md** - コントリビューションガイドライン

### Changed
- ビルドプロセスを完全自動化（24回の試行で達成）
- README.md をベータテスト向けに更新

### Fixed
- Windows ビルドの frontendDist パス問題を解決
- GitHub Release への成果物アップロード問題を修正

### Technical
- Windows 専用: tauri.conf.json の frontendDist を動的に調整
- Artifact パスを frontend/src-tauri/ に対応
- 全プラットフォームで並列ビルド実行

---

## [0.1.0] - 2025-11-06

### Added
- **初回リリース（Linux のみ）**
- 全文検索機能（SQLite FTS5 + N-gram tokenizer）
- PDF/Excel/Word/PowerPoint ファイル対応
- タグ機能
- フォルダスキャン機能
- ファイルタイプフィルター
- 完全ローカル動作（オフライン）

### Technical Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Tauri 2.0
- File Analysis: Python 3.10+ (PyInstaller バイナリ化)
- Database: SQLite 3.35+ with FTS5
- UI: shadcn/ui
- State Management: Zustand

### Performance
- アイドル時メモリ: 30-40MB目標
- 最大メモリ: 500MB以下
- 検索速度: 0.5秒以内（目標）

---

**Project**: CocoFile（ココファイル）
**Repository**: https://github.com/muranaka-tenma/Cocofile
