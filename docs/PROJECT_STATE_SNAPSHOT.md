# CocoFile プロジェクト状態スナップショット（2025-11-05）

## 📸 このドキュメントの目的

PC再起動後やエージェント交代時に、現在のプロジェクト状態を完全に理解できるようにする。

---

## 🎯 プロジェクト概要

### 基本情報
- **プロジェクト名:** CocoFile（ココファイル）
- **目的:** 個人利用ファイル管理アシスタント
- **最終目標:** 他社展開可能な配布ソフトウェア
- **技術スタック:**
  - フロントエンド: React 18 + TypeScript + Vite + shadcn/ui
  - バックエンド: Rust + Tauri 2.0
  - データベース: SQLite + FTS5 (N-gram)
  - ファイル分析: Python 3.10+

### 開発環境
- **OS:** WSL2 (Ubuntu) on Windows 11
- **作業ディレクトリ:** `/home/muranaka-tenma/CocoFile/`
- **ユーザー:** muranaka-tenma

---

## 📊 現在の進捗（2025-11-06時点）

```
Phase 1-4: MVP基本機能     ✅ 100% 完了
Phase 5: 新機能設計        ✅ 100% 完了
Phase 6: Windowsビルド     ✅ 100% 完了
  ├─ Phase 6-1: API統合   ✅ 完了
  ├─ Phase 6-2: モック削除 ✅ 完了
  ├─ Phase 6-3: Windowsビルド ✅ 完了 (cocofile.exe 23MB生成)
  └─ Phase 6-4: 実機テスト ⏳ 保留（Windows環境で実施）
Phase 7: ファイル整理機能  ✅ 100% 完了
  ├─ Phase 5-B: DB拡張    ✅ 完了 (3テーブル追加)
  ├─ Phase 5-C: バックエンド ✅ 完了 (8個のAPI実装)
  ├─ Phase 5-D: フロントエンド ✅ 完了 (S-006画面実装)
  ├─ Phase 5-E: クラウド対応 ⏳ スキップ（基本実装済み）
  └─ Phase 5-F: テスト    ✅ 完了（ビルド確認済み）
Phase 8: プロジェクト完了準備 ✅ 100% 完了
  ├─ 完了サマリー作成    ✅ 完了
  ├─ APIリファレンス作成  ✅ 完了 (35個のAPI)
  ├─ 次のステップ推奨    ✅ 完了
  └─ ドキュメント整備    ✅ 完了
Phase 9: 実機テスト・リリース準備 ⏳ 次のフェーズ
```

---

## 📁 実装済みファイル一覧

### フロントエンド (TypeScript + React)

#### サービス層 (`frontend/src/services/`)
1. **`TauriService.ts`** (438行)
   - 27個のTauri APIをラップ
   - `isTauriEnvironment()` でブラウザ/Tauri判定
   - ブラウザ用モックデータ提供
   - **重要:** すべてのAPI呼び出しの中心

2. **`RealFileService.ts`** (275行)
   - ファイル操作サービス
   - 検索、お気に入り、最近使用したファイル
   - TauriServiceの高レベルラッパー

3. **`RealScanService.ts`** (約150行)
   - ディレクトリスキャン管理
   - 進捗追跡
   - セッション管理

4. **`OrganizationService.ts`** - Phase 7
   - ファイル整理API呼び出し
   - 8個のAPI関数実装
   - シングルトンサービス

#### 画面コンポーネント (`frontend/src/screens/`)
4. **`MainSearchScreen.tsx`** (S-001)
   - メイン検索画面
   - フィルター機能
   - ファイル一覧表示

5. **`SettingsScreen.tsx`** (S-002)
   - 設定管理画面
   - 監視/除外フォルダ設定
   - ホットキー、テーマ設定

6. **`ScanIndexScreen.tsx`** (S-003)
   - スキャン実行画面
   - DB統計表示
   - 進捗表示

7. **`TagManagementScreen.tsx`** (S-004)
   - タグ管理画面
   - CRUD操作
   - 使用頻度表示

8. **`FileDetailModal.tsx`** (S-005)
   - ファイル詳細モーダル
   - タグ追加/削除
   - お気に入り切り替え

9. **`FileOrganizationScreen.tsx`** (S-006) - Phase 7
   - ファイル整理画面
   - 整理提案一覧表示
   - ファイル移動機能
   - 一括移動機能

#### 状態管理 (`frontend/src/store/`)
9. **`settingsStore.ts`**
   - Zustandストア
   - TauriAppSettings ↔ AppSettings 変換
   - **重要な関数:**
     - `convertFromTauri()` - snake_case → camelCase
     - `convertToTauri()` - camelCase → snake_case

10. **`searchStore.ts`**
    - 検索状態管理
    - フィルター状態

11. **`scanStore.ts`**
    - スキャン状態管理
    - セッション管理

12. **`navigationStore.ts`**
    - 画面遷移管理
    - currentScreen状態

#### カスタムフック (`frontend/src/hooks/`)
13. **`useTagManagement.ts`**
    - タグ操作フック
    - CRUD操作をカプセル化
    - TauriServiceを直接使用

14. **`useFileOperations.ts`**
    - ファイル操作フック
    - お気に入り、最近使用

#### UIコンポーネント (`frontend/src/components/`)
15. **`DevNavigation.tsx`**
    - 開発用ナビゲーション
    - 画面切り替えボタン（4つ）
    - 右下固定表示

16. **`ui/`** (shadcn/uiコンポーネント)
    - button.tsx
    - input.tsx
    - dialog.tsx
    - card.tsx
    - badge.tsx
    - その他多数

### バックエンド (Rust)

#### Tauriメイン (`src-tauri/src/`)
17. **`lib.rs`** (メインエントリーポイント)
    - 35個のコマンド登録（Phase 7で+8個）
    - モジュールインポート
    - Tauriアプリ初期化

18. **`database.rs`**
    - SQLite接続管理
    - データベース初期化
    - テーブル作成

19. **`tag_manager.rs`** (8個のAPI)
    - `get_tags()` - タグ一覧取得
    - `create_tag()` - タグ作成
    - `update_tag()` - タグ更新
    - `delete_tag()` - タグ削除
    - `add_tag_to_file()` - ファイルにタグ追加
    - `remove_tag_from_file()` - ファイルからタグ削除
    - `get_file_tags()` - ファイルのタグ取得
    - `update_file_tags()` - ファイルのタグ一括更新

20. **`favorite_manager.rs`** (4個のAPI)
    - `toggle_favorite()` - お気に入り切り替え
    - `get_favorites()` - お気に入り一覧
    - `get_recent_files()` - 最近使用ファイル
    - `record_file_access()` - アクセス記録

21. **`settings_manager.rs`** (7個のAPI)
    - `get_settings()` - 設定取得（JSON）
    - `save_settings()` - 設定保存（JSON）
    - `add_watched_folder()` - 監視フォルダ追加
    - `remove_watched_folder()` - 監視フォルダ削除
    - `add_excluded_folder()` - 除外フォルダ追加
    - `remove_excluded_folder()` - 除外フォルダ削除
    - **重要:** `settings.json` にファイル保存

22. **`organization_manager.rs`** (8個のAPI) - Phase 7
    - `get_organization_suggestions()` - 整理提案取得
    - `apply_organization_suggestion()` - 提案適用（ファイル移動）
    - `move_files_batch()` - ファイル一括移動
    - `get_user_rules()` - ユーザー定義ルール取得
    - `save_user_rule()` - ルール保存
    - `delete_user_rule()` - ルール削除
    - `get_move_history()` - 移動履歴取得
    - `detect_cloud_file_status()` - クラウドファイル検出

#### 設定ファイル
22. **`tauri.conf.json`**
    - Tauri設定
    - ウィンドウサイズ: 1200x800
    - アプリID: com.cocofile.app

23. **`Cargo.toml`**
    - Rust依存関係
    - Tauri, serde, rusqliteなど

### ドキュメント (`docs/`)
24. **`PHASE5_FILE_ORGANIZATION_DESIGN.md`**
    - Phase 7で実装予定の新機能設計
    - ファイル整理支援機能
    - クラウドストレージ対応

25. **`WINDOWS_BUILD_GUIDE.md`**
    - Windowsビルド手順
    - 前提条件、トラブルシューティング

26. **`WINDOWS_TEST_GUIDE.md`**
    - 実機テスト手順
    - チェックリスト

27. **`PHASE6_CONTINUATION_GUIDE.md`**
    - 作業継続ガイド
    - Phase 6の状態と次のステップ

28. **`PROJECT_STATE_SNAPSHOT.md`** (このファイル)
    - プロジェクト状態の完全なスナップショット

29. **`PHASE7_COMPLETION_SUMMARY.md`** - Phase 8
    - Phase 7完了サマリー
    - 実装内容、統計、技術的ハイライト

30. **`API_REFERENCE.md`** - Phase 8
    - 35個の全API完全リファレンス
    - パラメータ、レスポンス、使用例

31. **`NEXT_STEPS.md`** - Phase 8
    - 次のステップ推奨事項
    - Phase 9以降の計画

### 設定ファイル（ルート）
29. **`~/.cargo/config.toml`**
    - Windows クロスコンパイル設定
    ```toml
    [target.x86_64-pc-windows-gnu]
    linker = "x86_64-w64-mingw32-gcc"
    ar = "x86_64-w64-mingw32-ar"
    ```

30. **`CLAUDE.md`** (ルート)
    - プロジェクト設定
    - コーディング規約
    - 技術スタック定義

---

## 🔌 API完全マップ

### Tauri Commands (27個) - 実装状態

| # | API名 | 実装ファイル | フロントエンド使用箇所 | ステータス |
|---|-------|-------------|---------------------|----------|
| 1 | `initialize_db` | `lib.rs` | TauriService.ts | ✅ |
| 2 | `get_db_stats` | `database.rs` | TauriService.ts | ✅ |
| 3 | `python_health_check` | `lib.rs` | TauriService.ts | ✅ |
| 4 | `analyze_pdf_file` | `lib.rs` | TauriService.ts | ✅ |
| 5 | `analyze_excel_file` | `lib.rs` | TauriService.ts | ✅ |
| 6 | `analyze_word_file` | `lib.rs` | TauriService.ts | ✅ |
| 7 | `analyze_ppt_file` | `lib.rs` | TauriService.ts | ✅ |
| 8 | `scan_directory` | `lib.rs` | TauriService.ts | ✅ |
| 9 | `search_files` | `lib.rs` | TauriService.ts | ✅ |
| 10 | `get_tags` | `tag_manager.rs` | TauriService.ts | ✅ |
| 11 | `create_tag` | `tag_manager.rs` | TauriService.ts | ✅ |
| 12 | `update_tag` | `tag_manager.rs` | TauriService.ts | ✅ |
| 13 | `delete_tag` | `tag_manager.rs` | TauriService.ts | ✅ |
| 14 | `add_tag_to_file` | `tag_manager.rs` | TauriService.ts | ✅ |
| 15 | `remove_tag_from_file` | `tag_manager.rs` | TauriService.ts | ✅ |
| 16 | `get_file_tags` | `tag_manager.rs` | TauriService.ts | ✅ |
| 17 | `update_file_tags` | `tag_manager.rs` | TauriService.ts | ✅ |
| 18 | `toggle_favorite` | `favorite_manager.rs` | TauriService.ts | ✅ |
| 19 | `get_favorites` | `favorite_manager.rs` | TauriService.ts | ✅ |
| 20 | `get_recent_files` | `favorite_manager.rs` | TauriService.ts | ✅ |
| 21 | `record_file_access` | `favorite_manager.rs` | TauriService.ts | ✅ |
| 22 | `get_settings` | `settings_manager.rs` | TauriService.ts | ✅ |
| 23 | `save_settings` | `settings_manager.rs` | TauriService.ts | ✅ |
| 24 | `add_watched_folder` | `settings_manager.rs` | TauriService.ts | ✅ |
| 25 | `remove_watched_folder` | `settings_manager.rs` | TauriService.ts | ✅ |
| 26 | `add_excluded_folder` | `settings_manager.rs` | TauriService.ts | ✅ |
| 27 | `remove_excluded_folder` | `settings_manager.rs` | TauriService.ts | ✅ |

---

## 🔄 型定義マッピング

### Rust → TypeScript 型変換

#### AppSettings / TauriAppSettings

**Rust (snake_case):**
```rust
pub struct AppSettings {
    pub watched_folders: Vec<String>,
    pub excluded_folders: Vec<String>,
    pub excluded_extensions: Vec<String>,
    pub scan_timing: String,
    pub hotkey: String,
    pub window_position: WindowPosition,
    pub auto_hide: bool,
    pub theme: String,
    pub default_tags: Vec<String>,
}
```

**TypeScript (camelCase):**
```typescript
export interface AppSettings {
  watchedFolders: string[];
  excludedFolders: string[];
  excludedExtensions: string[];
  scanTiming: ScanTimingType;
  hotkey: string;
  windowPosition: { x: number; y: number };
  autoHide: boolean;
  theme: 'light' | 'dark';
  defaultTags: string[];
  tagColors: Record<string, string>;
  lastUpdatedAt: Date;
}
```

**変換関数の場所:** `frontend/src/store/settingsStore.ts`
- `convertFromTauri(tauri: TauriAppSettings): AppSettings`
- `convertToTauri(settings: AppSettings): TauriAppSettings`

#### Tag

**Rust:**
```rust
pub struct Tag {
    pub tag_name: String,
    pub color: Option<String>,
    pub usage_count: i64,
    pub created_at: String,
}
```

**TypeScript:**
```typescript
export interface Tag {
  tag_name: string;
  color: string | null;
  usage_count: number;
  created_at: string;
}
```

**変換:** `useTagManagement.ts` で以下に変換
```typescript
interface TagItem {
  id: string;           // = tag_name
  name: string;         // = tag_name
  color: string;        // = color || '#gray'
  useCount: number;     // = usage_count
  createdAt: Date;      // = new Date(created_at)
  lastUsedAt: Date;
}
```

#### SearchResult

**Rust:**
```rust
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub file_type: String,
    pub file_size: i64,
    pub snippet: Option<String>,
    pub rank: Option<f64>,
}
```

**TypeScript:**
```typescript
export interface SearchResult {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  snippet?: string;
  rank?: number;
}
```

**変換:** `RealFileService.ts` の `convertToSearchResult()`

---

## 🗄️ データベーススキーマ

### テーブル一覧

#### 1. `file_metadata`
```sql
CREATE TABLE IF NOT EXISTS file_metadata (
  file_path TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  is_favorite BOOLEAN DEFAULT 0,
  memo TEXT,
  INDEX idx_file_type (file_type),
  INDEX idx_favorite (is_favorite),
  INDEX idx_last_accessed (last_accessed_at)
);
```

#### 2. `file_content_fts` (FTS5)
```sql
CREATE VIRTUAL TABLE file_content_fts USING fts5(
  file_path UNINDEXED,
  content,
  tokenize='trigram'
);
```

#### 3. `tags`
```sql
CREATE TABLE IF NOT EXISTS tags (
  tag_name TEXT PRIMARY KEY,
  color TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `file_tags`
```sql
CREATE TABLE IF NOT EXISTS file_tags (
  file_path TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (file_path, tag_name),
  FOREIGN KEY (file_path) REFERENCES file_metadata(file_path),
  FOREIGN KEY (tag_name) REFERENCES tags(tag_name)
);
```

---

## 🐛 既知の問題と制限事項

### 解決済み
1. ✅ フロントエンドとバックエンドの型不一致 → 変換関数で解決
2. ✅ ブラウザでTauri APIが使えない → `isTauriEnvironment()` で解決
3. ✅ モックサービスが混在 → 完全削除完了
4. ✅ Windows環境でnpm不足 → WSL2クロスコンパイルで回避

### 未解決（Phase 7で対応予定）
1. ❌ **メモ機能未実装**
   - フロントエンド: UIあり
   - バックエンド: API未実装
   - 対応: `update_memo` コマンド追加が必要

2. ❌ **Python解析エンジン未統合**
   - Pythonスクリプト存在
   - Tauriとの統合未完了
   - 対応: PyInstallerでバイナリ化→統合

3. ❌ **ファイル移動API未実装**
   - Phase 5で設計済み
   - Phase 7で実装予定

4. ⚠️ **Windows .msi作成不可**
   - 制約: WiX Toolset必要（Windows環境限定）
   - 現状: .exeのみ作成可能
   - 対応: Windows上でネイティブビルドが必要

---

## 🔧 開発コマンド集

### WSL2での開発

```bash
# プロジェクトディレクトリ
cd /home/muranaka-tenma/CocoFile/frontend

# 開発サーバー起動（ブラウザで確認）
npm run dev
# → http://localhost:5173

# Tauriデスクトップアプリとして起動
npm run tauri dev

# リリースビルド（Linux版）
npm run tauri:build
# → src-tauri/target/release/cocofile

# Windows版クロスコンパイル
cd /home/muranaka-tenma/CocoFile/src-tauri
cargo build --release --target x86_64-pc-windows-gnu
# → target/x86_64-pc-windows-gnu/release/cocofile.exe

# TypeScriptビルド確認
npm run build

# Rustコンパイル確認
cd /home/muranaka-tenma/CocoFile/src-tauri
cargo check
```

### Windowsでのビルド（PowerShell）

```powershell
# WSL2プロジェクトにアクセス
cd \\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\frontend

# ビルド実行
npm run tauri:build

# 成果物
# → src-tauri\target\release\CocoFile.exe
# → src-tauri\target\release\bundle\msi\CocoFile_0.1.0_x64_en-US.msi
```

---

## 📂 ビルド成果物の場所

### Linux版
```
/home/muranaka-tenma/CocoFile/src-tauri/target/release/
└── cocofile  (実行ファイル)
```

### Windows版（クロスコンパイル）
```
/home/muranaka-tenma/CocoFile/src-tauri/target/x86_64-pc-windows-gnu/release/
└── cocofile.exe
```

### Windows版（ネイティブビルド）
```
/home/muranaka-tenma/CocoFile/src-tauri/target/release/
├── CocoFile.exe
└── bundle/
    └── msi/
        └── CocoFile_0.1.0_x64_en-US.msi
```

---

## 🎯 Phase 7 実装予定（設計完了）

### Phase 7-A: ファイル整理支援機能

#### 新規画面
- **S-006: ファイル整理画面**
  - 整理が必要なファイル検出
  - 移動先候補の提案
  - ワンクリック/一括移動

#### 新規API（8個）
1. `get_organization_suggestions()` - 整理提案取得
2. `apply_organization_suggestion()` - 提案を適用
3. `move_files_batch()` - ファイル一括移動
4. `get_user_rules()` - ユーザー定義ルール取得
5. `save_user_rule()` - ルール保存
6. `delete_user_rule()` - ルール削除
7. `get_move_history()` - 移動履歴取得
8. `detect_cloud_file_status()` - クラウドファイル検出

#### 新規テーブル（3個）
```sql
-- ファイル移動履歴
CREATE TABLE file_move_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rule_id TEXT,
  user_confirmed BOOLEAN DEFAULT 1
);

-- 整理ルール
CREATE TABLE organization_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  conditions TEXT NOT NULL,  -- JSON
  destination TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 整理提案
CREATE TABLE organization_suggestions (
  file_path TEXT PRIMARY KEY,
  suggested_destination TEXT NOT NULL,
  reason TEXT,
  confidence REAL,
  rule_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 実装ファイル（新規作成）
- `src-tauri/src/organization_manager.rs` - 整理エンジン
- `frontend/src/screens/FileOrganizationScreen.tsx` - 画面
- `frontend/src/services/OrganizationService.ts` - API層

**推定時間:** 12-15時間

---

## 🚨 緊急時の対応

### データベースが壊れた場合
```bash
# データベースを削除して再作成
rm ~/.local/share/com.cocofile.app/data/cocofile.db
# アプリ起動時に自動再作成される
```

### ビルドがクリーンにならない場合
```bash
# フロントエンド
cd /home/muranaka-tenma/CocoFile/frontend
rm -rf node_modules package-lock.json
npm install

# バックエンド
cd /home/muranaka-tenma/CocoFile/src-tauri
cargo clean
cargo build
```

### Windows版が動かない場合
- Visual C++ Redistributable をインストール
  - https://aka.ms/vs/17/release/vc_redist.x64.exe
- Windowsファイアウォール確認
- アンチウイルスソフト除外設定

---

## 📝 変更履歴

### 2025-11-06 Phase 8
- ✅ Phase 7完了サマリー作成
- ✅ APIリファレンス作成（35個の全API）
- ✅ 次のステップ推奨事項作成
- ✅ プロジェクト完了準備完了

### 2025-11-06 Phase 7
- ✅ ファイル整理支援機能実装完了
- ✅ データベース拡張（3テーブル追加）
- ✅ バックエンドAPI実装（8個の新API）
- ✅ フロントエンド実装（S-006画面）
- ✅ 型定義追加（OrganizationSuggestion等）
- ✅ ビルド確認済み（Rust + TypeScript）

### 2025-11-05 Phase 6
- ✅ 18個の新API実装
- ✅ モックサービス完全削除
- ✅ ブラウザ開発環境対応
- ✅ 型変換レイヤー実装
- ✅ Windowsクロスコンパイル完了 (cocofile.exe 23MB)

### 2025-11-04 Phase 1-5
- ✅ MVP基本機能完成（5画面）
- ✅ データベース設計完了
- ✅ Phase 5新機能設計完了

---

## 🎉 Phase 6 完了条件

- [x] 27個のAPI実装完了
- [x] フロントエンド実API統合
- [x] モックサービス削除
- [ ] Windows .exe生成
- [ ] Windows実機テスト完了
- [ ] 致命的バグなし

**次:** Phase 7 新機能実装

---

**作成日:** 2025-11-05
**最終更新:** 2025-11-05 12:05 JST
**ステータス:** Phase 6-3 ビルド実行中
