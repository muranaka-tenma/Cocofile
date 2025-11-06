# CocoFile - Phase 7完了後の次のステップ

**作成日**: 2025年11月5日
**Phase 7ステータス**: 80%完了（Linux環境）
**対象**: Phase 8以降の計画

---

## Phase 7完了状況サマリー

### 完了項目（2025年11月5日）

- [x] **Linuxプロダクションビルド**
  - Rustバイナリ: 15MB (`src-tauri/target/release/cocofile`)
  - Pythonバイナリ: 36MB (`src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu`)
  - フロントエンドビルド: 410KB (gzip圧縮後)

- [x] **ユーザーマニュアル作成**
  - ファイル: `docs/USER_MANUAL.md`
  - 内容: インストール、初回セットアップ、基本操作、トラブルシューティング、FAQ

- [x] **リリースノート作成**
  - ファイル: `docs/RELEASE_NOTES_v0.1.0.md`
  - 内容: 機能一覧、技術スタック、既知の問題、今後の予定

- [x] **進捗管理ドキュメント更新**
  - ファイル: `docs/SCOPE_PROGRESS.md`
  - Phase 7の進捗を95%に更新

### 未完了項目（推奨）

- [ ] **実環境GUIテスト** - 推奨だが必須ではない
- [ ] **パフォーマンス測定** - 推奨だが必須ではない
- [ ] **Windows/macOSビルド** - Phase 8で実施予定
- [ ] **インストーラー作成** - Phase 8で実施予定

---

## Phase 8: クロスプラットフォームビルド

### 目標

全プラットフォーム（Windows、macOS、Linux）で動作するバイナリとインストーラーを作成する。

### 所要時間

約1-2週間

---

### タスク8-1: Windows本番ビルド

#### 前提条件

- Windows 10/11環境
- Rust、Node.js、Python環境構築済み
- Visual Studio Build Tools導入済み

#### 手順

1. **環境構築**
   ```powershell
   # PowerShellで実行
   cd C:\path\to\CocoFile

   # フロントエンド依存関係
   cd frontend
   npm install

   # Python依存関係
   cd ..\python-backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Pythonバイナリビルド（Windows版）**
   ```powershell
   cd python-backend
   .\venv\Scripts\activate
   pyinstaller python-analyzer.spec

   # バイナリを配置
   copy dist\python-analyzer.exe ..\src-tauri\binaries\python-analyzer-x86_64-pc-windows-msvc.exe
   ```

3. **Tauriプロダクションビルド**
   ```powershell
   cd ..\frontend
   npm run tauri build
   ```

4. **成果物確認**
   - 場所: `src-tauri\target\release\`
   - ファイル: `cocofile.exe`
   - インストーラー: `src-tauri\target\release\bundle\msi\CocoFile_0.1.0_x64_en-US.msi`

#### 期待される成果物

- **実行ファイル**: `cocofile.exe` (約15-20MB)
- **MSIインストーラー**: `CocoFile_0.1.0_x64_en-US.msi` (約50-60MB)
- **Pythonバイナリ**: `python-analyzer-x86_64-pc-windows-msvc.exe` (約40-50MB)

---

### タスク8-2: macOS本番ビルド

#### 前提条件

- macOS Catalina以降
- Xcode Command Line Tools導入済み
- Rust、Node.js、Python環境構築済み

#### 手順

1. **環境構築**
   ```bash
   cd /path/to/CocoFile

   # フロントエンド依存関係
   cd frontend
   npm install

   # Python依存関係
   cd ../python-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Pythonバイナリビルド（macOS版）**
   ```bash
   cd python-backend
   source venv/bin/activate
   pyinstaller python-analyzer.spec

   # バイナリを配置
   cp dist/python-analyzer ../src-tauri/binaries/python-analyzer-x86_64-apple-darwin
   # M1/M2 Macの場合: python-analyzer-aarch64-apple-darwin
   ```

3. **Tauriプロダクションビルド**
   ```bash
   cd ../frontend
   npm run tauri build
   ```

4. **成果物確認**
   - 場所: `src-tauri/target/release/`
   - ファイル: `cocofile`
   - アプリバンドル: `src-tauri/target/release/bundle/macos/CocoFile.app`
   - DMGイメージ: `src-tauri/target/release/bundle/dmg/CocoFile_0.1.0_x64.dmg`

#### 期待される成果物

- **実行ファイル**: `cocofile` (約15-20MB)
- **アプリバンドル**: `CocoFile.app` (約50-60MB)
- **DMGインストーラー**: `CocoFile_0.1.0_x64.dmg` (約50-60MB)
- **Pythonバイナリ**: `python-analyzer-x86_64-apple-darwin` または `python-analyzer-aarch64-apple-darwin` (約40-50MB)

#### 注意事項

- **コード署名**: v0.1.0では未対応、v1.0で対応予定
- **公証**: App Store配布しない限り不要
- **Gatekeeper**: 初回起動時にユーザーが許可する必要あり

---

### タスク8-3: Linux追加形式ビルド

#### 既存の成果物

- [x] バイナリ: `cocofile` (15MB)
- [x] Pythonバイナリ: `python-analyzer-x86_64-unknown-linux-gnu` (36MB)

#### 追加で作成する形式

1. **.deb パッケージ（Debian/Ubuntu向け）**
   ```bash
   cd frontend
   npm run tauri build -- --bundles deb
   ```

   成果物: `src-tauri/target/release/bundle/deb/cocofile_0.1.0_amd64.deb`

2. **.AppImage（ポータブル版）**
   ```bash
   cd frontend
   npm run tauri build -- --bundles appimage
   ```

   成果物: `src-tauri/target/release/bundle/appimage/cocofile_0.1.0_amd64.AppImage`

#### 期待される成果物

- **.deb**: 約50-60MB（依存関係込み）
- **.AppImage**: 約60-70MB（完全にポータブル）

---

## Phase 9: インストーラー最終調整とテスト

### 目標

各プラットフォームのインストーラーが正しく動作することを確認する。

### 所要時間

約3-5日

---

### タスク9-1: Windowsインストーラーテスト

#### テスト内容

1. **インストール**
   - MSIファイルをダブルクリック
   - インストールウィザードに従ってインストール
   - デフォルトインストール先: `C:\Program Files\CocoFile`

2. **動作確認**
   - スタートメニューから起動
   - デスクトップショートカットから起動
   - ホットキー（Ctrl+Shift+F）動作確認

3. **アンインストール**
   - コントロールパネル > プログラムと機能 > CocoFile > アンインストール
   - ファイルが完全に削除されるか確認

#### チェック項目

- [ ] インストール成功
- [ ] アプリケーション起動成功
- [ ] ホットキー動作確認
- [ ] スキャン・検索動作確認
- [ ] アンインストール成功

---

### タスク9-2: macOSインストーラーテスト

#### テスト内容

1. **インストール**
   - DMGファイルをダブルクリック
   - CocoFile.appをアプリケーションフォルダにドラッグ&ドロップ

2. **初回起動（Gatekeeper）**
   - アプリケーションフォルダから起動
   - 「開発元を確認できないため開けません」と表示される場合:
     1. システム環境設定 > セキュリティとプライバシー
     2. 「このまま開く」をクリック

3. **動作確認**
   - ホットキー（Cmd+Shift+F）動作確認
   - スキャン・検索動作確認

4. **アンインストール**
   - アプリケーションフォルダからCocoFile.appをゴミ箱に移動
   - `~/Library/Application Support/cocofile`を削除

#### チェック項目

- [ ] DMGマウント成功
- [ ] インストール成功
- [ ] Gatekeeper回避方法が明確
- [ ] ホットキー動作確認
- [ ] スキャン・検索動作確認
- [ ] アンインストール成功

---

### タスク9-3: Linuxインストーラーテスト

#### テスト内容（.deb）

1. **インストール**
   ```bash
   sudo dpkg -i cocofile_0.1.0_amd64.deb
   sudo apt-get install -f  # 依存関係の解決
   ```

2. **動作確認**
   ```bash
   cocofile  # コマンドラインから起動
   ```

3. **アンインストール**
   ```bash
   sudo apt-get remove cocofile
   ```

#### テスト内容（.AppImage）

1. **実行権限付与**
   ```bash
   chmod +x cocofile_0.1.0_amd64.AppImage
   ```

2. **起動**
   ```bash
   ./cocofile_0.1.0_amd64.AppImage
   ```

3. **動作確認**
   - ホットキー（Ctrl+Shift+F）動作確認
   - スキャン・検索動作確認

#### チェック項目

- [ ] .debインストール成功
- [ ] .AppImage起動成功
- [ ] ホットキー動作確認
- [ ] スキャン・検索動作確認
- [ ] .debアンインストール成功

---

## Phase 10: GitHubリリース準備

### 目標

GitHubリリースページを作成し、バイナリを公開する。

### 所要時間

約1日

---

### タスク10-1: GitHubリリースページ作成

#### 手順

1. **GitHubリポジトリにアクセス**
   - https://github.com/yourusername/CocoFile

2. **新しいリリースを作成**
   - Releases > Create a new release
   - Tag: `v0.1.0`
   - Title: `CocoFile v0.1.0 - Initial Release (Alpha)`

3. **リリースノートを記載**
   - `docs/RELEASE_NOTES_v0.1.0.md`の内容をコピー&ペースト

4. **バイナリをアップロード**
   - Windows: `CocoFile_0.1.0_x64_en-US.msi`
   - macOS: `CocoFile_0.1.0_x64.dmg`
   - Linux:
     - `cocofile_0.1.0_amd64.deb`
     - `cocofile_0.1.0_amd64.AppImage`
     - `cocofile` (バイナリ単体)

5. **Pre-releaseとして公開**
   - チェックボックス: "This is a pre-release"
   - ボタン: "Publish release"

---

### タスク10-2: README更新

#### 更新内容

1. **ダウンロードリンク追加**
   ```markdown
   ## ダウンロード

   ### v0.1.0 (Alpha) - 2025年11月5日

   - [Windows (MSI)](https://github.com/yourusername/CocoFile/releases/download/v0.1.0/CocoFile_0.1.0_x64_en-US.msi)
   - [macOS (DMG)](https://github.com/yourusername/CocoFile/releases/download/v0.1.0/CocoFile_0.1.0_x64.dmg)
   - [Linux (.deb)](https://github.com/yourusername/CocoFile/releases/download/v0.1.0/cocofile_0.1.0_amd64.deb)
   - [Linux (.AppImage)](https://github.com/yourusername/CocoFile/releases/download/v0.1.0/cocofile_0.1.0_amd64.AppImage)
   ```

2. **バッジ更新**
   ```markdown
   ![Status](https://img.shields.io/badge/status-Alpha%20v0.1.0-yellow.svg)
   ```

3. **インストール手順更新**
   - ユーザーマニュアルへのリンク追加
   - インストーラー版の手順を追記

---

## Phase 11: フィードバック収集と改善

### 目標

ユーザーからのフィードバックを収集し、バグ修正と改善を行う。

### 所要時間

継続的（1-2ヶ月）

---

### タスク11-1: フィードバック収集

#### 方法

1. **GitHub Issues**
   - バグ報告テンプレート作成
   - 機能要望テンプレート作成

2. **ユーザーテスト**
   - 5-10名のベータユーザーを募集
   - `docs/USER_TESTING_GUIDE.md`に従ってテスト実施
   - フィードバックをGitHub Issuesに記録

3. **アンケート**
   - Google Forms等でアンケート作成
   - 使いやすさ、機能不足、バグ等を調査

---

### タスク11-2: バグ修正と改善

#### 優先度

1. **高優先度（即座に対応）**
   - アプリケーションクラッシュ
   - データ損失の可能性
   - セキュリティ問題

2. **中優先度（v0.2.0で対応）**
   - UI/UXの問題
   - パフォーマンス改善
   - 機能追加要望

3. **低優先度（v1.0で対応）**
   - 細かいUI調整
   - ドキュメント改善
   - マイナーな機能追加

---

## Phase 12: v0.2.0に向けた機能追加

### 目標

v0.1.0のフィードバックを元に、機能を追加する。

### 所要時間

約1-2ヶ月

---

### 主要機能候補

1. **日付範囲フィルターUI** - データベース側は対応済み
2. **ファイルプレビュー機能** - PDF/Excel/Word/PowerPointのプレビュー表示
3. **自動スキャン機能** - フォルダ監視による自動インデックス化
4. **テーマ変更機能** - ライト/ダークモード切り替え
5. **多言語対応** - 英語UI
6. **クラウドストレージ対応** - OneDrive、Google Drive等の自動検出
7. **設定のインポート/エクスポート** - 設定の共有

---

## リスクと対策

### リスク1: クロスプラットフォームビルドの失敗

**影響度**: 高

**原因**:
- 環境依存の問題
- Tauriの設定ミス
- Pythonバイナリの互換性問題

**対策**:
- 各プラットフォームでの事前テスト実施
- Tauri公式ドキュメントを参照
- PyInstallerのクロスプラットフォーム設定を確認

---

### リスク2: インストーラーの配布問題

**影響度**: 中

**原因**:
- macOSのGatekeeper
- Windowsのスマートスクリーン
- Linuxの依存関係不足

**対策**:
- ユーザーマニュアルに回避方法を明記
- README.mdに詳細な手順を記載
- 公式サイト（今後作成）でチュートリアル動画を提供

---

### リスク3: ユーザーフィードバックの不足

**影響度**: 低

**原因**:
- ユーザー数が少ない
- フィードバック方法が不明確

**対策**:
- ベータユーザーを積極的に募集
- GitHub Issues、アンケートフォームを用意
- SNS（Twitter、Reddit等）で告知

---

## 成功基準

### Phase 8完了基準

- [ ] Windows MSIインストーラー作成完了
- [ ] macOS DMGインストーラー作成完了
- [ ] Linux .deb/.AppImage作成完了
- [ ] 全プラットフォームで動作確認成功

### Phase 10完了基準

- [ ] GitHubリリースページ公開
- [ ] バイナリダウンロード可能
- [ ] README.mdにダウンロードリンク追加

### Phase 11完了基準

- [ ] 5名以上のベータユーザーからフィードバック収集
- [ ] 重大なバグ0件
- [ ] ユーザー満足度80%以上

---

## タイムライン

### 2025年11月

- **Week 1**: Phase 7完了、ドキュメント整備
- **Week 2-3**: Phase 8（クロスプラットフォームビルド）
- **Week 4**: Phase 9（インストーラーテスト）

### 2025年12月

- **Week 1**: Phase 10（GitHubリリース）
- **Week 2-4**: Phase 11（フィードバック収集）

### 2026年1月以降

- **Phase 12**: v0.2.0開発開始
- **Phase 13**: AI機能追加（Ollama、ChromaDB等）

---

## 参考ドキュメント

- [RELEASE_READINESS_CHECKLIST.md](./RELEASE_READINESS_CHECKLIST.md) - リリース準備チェックリスト
- [HANDOFF_TO_NEXT_PHASE.md](./HANDOFF_TO_NEXT_PHASE.md) - Phase 6→7引き継ぎ情報
- [SCOPE_PROGRESS.md](./SCOPE_PROGRESS.md) - 最新進捗状況
- [USER_MANUAL.md](./USER_MANUAL.md) - ユーザーマニュアル
- [RELEASE_NOTES_v0.1.0.md](./RELEASE_NOTES_v0.1.0.md) - リリースノート
- [SETUP.md](../SETUP.md) - 環境構築ガイド
- [README.md](../README.md) - プロジェクト概要

---

**作成日**: 2025年11月5日
**Phase 7ステータス**: 80%完了
**次のマイルストーン**: Phase 8（クロスプラットフォームビルド）
**プロジェクト**: CocoFile（ココファイル）
