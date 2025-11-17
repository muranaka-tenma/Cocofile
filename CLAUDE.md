# CocoFile - プロジェクト設定

## 基本設定
```yaml
プロジェクト名: CocoFile（ココファイル）
アシスタント愛称: ココ
開始日: 2025-11-04
技術スタック:
  desktop_framework: Tauri 2.0
  frontend:
    language: TypeScript
    framework: React 18
    ui_library: shadcn/ui
    state_management: Zustand
    build_tool: Vite
  backend:
    language: Python 3.10+
    communication: Tauri Command API
  database:
    main: SQLite 3.35+
    search: FTS5 + N-gram tokenizer
  file_analysis:
    pdf: pdfplumber (MIT)
    excel: openpyxl (MIT)
    word: docx2txt (MIT)
    powerpoint: python-pptx (MIT)
  file_monitoring:
    local: tauri-plugin-fs-watch
    cloud_external: polling
```

## 開発環境
```yaml
ポート設定:
  # デスクトップアプリのため不要
  frontend: N/A (Tauriビルトインサーバー)
  backend: N/A (Tauri Command APIで直接通信)

環境変数:
  設定ファイル: .env（ルートディレクトリ）
  必須項目:
    - なし（完全ローカル動作）
```

## テスト認証情報
```yaml
開発用アカウント:
  # 完全ローカル動作のため不要
  なし

外部サービス:
  なし（完全オフライン動作）
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: SearchBox.tsx)
  - ユーティリティ: camelCase.ts (例: fileParser.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: FILE_TYPES.ts)
  - Python: snake_case.py (例: file_analyzer.py)

変数・関数:
  - TypeScript変数: camelCase
  - TypeScript関数: camelCase
  - TypeScript定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
  - Python変数/関数: snake_case
  - Pythonクラス: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - Pythonは型ヒント推奨

フォーマット:
  - TypeScript: Prettier使用
  - Python: Black使用
  - インデント: スペース2つ（TS）、スペース4つ（Python）
  - セミコロン: あり（TypeScript）
  - クォート: シングル（TypeScript）、ダブル（Python）
```

### コミットメッセージ
```yaml
形式: [type]: [description]

type:
  - feat: 新機能
  - fix: バグ修正
  - docs: ドキュメント
  - style: フォーマット
  - refactor: リファクタリング
  - test: テスト
  - chore: その他

例: "feat: ファイル検索機能を追加"
```

## プロジェクト固有ルール

### ディレクトリ構造
```yaml
推奨構成:
  /src-tauri: Tauriバックエンド（Rust）
  /src: フロントエンド（React + TypeScript）
    /components: UIコンポーネント
    /screens: 画面コンポーネント（S-001〜S-005）
    /hooks: カスタムフック
    /utils: ユーティリティ関数
    /types: 型定義
    /store: 状態管理（Zustand）
  /python-backend: Python分析エンジン
    /analyzers: ファイル分析モジュール
    /database: SQLite操作
    /utils: ユーティリティ
  /docs: ドキュメント
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: python-backend/types.py

同期ルール:
  - フロントエンド/バックエンドの型は厳密に一致させる
  - 変更時は両方更新
```

### ファイル命名規則
```yaml
画面コンポーネント:
  - S-001: MainSearchScreen.tsx
  - S-002: SettingsScreen.tsx
  - S-003: ScanIndexScreen.tsx
  - S-004: TagManagementScreen.tsx
  - S-005: FileDetailModal.tsx

Pythonモジュール:
  - pdf_analyzer.py
  - excel_analyzer.py
  - word_analyzer.py
  - ppt_analyzer.py
  - tag_suggester.py
```

## パフォーマンス要件

### 厳守事項
```yaml
メモリ使用量:
  - アイドル時: 150MB以下（目標: 30-40MB）
  - 最大時: 500MB以下

CPU使用率:
  - アイドル時: 1%以下
  - スキャン時: 50%以下

検索速度:
  - キーワード検索: 0.5秒以内
  - フィルター適用: 0.5秒以内

ファイル分析:
  - 5MB以下: 2秒以内
  - 5-100MB: 10秒以内
  - 100MB超: 警告表示
```

## ⚠️ プロジェクト固有の注意事項

### 技術的制約
```yaml
- ファイルサイズ制限: 500MB超は分析時間がかかる（警告表示）
- 同時スキャン数: 1フォルダずつ順次処理
- データベース容量: 10万ファイルで約100-150MB
- 対応ファイル形式: PDF、Excel(.xlsx/.xls)、Word(.docx)、PowerPoint(.pptx)
- OCR非対応: Phase 1では画像内テキスト抽出なし
```

### 日本語対応
```yaml
SQLite FTS5:
  - N-gramトークナイザー必須（2-gram推奨）
  - セットアップ手順は別途ドキュメント化

文字コード:
  - UTF-8で統一
  - BOM無し
```

### セキュリティ
```yaml
原則:
  - 完全ローカル動作
  - ネットワーク通信なし
  - データ送信なし

ファイルアクセス:
  - OSのファイル権限に依存
  - データベース暗号化なし（Phase 1）
```

## 📝 作業ログ（最新5件）
```yaml
- 2025-11-17: ✅ v0.1.22: デッドロック修正！logger.rsのMutex二重ロック問題を解決
- 2025-11-17: 🔍 v0.1.21: デバッグ版でハング箇所特定（logger初期化でデッドロック）
- 2025-11-17: 🔧 v0.1.20: グローバルショートカット無効化（ハング解消せず）
- 2025-11-17: 🔧 v0.1.19: Python backend遅延初期化実装（ハング解消せず）
- 2025-11-17: ❌ 重大問題！v0.1.18〜v0.1.20すべてWindows環境で起動時にハング
```

## ✅ 最新の状況（2025-11-17 完了）

### **完了した重要タスク**
```yaml
✅ v0.1.18-alphaリリース準備完了（2025-11-17）
   - Python backend起動失敗の根本原因を修正
   - os.fdopen()からreconfigure()への変更
   - ローカルテストで動作確認済み
   - GitHub Actionsでビルド中

✅ v0.1.17-alphaリリース完了（2025-11-14 19:37）
   - 全プラットフォーム対応（Linux、Windows、macOS）
   - デッドロック問題を完全修正
   - 9個のアセットを公開

✅ ドキュメント整理完了
   - check-status.sh作成（自動ステータス表示）
   - 古い引継ぎドキュメントをアーカイブ化
```

### **重要な修正履歴**
```yaml
v0.1.18 (2025-11-17):
  - Python backend起動失敗の根本原因を修正
  - 問題: OSError: [Errno 9] Bad file descriptor
  - 根本原因: os.fdopen(stdout, 'w', 0) - text modeでbuffer size 0は不可
  - 解決: sys.stdout.reconfigure(line_buffering=True)に変更
  - テスト: health checkコマンドで正常応答確認

v0.1.16 (2025-11-14):
  - デッドロック問題を完全解消
  - 問題: Rust側がPython起動完了メッセージを待ち続ける
  - 解決: 起動確認ロジックを削除、プロセス起動直後にOkを返す

v0.1.22 (2025-11-17):
  - デッドロック修正（根本原因解決！）
  - 問題: logger::initialize_logger()でMutexを二重にロック
  - 根本原因: LOG_FILE.lock()を保持したままlog()関数を呼び出し、log()内で再度lock()
  - 解決: スコープブロック{}でlockを明示的に解放してからlog()呼び出し
  - 期待: Windows環境で正常に起動するはず

v0.1.21 (2025-11-17):
  - デバッグ版リリース
  - 問題: v0.1.18-v0.1.20がWindows環境で起動時にハング
  - 対策: コンソール出力を有効化 (windows_subsystem無効化)
  - 対策: 詳細なデバッグログ追加（起動プロセスの全ステップを追跡）
  - 成果: logger初期化でハングしていることを特定

v0.1.17 (2025-11-14):
  - check-status.sh追加（プロジェクト現在地の自動表示）
  - .bashrcに自動実行設定追加
  - README.md更新（v0.1.17-alpha公開）
```

### **次の開発タスク**
```yaml
優先度: 中
タスク:
  - ユーザーフィードバック収集
  - 実機での動作確認（Windows、macOS）
  - パフォーマンス測定（メモリ、CPU、検索速度）
  - 新機能の追加（ファイルプレビュー、日付範囲フィルター）
```

---

**作成日**: 2025年11月4日
**最終更新**: 2025年11月17日
**対象**: CocoFile（ココファイル） - 個人利用ファイル管理アシスタント
**開発目標**: MVP 3-4ヶ月でリリース
