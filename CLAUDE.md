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
- 2025-11-14: check-status.sh作成（プロジェクト現在地を自動表示）+ v0.1.17-alphaタグプッシュ
- 2025-11-14: デッドロック問題を発見・分析（v0.1.16で修正済みだがリリース未実施）
- 2025-11-14: ホームディレクトリの古いCLAUDE.mdを削除（プロジェクト混同防止）
- 2025-11-04: 🎉 MVP 100%達成！（PyInstallerバイナリビルド+E2Eテスト完了）
- 2025-11-04: 環境構築完了（Rust、Node.js、Python、uv導入、SETUP.md作成）
```

## 🚨 現在の状況（2025-11-14）

### **緊急タスク**
```yaml
状態: GitHub Actionsビルド待ち（v0.1.17-alpha）
問題: GitHubリリースが古い（v0.1.1-alpha）
影響: ユーザーがダウンロードできるバージョンにデッドロック問題あり
対応: v0.1.17-alphaタグをプッシュ済み → GitHub Actions自動ビルド中（15-30分）
```

### **次回開いたときに最初にやること**
```yaml
1. GitHub Actionsのビルド状況を確認
   → https://github.com/muranaka-tenma/Cocofile/actions

2. ビルド成功していたら:
   → GitHubリリースページからバイナリをダウンロード
   → 実行してデッドロック問題が解決されているか確認
   → README.mdのバージョン表記をv0.1.17-alphaに更新

3. ビルド失敗していたら:
   → エラーログを確認して修正
   → タグを再プッシュ
```

### **重要な修正履歴**
```yaml
v0.1.16 (2025-11-14):
  - デッドロック問題を完全解消
  - 問題: Rust側がPython起動完了メッセージを待ち続ける
  - 解決: 起動確認ロジックを削除、プロセス起動直後にOkを返す

v0.1.17 (2025-11-14):
  - check-status.sh追加（プロジェクト現在地の自動表示）
  - .bashrcに自動実行設定追加
```

---

**作成日**: 2025年11月4日
**最終更新**: 2025年11月14日
**対象**: CocoFile（ココファイル） - 個人利用ファイル管理アシスタント
**開発目標**: MVP 3-4ヶ月でリリース
