# CocoFile v0.1.0 - リリースノート

**リリース日**: 2025年11月5日
**バージョン**: 0.1.0 (MVP)
**リリースタイプ**: Alpha版

---

## 概要

CocoFile v0.1.0は、完全ローカル動作のファイル管理デスクトップアプリケーションの初回リリース（MVP）です。
PDF、Excel、Word、PowerPointファイルの高速全文検索を実現し、効率的なファイル管理をサポートします。

このリリースは**Alpha版**として提供され、主に開発者およびアーリーアダプター向けです。

---

## 主な機能

### ファイル検索機能

- **高速全文検索**: SQLite FTS5 + N-gram tokenizer による日本語対応検索
- **部分一致検索**: 日本語の部分一致に対応（例: 「売上」で「売上データ2024.xlsx」を検索）
- **ファイル内容検索**: ファイル名だけでなく、ファイル内容も検索対象
- **検索速度**: 0.5秒以内（目標）

### 対応ファイル形式

- **PDF** (.pdf) - pdfplumberを使用
- **Excel** (.xlsx, .xls) - openpyxlを使用
- **Word** (.docx) - docx2txtを使用
- **PowerPoint** (.pptx) - python-pptxを使用

### ファイル管理機能

- **タグ管理**: ファイルにタグを付けて分類
- **お気に入り**: よく使うファイルをお気に入りに登録
- **重複ファイル検出**: ハッシュ値によるファイル重複検出
- **最近使用**: 最近開いたファイルの履歴表示

### UI機能

- **5つの画面**:
  - S-001: メイン検索画面
  - S-002: 設定画面
  - S-003: スキャン・インデックス管理画面
  - S-004: タグ管理画面
  - S-005: ファイル詳細モーダル
- **グローバルホットキー**: Ctrl+Shift+F (Windows/Linux) / Cmd+Shift+F (macOS)
- **レスポンシブデザイン**: shadcn/uiによるモダンなUI

---

## 技術スタック

### デスクトップフレームワーク
- **Tauri 2.0** - 軽量・高速なデスクトップアプリフレームワーク

### フロントエンド
- **React 18** + **TypeScript** - 型安全なフロントエンド開発
- **Vite** - 高速ビルドツール
- **shadcn/ui** - モダンなUIコンポーネントライブラリ
- **Zustand** - 状態管理ライブラリ

### バックエンド
- **Rust** - 高速・安全なバックエンド
- **Python 3.10+** - ファイル分析エンジン
- **SQLite 3.35+** - データベース（FTS5 + N-gram）

### ファイル分析ライブラリ（全てMITライセンス）
- **pdfplumber** (v0.11.0) - PDF分析
- **openpyxl** (v3.1.2) - Excel分析
- **docx2txt** (v0.8) - Word分析
- **python-pptx** (v0.6.23) - PowerPoint分析

---

## プラットフォーム対応

### 現在対応済み
- **Linux** (x86_64) - ✅ プロダクションビルド完了

### 今後対応予定
- **Windows 10/11** - Phase 7-8で対応予定
- **macOS** (Catalina以降) - Phase 7-8で対応予定

---

## インストール

### Linux（開発版）

1. GitHubリリースページからバイナリをダウンロード
2. 実行権限を付与:
   ```bash
   chmod +x cocofile
   ```
3. アプリケーションを起動:
   ```bash
   ./cocofile
   ```

### Windows / macOS

インストーラー版は今後のリリースで提供予定です。
現在は開発版をビルドして使用してください（詳細はSETUP.mdを参照）。

---

## パフォーマンス

### 目標値（Phase 7-8で測定予定）

- **メモリ使用量**:
  - アイドル時: 150MB以下（目標: 30-40MB）
  - 最大時: 500MB以下
- **検索速度**: 0.5秒以内
- **CPU使用率**:
  - アイドル時: 1%以下
  - スキャン時: 50%以下

### ファイル分析速度

- **小容量ファイル（5MB以下）**: 2秒以内
- **中容量ファイル（5-100MB）**: 10秒以内
- **大容量ファイル（100MB超）**: 警告表示

---

## 既知の問題

### 未実装機能（Phase 2以降で対応予定）

- [ ] **GUIテスト未実施**: CLI環境での統合テストは成功済み。実環境GUIテストは推奨事項として別途実施予定
- [ ] **日付範囲フィルターUI**: データベース側は対応済み、UI未実装
- [ ] **ファイルプレビュー**: ファイル詳細モーダルでのプレビュー表示未実装
- [ ] **自動スキャン**: フォルダ監視による自動インデックス化未実装
- [ ] **テーマ変更**: ライト/ダークモード切り替え未実装
- [ ] **多言語対応**: 英語UI未実装
- [ ] **OCR対応**: 画像内テキスト認識未対応

### 技術的制約

- **ファイルサイズ制限**: 500MB超のファイルは分析に時間がかかります
- **同時スキャン数**: 1フォルダずつ順次処理
- **データベース容量**: 10万ファイルで約100-150MB
- **対応ファイル形式**: PDF、Excel(.xlsx/.xls)、Word(.docx)、PowerPoint(.pptx)のみ

### バグ・制限事項

- **WSL2環境**: X11サーバー（VcXsrv等）が必要
- **macOS**: 初回起動時にセキュリティ許可が必要
- **クラウドストレージ**: ローカルに同期されたファイルのみ検索可能

---

## セキュリティとプライバシー

### 完全ローカル動作

- **インターネット接続不要**: 完全オフラインで動作
- **データ送信なし**: すべてのデータはローカルに保存
- **外部サービス不使用**: 外部APIを使用しません

### データ保存場所

**データベース**:
- Linux: `~/.local/share/cocofile/cocofile.db`
- macOS: `~/Library/Application Support/cocofile/cocofile.db`
- Windows: `%APPDATA%\cocofile\cocofile.db`

**ログファイル**:
- Linux: `~/.config/CocoFile/logs/cocofile.log`
- macOS: `~/Library/Application Support/CocoFile/logs/cocofile.log`
- Windows: `C:\Users\{USER}\AppData\Roaming\CocoFile\logs\cocofile.log`

### ファイルアクセス

- OSのファイル権限に依存
- 読み取り専用（ファイルを変更しません）
- データベース暗号化なし（Phase 1では未対応）

---

## 破壊的変更

v0.1.0は初回リリースのため、破壊的変更はありません。

---

## アップグレードガイド

v0.1.0は初回リリースのため、アップグレード手順はありません。

---

## 今後の予定

### Phase 7: リリース準備（2025年11月）

- クロスプラットフォームビルド（Windows/macOS）
- インストーラー作成（.msi/.dmg/.deb/.AppImage）
- ユーザーマニュアル作成（完了）
- GUIテスト実施（推奨）

### Phase 8: 追加機能（2025年12月）

- 日付範囲フィルターUI実装
- ファイルプレビュー機能
- 自動スキャン機能
- テーマ変更機能

### Phase 9: AI機能（2026年1月以降）

- Ollama統合（自然言語検索）
- ChromaDB/LanceDB統合（意味検索）
- タグ提案の高精度化

---

## クレジット

### 開発チーム

- **プロジェクト名**: CocoFile（ココファイル）
- **愛称**: ココ
- **開発開始日**: 2025年11月4日
- **MVP達成日**: 2025年11月4日

### 使用オープンソースライブラリ

すべてMITライセンスです。

- [Tauri](https://tauri.app/) - MIT License
- [React](https://react.dev/) - MIT License
- [Vite](https://vitejs.dev/) - MIT License
- [shadcn/ui](https://ui.shadcn.com/) - MIT License
- [pdfplumber](https://github.com/jsvine/pdfplumber) - MIT License
- [openpyxl](https://openpyxl.readthedocs.io/) - MIT License
- [docx2txt](https://github.com/ankushshah89/python-docx2txt) - MIT License
- [python-pptx](https://python-pptx.readthedocs.io/) - MIT License

---

## ダウンロード

### Linux (x86_64)

- **バイナリサイズ**: 約15MB（Rust）+ 36MB（Python）
- **実行ファイル**: `cocofile`
- **ダウンロード**: [GitHubリリースページ](https://github.com/yourusername/CocoFile/releases)（準備中）

### Windows / macOS

今後のリリースで提供予定です。

---

## サポート

### バグ報告・機能要望

- **GitHub Issues**: https://github.com/yourusername/CocoFile/issues
- **ログファイル**: 問題が発生した場合はログファイルを添付してください

### ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [SETUP.md](../SETUP.md) - 開発環境構築ガイド
- [USER_MANUAL.md](./USER_MANUAL.md) - ユーザーマニュアル
- [GUI_TEST_GUIDE.md](./GUI_TEST_GUIDE.md) - GUIテストガイド

---

## 変更履歴

### v0.1.0 (2025-11-05) - 初回リリース

#### 新機能
- メイン検索画面（S-001）
- 設定画面（S-002）
- スキャン・インデックス管理画面（S-003）
- タグ管理画面（S-004）
- ファイル詳細モーダル（S-005）
- グローバルホットキー（Ctrl+Shift+F / Cmd+Shift+F）
- SQLite FTS5 + N-gram全文検索
- PDF/Excel/Word/PowerPoint分析
- タグ管理
- お気に入り機能
- 重複ファイル検出

#### 技術的改善
- Pythonバイナリ化（PyInstaller）
- ロギングシステム実装
- Tauri 2.0統合
- Rust + Python連携
- TypeScript型安全性

#### ドキュメント
- README.md
- SETUP.md
- USER_MANUAL.md
- GUI_TEST_GUIDE.md
- MVP_100_COMPLETION.md
- INTEGRATION_TEST_REPORT.md
- QUALITY_ASSURANCE_REPORT.md

---

**リリース日**: 2025年11月5日
**バージョン**: 0.1.0 (MVP)
**ライセンス**: MIT License
**プロジェクト**: CocoFile（ココファイル）
