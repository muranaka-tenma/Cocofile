# Phase 6 継続ガイド - PC再起動後の作業再開手順

## 📋 現在の状態（2025-11-05 時点）

### 完了した作業

#### Phase 1-4: MVP基本機能実装 ✅
- フロントエンド（React + TypeScript）完成
- バックエンド（Rust + Tauri）完成
- データベース（SQLite + FTS5）実装完了
- 全5画面実装完了:
  - S-001: メイン検索画面
  - S-002: 設定画面
  - S-003: スキャン・インデックス画面
  - S-004: タグ管理画面
  - S-005: ファイル詳細モーダル

#### Phase 5: 新機能設計 ✅
- ファイル整理支援機能の設計完了
- クラウドストレージ対応の設計完了
- ドキュメント: `PHASE5_FILE_ORGANIZATION_DESIGN.md`

#### Phase 6-1〜6-2: API統合とモック削除 ✅
- 18個のTauri API実装完了
- モックサービス完全削除
- 実API統合完了
- ブラウザ開発環境対応（mock data fallback）

#### Phase 6-3: Windowsビルド 🔄 進行中
- WSL2でWindows用クロスコンパイル実行中
- mingw-w64インストール完了
- Cargoの設定完了
- ビルドコマンド実行中: `cargo build --release --target x86_64-pc-windows-gnu`

### 実装済みAPI一覧（27個）

#### データベース基本操作（2個）
1. `initialize_db` - データベース初期化
2. `get_db_stats` - データベース統計取得

#### ファイル分析（5個）
3. `analyze_pdf_file` - PDF分析
4. `analyze_excel_file` - Excel分析
5. `analyze_word_file` - Word分析
6. `analyze_ppt_file` - PowerPoint分析
7. `scan_directory` - ディレクトリスキャン

#### 検索（1個）
8. `search_files` - ファイル検索

#### タグ管理（8個）
9. `get_tags` - タグ一覧取得
10. `create_tag` - タグ作成
11. `update_tag` - タグ更新
12. `delete_tag` - タグ削除
13. `add_tag_to_file` - ファイルにタグ追加
14. `remove_tag_from_file` - ファイルからタグ削除
15. `get_file_tags` - ファイルのタグ一覧取得
16. `update_file_tags` - ファイルのタグ一括更新

#### お気に入り・最近使用（4個）
17. `toggle_favorite` - お気に入り切り替え
18. `get_favorites` - お気に入り一覧取得
19. `get_recent_files` - 最近使用したファイル取得
20. `record_file_access` - ファイルアクセス記録

#### 設定管理（7個）
21. `get_settings` - 設定取得
22. `save_settings` - 設定保存
23. `add_watched_folder` - 監視フォルダ追加
24. `remove_watched_folder` - 監視フォルダ削除
25. `add_excluded_folder` - 除外フォルダ追加
26. `remove_excluded_folder` - 除外フォルダ削除
27. `python_health_check` - Pythonバックエンドヘルスチェック

---

## 🎯 次にやるべきこと

### Phase 6-3: Windowsビルド完了

#### ステップ1: ビルド完了確認

WSL2で以下のコマンドを実行:

```bash
# ビルドログ確認
tail -50 /tmp/windows-build.log

# .exeファイルの存在確認
ls -lh /home/muranaka-tenma/CocoFile/src-tauri/target/x86_64-pc-windows-gnu/release/ | grep "cocofile"
```

**期待される結果:**
```
-rwxr-xr-x 1 user user 15M Nov 5 12:00 cocofile.exe
```

#### ステップ2: .exeファイルをWindowsデスクトップにコピー

```bash
# Windowsユーザー名を確認
ls /mnt/c/Users/

# デスクトップにコピー（ユーザー名を適切に置き換える）
cp /home/muranaka-tenma/CocoFile/src-tauri/target/x86_64-pc-windows-gnu/release/cocofile.exe /mnt/c/Users/muranaka-tenma/Desktop/CocoFile.exe
```

#### ステップ3: Windows実機テスト

1. Windowsデスクトップの `CocoFile.exe` をダブルクリック
2. セキュリティ警告が出た場合:
   - 「詳細情報」をクリック
   - 「実行」をクリック

3. アプリが起動したら、`docs/WINDOWS_TEST_GUIDE.md` に従ってテスト

**重要な確認項目:**
- [ ] アプリが起動する
- [ ] ウィンドウが表示される（1200x800px）
- [ ] 5つの画面すべてにアクセスできる
- [ ] データベースが作成される
- [ ] フォルダスキャンが動作する
- [ ] 検索機能が動作する

---

## ⚠️ トラブルシューティング

### ビルドエラーが発生した場合

#### エラー1: linkerエラー

```
error: linker `x86_64-w64-mingw32-gcc` not found
```

**対処:**
```bash
sudo apt-get install -y mingw-w64
```

#### エラー2: Rustターゲットが見つからない

```
error: can't find crate for `std`
```

**対処:**
```bash
rustup target add x86_64-pc-windows-gnu
```

#### エラー3: .exeが起動しない（Windows側）

**原因:** Visual C++ Redistributableが不足

**対処:**
https://aka.ms/vs/17/release/vc_redist.x64.exe をダウンロードしてインストール

### ビルドがあまりにも遅い場合

クロスコンパイルは時間がかかります（10-20分）。

**代替案: Windows上でネイティブビルド**

Windows PowerShellで:
```powershell
cd \\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\frontend
npm run tauri:build
```

前提条件:
- Node.js がインストール済み
- Rust がインストール済み
- Visual Studio Build Tools がインストール済み

詳細: `docs/WINDOWS_BUILD_GUIDE.md`

---

## 📁 重要なファイルの場所

### ソースコード

```
/home/muranaka-tenma/CocoFile/
├── frontend/                    # フロントエンド
│   ├── src/
│   │   ├── components/         # UIコンポーネント
│   │   ├── screens/            # 画面（S-001〜S-005）
│   │   ├── services/           # API層
│   │   │   ├── TauriService.ts       # Tauri API統合
│   │   │   ├── RealFileService.ts    # ファイル操作
│   │   │   └── RealScanService.ts    # スキャン操作
│   │   ├── store/              # 状態管理（Zustand）
│   │   └── hooks/              # カスタムフック
│   └── package.json
├── src-tauri/                   # バックエンド（Rust）
│   ├── src/
│   │   ├── lib.rs              # メインエントリーポイント
│   │   ├── database.rs         # データベース操作
│   │   ├── tag_manager.rs      # タグ管理API
│   │   ├── favorite_manager.rs # お気に入り管理API
│   │   └── settings_manager.rs # 設定管理API
│   ├── Cargo.toml
│   └── tauri.conf.json
└── docs/                        # ドキュメント
    ├── PHASE5_FILE_ORGANIZATION_DESIGN.md
    ├── WINDOWS_BUILD_GUIDE.md
    ├── WINDOWS_TEST_GUIDE.md
    └── PHASE6_CONTINUATION_GUIDE.md  ← このファイル
```

### ビルド成果物

```
/home/muranaka-tenma/CocoFile/src-tauri/target/
├── release/
│   └── cocofile                      # Linux版実行ファイル
└── x86_64-pc-windows-gnu/
    └── release/
        └── cocofile.exe              # Windows版実行ファイル
```

### 設定ファイル

```
~/.cargo/config.toml                   # Cargoクロスコンパイル設定
/home/muranaka-tenma/CocoFile/CLAUDE.md  # プロジェクト設定
```

---

## 🚀 Phase 7: 次のステップ（実装待ち）

Phase 6のテストが完了したら、Phase 7に進みます。

### Phase 7-A: Phase 5機能の実装

**実装予定機能:**
1. ファイル整理支援機能（S-006画面）
2. クラウドストレージ対応
3. ファイル移動提案エンジン

**設計書:** `docs/PHASE5_FILE_ORGANIZATION_DESIGN.md`

**推定時間:** 12-15時間

### Phase 7-B: 最適化と改善

1. メモリ使用量の最適化
2. 検索速度の改善
3. UIの洗練

### Phase 7-C: 配布準備

1. .msiインストーラー作成
2. README更新
3. ユーザーマニュアル作成
4. リリースノート作成

---

## 💡 開発環境の再セットアップ

PC再起動後、開発を再開する手順:

### WSL2で開発する場合

```bash
# プロジェクトディレクトリに移動
cd /home/muranaka-tenma/CocoFile/frontend

# 開発サーバー起動（ブラウザでテスト）
npm run dev

# または、Tauriアプリとして起動
npm run tauri dev
```

### Windowsでビルドする場合

```powershell
# PowerShell を管理者として実行
cd \\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\frontend

# リリースビルド
npm run tauri:build
```

---

## 📊 プロジェクトの進捗

```yaml
進捗状況:
  Phase 1-4: MVP基本機能    ✅ 100%完了
  Phase 5: 新機能設計       ✅ 100%完了
  Phase 6: Windowsビルド    🔄 90%完了（テスト待ち）
  Phase 7: 次期機能実装     ⏳ 0%（待機中）

実装済み画面: 5/5 (100%)
実装済みAPI: 27/27 (100%)
テスト完了: 0/5画面 (0%)
```

---

## 🎯 Phase 6-4: 実機テスト手順

Windowsビルドが完了したら、以下の手順でテストを実行します。

### テストチェックリスト

#### 基本動作テスト
- [ ] アプリが起動する
- [ ] ウィンドウサイズが正しい（1200x800px）
- [ ] Dev Navigationパネルが表示される
- [ ] 5つのボタンすべてが表示される

#### S-001: メイン検索画面
- [ ] 画面が開く
- [ ] 検索ボックスが表示される
- [ ] キーワード入力ができる
- [ ] 検索結果が表示される（モックデータ）
- [ ] フィルターが動作する
- [ ] ファイルカードが表示される

#### S-002: 設定画面
- [ ] 画面が開く
- [ ] 監視フォルダリストが表示される
- [ ] 「フォルダを追加」ボタンをクリックできる
- [ ] フォルダ選択ダイアログが開く
- [ ] フォルダが追加される
- [ ] 除外設定が動作する
- [ ] 設定が保存される

#### S-003: スキャン・インデックス画面
- [ ] 画面が開く
- [ ] DB統計が表示される
- [ ] 「スキャン開始」ボタンが表示される
- [ ] フォルダパス入力ができる
- [ ] スキャンが開始される
- [ ] 進捗が表示される
- [ ] 完了後、統計が更新される

#### S-004: タグ管理画面
- [ ] 画面が開く
- [ ] タグ一覧が表示される（モックデータ）
- [ ] 「タグを作成」ボタンが動作する
- [ ] タグ作成ダイアログが開く
- [ ] 新しいタグが作成される
- [ ] タグの編集ができる
- [ ] タグの削除ができる

#### S-005: ファイル詳細モーダル
- [ ] メイン検索画面からファイルをクリック
- [ ] モーダルが開く
- [ ] ファイル情報が表示される
- [ ] タグの追加/削除ができる
- [ ] お気に入りの切り替えができる
- [ ] 「開く」ボタンが動作する

### バグ報告フォーマット

バグを見つけた場合:

```markdown
### バグ報告 #1

**日時:** 2025-11-05 XX:XX

**画面:** S-002 設定画面

**操作手順:**
1. 設定画面を開く
2. 「フォルダを追加」をクリック
3. フォルダを選択

**期待される動作:**
フォルダが一覧に追加される

**実際の動作:**
エラーメッセージが表示される: "Failed to add folder"

**環境:**
- OS: Windows 11 23H2
- CocoFile: v0.1.0
- ビルド方法: WSL2クロスコンパイル

**ログ:**
```
[エラーログをここに貼り付け]
```
```

---

## 🔧 よくある質問

### Q1: ビルドしたexeファイルが見つからない

**A:** 以下のコマンドで検索:
```bash
find /home/muranaka-tenma/CocoFile -name "*.exe" 2>/dev/null
```

### Q2: Windows版の動作が遅い

**A:** クロスコンパイル版は最適化が不十分な場合があります。Windows上でネイティブビルドすると改善される可能性があります。

### Q3: データベースファイルはどこに作られる？

**A:** Windows版の場合:
```
C:\Users\[YourUserName]\AppData\Local\com.cocofile.app\data\cocofile.db
```

### Q4: ログファイルはどこ？

**A:** Windows版の場合:
```
C:\Users\[YourUserName]\AppData\Local\com.cocofile.app\logs\cocofile.log
```

---

## 📝 メモ: 技術的な課題と解決策

### 解決済みの課題

#### 課題1: フロントエンドとバックエンドの型不一致
- **問題:** RustのAPIはsnake_caseだが、TypeScriptはcamelCase
- **解決:** `settingsStore.ts`に変換関数を実装
  - `convertFromTauri()` - Rust → TypeScript
  - `convertToTauri()` - TypeScript → Rust

#### 課題2: ブラウザ開発環境でTauri APIが使えない
- **問題:** `http://localhost:5173` で開くとinvokeが未定義
- **解決:** `isTauriEnvironment()` チェックを追加し、モックデータを返す

#### 課題3: Windows環境にNode.jsがない
- **問題:** Windows PowerShellで `npm: command not found`
- **解決:** WSL2でクロスコンパイルに切り替え（mingw-w64使用）

### 未解決の課題（Phase 7で対応）

#### 課題1: メモ機能のAPI未実装
- **現状:** フロントエンドにUIはあるが、バックエンドのAPI未実装
- **対応予定:** Phase 7でRust側に `update_memo` コマンドを追加

#### 課題2: .msiインストーラーの作成
- **現状:** .exeファイルのみ作成可能
- **制約:** WiX Toolsetが必要（Windows環境が必要）
- **対応予定:** Windows上でネイティブビルド時に作成

#### 課題3: Python解析エンジンのバンドル
- **現状:** Pythonスクリプトは存在するが未統合
- **対応予定:** PyInstallerでバイナリ化し、Tauriに統合

---

## 🎉 完了条件

Phase 6は以下の条件を満たせば完了です:

- [x] 18個の新APIがRustで実装されている
- [x] フロントエンドが実APIを使用している
- [x] モックサービスが削除されている
- [ ] Windows版.exeファイルが生成されている
- [ ] Windows実機で5画面すべてが動作確認できた
- [ ] 致命的なバグがない

---

**作成日:** 2025-11-05
**最終更新:** 2025-11-05
**次の作業:** Phase 6-3（Windowsビルド完了）→ Phase 6-4（実機テスト）→ Phase 7（新機能実装）
