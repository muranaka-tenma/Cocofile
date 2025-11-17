# CocoFile（ココファイル）

**個人利用ファイル管理アシスタント** - ローカル環境で動作するデスクトップアプリ

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-v0.1.17--alpha-yellow.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Phase](https://img.shields.io/badge/phase-12%20testing-orange.svg)

---

## 📖 概要

CocoFileは、**完全ローカル動作**のファイル管理デスクトップアプリケーションです。
PDF、Excel、Word、PowerPointファイルの内容を全文検索し、効率的にファイルを見つけることができます。

### 🎯 主な特徴

- **完全オフライン動作** - データは一切外部に送信されません
- **高速全文検索** - SQLite FTS5 + N-gram tokenizer による日本語対応検索
- **多形式対応** - PDF、Excel（.xlsx/.xls）、Word（.docx）、PowerPoint（.pptx）
- **軽量設計** - アイドル時メモリ使用量30-40MB目標
- **クロスプラットフォーム** - Windows、macOS、Linux対応

---

## 📥 ダウンロード

### 🎉 v0.1.17-alpha リリース！

**デッドロック問題を修正した最新版です。** v0.1.1-alphaで発生していたアプリケーション起動時のフリーズ問題を完全に解決しました。

全プラットフォーム（Linux/Windows/macOS）対応版です。

### v0.1.17-alpha（2025年11月14日） - 最新

**[リリースページ](https://github.com/muranaka-tenma/Cocofile/releases/tag/v0.1.17-alpha)**

#### 🐧 Linux
- [.deb (Debian/Ubuntu)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_amd64.deb) - 53.4MB
- [AppImage (全ディストリビューション)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_amd64.AppImage) - 125.9MB

#### 🪟 Windows
- [MSI Installer](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_x64_en-US.msi) - 37.8MB
- [NSIS Installer](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_x64-setup.exe) - 36.2MB

#### 🍎 macOS
- [DMG (Apple Silicon)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_aarch64.dmg) - 35.3MB

**インストールガイド**: [docs/BETA_TEST_GUIDE.md](docs/BETA_TEST_GUIDE.md)

### インストール手順

#### Linux - .deb（Debian/Ubuntu）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_amd64.deb

# インストール
sudo dpkg -i CocoFile_0.1.17_amd64.deb

# 依存関係の解決（必要な場合）
sudo apt-get install -f

# 起動（アプリケーションメニューから、またはコマンドから）
cocofile
```

#### Linux - AppImage（全ディストリ対応）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.17-alpha/CocoFile_0.1.17_amd64.AppImage

# 実行権限を付与
chmod +x CocoFile_0.1.17_amd64.AppImage

# 起動
./CocoFile_0.1.17_amd64.AppImage
```

詳細なインストール手順は [ユーザーマニュアル](docs/USER_MANUAL.md) を参照してください。

---

## 🚀 開発者向けクイックスタート

### 必要環境

- **Rust**: 1.70+ (Tauriバックエンド)
- **Node.js**: 18+ (フロントエンド)
- **Python**: 3.10+ (ファイル分析エンジン)
- **SQLite**: 3.35+ (FTS5サポート必須)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/CocoFile.git
cd CocoFile

# Python依存関係インストール
cd python-backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# フロントエンド依存関係インストール
npm install

# アプリケーション起動（開発モード）
npm run tauri dev
```

---

## 🏗️ アーキテクチャ

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| **Desktop Framework** | Tauri 2.0 |
| **Frontend** | React 18 + TypeScript + Vite |
| **UI Library** | shadcn/ui |
| **State Management** | Zustand |
| **Backend** | Rust + Python 3.10+ |
| **Database** | SQLite 3.35+ (FTS5 + N-gram) |
| **File Analysis** | pdfplumber, openpyxl, docx2txt, python-pptx |

### システム構成図

```
┌─────────────────────────────────────────────┐
│          Frontend (React + TS)              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Search  │  │ Scan    │  │ Settings│    │
│  │ Screen  │  │ Screen  │  │ Screen  │    │
│  └─────────┘  └─────────┘  └─────────┘    │
└──────────────────┬──────────────────────────┘
                   │ Tauri Command API
┌──────────────────▼──────────────────────────┐
│       Rust Backend (src-tauri)              │
│  ┌────────────┐  ┌─────────────────────┐   │
│  │  Database  │  │  File Scanner       │   │
│  │  (SQLite)  │  │  + FTS5 N-gram      │   │
│  └────────────┘  └─────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │   Python Bridge (JSON RPC)          │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│   Python Backend (python-backend/)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   PDF    │ │  Excel   │ │   Word   │   │
│  │ Analyzer │ │ Analyzer │ │ Analyzer │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐                              │
│  │   PPT    │                              │
│  │ Analyzer │                              │
│  └──────────┘                              │
└────────────────────────────────────────────┘
```

---

## 📁 プロジェクト構造

```
CocoFile/
├── src/                      # フロントエンド（React + TypeScript）
│   ├── components/          # UIコンポーネント
│   ├── screens/             # 画面コンポーネント
│   ├── hooks/               # カスタムフック
│   ├── utils/               # ユーティリティ
│   ├── types/               # 型定義
│   └── store/               # Zustand状態管理
├── src-tauri/               # Tauriバックエンド（Rust）
│   ├── src/
│   │   ├── database.rs      # SQLite FTS5操作
│   │   ├── python_bridge.rs # Python通信ブリッジ
│   │   ├── file_scanner.rs  # ファイルスキャン + 検索
│   │   ├── logger.rs        # ロギングシステム
│   │   └── lib.rs           # Tauri Commands
│   └── binaries/            # Pythonバイナリ配置先
├── python-backend/          # Python分析エンジン
│   ├── main.py             # JSON RPCサーバー
│   ├── analyzers/          # ファイル分析モジュール
│   │   ├── pdf_analyzer.py
│   │   ├── excel_analyzer.py
│   │   ├── word_analyzer.py
│   │   └── ppt_analyzer.py
│   └── requirements.txt    # Python依存関係
└── docs/                    # ドキュメント
    ├── PHASE4_COMPLETION.md # Phase 4完了レポート
    ├── PYTHON_SETUP.md      # Python環境セットアップ
    └── TECHNICAL_DECISIONS.md
```

---

## 🛠️ 開発ガイド

### ビルドコマンド

```bash
# 開発モード起動
npm run tauri dev

# Rustコンパイルチェック
cd src-tauri && cargo check

# TypeScriptビルド
npm run build

# 本番ビルド（バイナリ作成）
npm run tauri build
```

### Python環境セットアップ

詳細は [`docs/PYTHON_SETUP.md`](docs/PYTHON_SETUP.md) を参照。

**開発環境**:
```bash
cd python-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**本番バイナリ化** (PyInstaller):
```bash
cd python-backend
pyinstaller python-analyzer.spec

# バイナリを配置
cp dist/python-analyzer ../src-tauri/binaries/python-analyzer-{target-triple}
```

### テストスクリプト

```bash
# 統合テスト（Python + Rust + TypeScript）
./test_backend.sh
```

---

## 📚 ドキュメント

### ユーザー向け
- [ユーザーマニュアル](docs/USER_MANUAL.md) - インストールと使い方
- [リリースノート v0.1.0](docs/RELEASE_NOTES_v0.1.0.md) - 最新版の変更点

### 開発者向け
- [セットアップガイド](SETUP.md) - 環境構築手順
- [API リファレンス](docs/API_REFERENCE.md) - 35個の全API仕様
- [実装サマリー](docs/IMPLEMENTATION_SUMMARY.md) - MVP完了時の実装内容
- [Phase 9 テストレポート](docs/PHASE9_TEST_REPORT.md) - 最新テスト結果

### プロジェクト管理
- [進捗管理](docs/SCOPE_PROGRESS.md) - 開発フロー進捗状況
- [プロジェクトスナップショット](docs/PROJECT_STATE_SNAPSHOT.md) - 完全な状態記録

---

## 📊 現在の開発状況

### Phase 11進行中（2025年11月6日〜）

**ステータス**: 🚧 **Phase 11: クロスプラットフォームビルド進行中**

| Phase | ステータス | 達成率 |
|-------|----------|-------|
| Phase 1-5: MVP基本機能 | ✅ 完了 | 100% |
| Phase 6: テスト | ✅ 完了 | 80% |
| Phase 7: リリース準備 | ✅ 完了 | 80% |
| Phase 8: 完了準備 | ✅ 完了 | 100% |
| Phase 9: テスト実施 | ✅ 完了 | 100% |
| Phase 10: GitHubリリース | ✅ 完了 | 100% |
| **Phase 11: クロスプラットフォーム** | 🚧 **進行中** | **40%** |

**MVP達成率**: **100%** （20/20タスク完了）
**Phase 11達成率**: **40%** （Linux追加形式 + GitHub Actions完了）

### 実装済み機能

**コア機能**:
- ✅ 5画面実装（メイン検索、設定、スキャン、タグ管理、ファイル詳細）
- ✅ 全文検索（SQLite FTS5 + N-gram）
- ✅ ファイル分析（PDF/Excel/Word/PowerPoint）
- ✅ タグ管理・お気に入り機能
- ✅ ファイル整理支援（Phase 7）

**技術実装**:
- ✅ 35個のTauri Command API
- ✅ Pythonバイナリ化（PyInstaller）
- ✅ Linuxプロダクションビルド（15MB + 36MB）
- ✅ 統合テスト完了

**パフォーマンス**:
- ✅ 予測メモリ使用量: 30-50MB（アイドル時）
- ✅ ビルドサイズ: Linux tar.gz 41MB / .deb 5.3MB / AppImage 78MB
- ✅ ビルド時間: 6.34秒（フロントエンド）

**Phase 11進捗**:
- ✅ Linux .deb パッケージ作成
- ✅ Linux AppImage 作成
- ✅ GitHub Actions CI/CD設定
- 🔄 Windows/macOS自動ビルド（GitHub Actions稼働待ち）

---

## 🎯 次のステップ（Phase 11以降）

### Phase 11: クロスプラットフォームビルド（進行中）

1. **Linux追加形式** ✅ 完了
   - ✅ .deb パッケージ作成（Debian/Ubuntu）
   - ✅ .AppImage 作成（ポータブル版）

2. **GitHub Actions CI/CD** ✅ 完了
   - ✅ Linux自動ビルド設定
   - ✅ Windows自動ビルド設定
   - ✅ macOS自動ビルド設定
   - 🔄 次回タグプッシュ時に稼働

3. **Windows/macOS本番ビルド** 🔜 次回
   - 🔄 GitHub Actionsで自動ビルド実施予定
   - 🔄 MSI/DMGインストーラー作成
   - 🔄 実機テスト実施

### Phase 12: フィードバック収集と改善

4. **ベータユーザーテスト**（5-10名）
5. **パフォーマンス実測**（メモリ、CPU、検索速度）
6. **バグ修正と改善**

### Phase 12: v0.2.0開発（予定）

7. **日付範囲フィルターUI実装**
8. **ファイルプレビュー機能**
9. **自動スキャン機能**

---

## 📝 ロギング

アプリケーションログは以下に保存されます：

- **Windows**: `C:\Users\{USER}\AppData\Roaming\CocoFile\logs\cocofile.log`
- **macOS**: `~/Library/Application Support/CocoFile/logs/cocofile.log`
- **Linux**: `~/.config/CocoFile/logs/cocofile.log`

ログフォーマット:
```
[2025-11-04T12:34:56.789Z] [INFO] [App] CocoFile application started
[2025-11-04T12:35:10.123Z] [INFO] [FileScanner] Starting scan: /path/to/docs
[2025-11-04T12:35:12.456Z] [ERROR] [FileAnalyzer] Analysis failed - File='...'
```

---

## 🔒 セキュリティ・プライバシー

- **完全ローカル動作** - インターネット接続不要
- **データ送信なし** - すべてのデータはローカルに保存
- **OSファイル権限に依存** - アクセス可能なファイルのみ処理

---

## 📄 ライセンス

MIT License

---

## 🙏 謝辞

使用しているオープンソースライブラリ：

- [Tauri](https://tauri.app/) - MIT License
- [React](https://react.dev/) - MIT License
- [Vite](https://vitejs.dev/) - MIT License
- [shadcn/ui](https://ui.shadcn.com/) - MIT License
- [pdfplumber](https://github.com/jsvine/pdfplumber) - MIT License
- [openpyxl](https://openpyxl.readthedocs.io/) - MIT License
- [docx2txt](https://github.com/ankushshah89/python-docx2txt) - MIT License
- [python-pptx](https://python-pptx.readthedocs.io/) - MIT License

---

## 📞 サポート

- **ドキュメント**: `docs/` ディレクトリ参照
- **Issues**: GitHubのIssuesで報告してください
- **愛称**: ココ（CocoFile）

---

**開発開始日**: 2025年11月4日
**現在のステータス**: Phase 4完了（MVP 95%達成）
**目標**: MVP 3-4ヶ月でリリース
