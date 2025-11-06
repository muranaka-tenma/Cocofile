# CocoFile API リファレンス

**バージョン**: 0.2.0
**最終更新**: 2025年11月6日

このドキュメントは、CocoFileのTauri Command APIの完全なリファレンスです。

---

## 📚 目次

1. [データベース管理](#1-データベース管理)
2. [ファイルスキャン・検索](#2-ファイルスキャン検索)
3. [タグ管理](#3-タグ管理)
4. [お気に入り管理](#4-お気に入り管理)
5. [設定管理](#5-設定管理)
6. [ファイル整理（Phase 7）](#6-ファイル整理phase-7)
7. [Python分析エンジン](#7-python分析エンジン)

---

## 1. データベース管理

### 1.1 `initialize_db`

データベースを初期化します。アプリ起動時に自動実行されます。

**シグネチャ:**
```rust
fn initialize_db(app: tauri::AppHandle) -> Result<String, String>
```

**TypeScript:**
```typescript
invoke('initialize_db'): Promise<string>
```

**レスポンス:**
```json
"Database initialized at: /path/to/cocofile.db"
```

---

### 1.2 `get_db_stats`

データベースの統計情報を取得します。

**シグネチャ:**
```rust
fn get_db_stats(app: tauri::AppHandle) -> Result<DatabaseStats, String>
```

**TypeScript:**
```typescript
invoke<DatabaseStats>('get_db_stats'): Promise<DatabaseStats>
```

**レスポンス:**
```json
{
  "total_files": 1234,
  "total_tags": 56,
  "db_size_bytes": 10485760
}
```

---

## 2. ファイルスキャン・検索

### 2.1 `scan_directory`

ディレクトリをスキャンしてファイルをインデックス化します。

**シグネチャ:**
```rust
fn scan_directory(
    app: tauri::AppHandle,
    folder_path: String
) -> Result<String, String>
```

**TypeScript:**
```typescript
invoke('scan_directory', { folderPath: string }): Promise<string>
```

**パラメータ:**
- `folderPath`: スキャン対象ディレクトリの絶対パス

**レスポンス:**
```json
"Scan completed: 123 files processed"
```

---

### 2.2 `search_files`

ファイルを検索します。

**シグネチャ:**
```rust
fn search_files(
    app: tauri::AppHandle,
    keyword: String,
    file_types: Vec<String>,
    tags: Vec<String>
) -> Result<Vec<SearchResult>, String>
```

**TypeScript:**
```typescript
invoke<SearchResult[]>('search_files', {
  keyword: string,
  fileTypes: string[],
  tags: string[]
}): Promise<SearchResult[]>
```

**パラメータ:**
- `keyword`: 検索キーワード
- `fileTypes`: ファイルタイプフィルター（例: `["pdf", "excel"]`）
- `tags`: タグフィルター（例: `["重要", "レポート"]`）

**レスポンス:**
```json
[
  {
    "file_path": "/path/to/file.pdf",
    "file_name": "report.pdf",
    "file_type": "pdf",
    "file_size": 1048576,
    "snippet": "検索結果のスニペット...",
    "rank": 0.95
  }
]
```

---

## 3. タグ管理

### 3.1 `get_tags`

すべてのタグを取得します。

**シグネチャ:**
```rust
fn get_tags(app: tauri::AppHandle) -> Result<Vec<Tag>, String>
```

**TypeScript:**
```typescript
invoke<Tag[]>('get_tags'): Promise<Tag[]>
```

**レスポンス:**
```json
[
  {
    "tag_name": "重要",
    "color": "#ff0000",
    "usage_count": 42,
    "created_at": "2025-11-06T12:00:00+09:00"
  }
]
```

---

### 3.2 `create_tag`

新しいタグを作成します。

**シグネチャ:**
```rust
fn create_tag(
    app: tauri::AppHandle,
    tag_name: String,
    color: Option<String>
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('create_tag', {
  tagName: string,
  color?: string
}): Promise<void>
```

**パラメータ:**
- `tagName`: タグ名
- `color`: タグの色（オプション、例: `"#ff0000"`）

---

### 3.3 `update_tag`

タグを更新します。

**シグネチャ:**
```rust
fn update_tag(
    app: tauri::AppHandle,
    tag_name: String,
    color: Option<String>
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('update_tag', {
  tagName: string,
  color?: string
}): Promise<void>
```

---

### 3.4 `delete_tag`

タグを削除します。

**シグネチャ:**
```rust
fn delete_tag(
    app: tauri::AppHandle,
    tag_name: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('delete_tag', { tagName: string }): Promise<void>
```

---

### 3.5 `add_tag_to_file`

ファイルにタグを追加します。

**シグネチャ:**
```rust
fn add_tag_to_file(
    app: tauri::AppHandle,
    file_path: String,
    tag_name: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('add_tag_to_file', {
  filePath: string,
  tagName: string
}): Promise<void>
```

---

### 3.6 `remove_tag_from_file`

ファイルからタグを削除します。

**シグネチャ:**
```rust
fn remove_tag_from_file(
    app: tauri::AppHandle,
    file_path: String,
    tag_name: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('remove_tag_from_file', {
  filePath: string,
  tagName: string
}): Promise<void>
```

---

### 3.7 `get_file_tags`

ファイルのタグ一覧を取得します。

**シグネチャ:**
```rust
fn get_file_tags(
    app: tauri::AppHandle,
    file_path: String
) -> Result<Vec<String>, String>
```

**TypeScript:**
```typescript
invoke<string[]>('get_file_tags', {
  filePath: string
}): Promise<string[]>
```

**レスポンス:**
```json
["重要", "レポート", "2025年"]
```

---

### 3.8 `update_file_tags`

ファイルのタグを一括更新します。

**シグネチャ:**
```rust
fn update_file_tags(
    app: tauri::AppHandle,
    file_path: String,
    tags: Vec<String>
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('update_file_tags', {
  filePath: string,
  tags: string[]
}): Promise<void>
```

---

## 4. お気に入り管理

### 4.1 `toggle_favorite`

ファイルのお気に入り状態を切り替えます。

**シグネチャ:**
```rust
fn toggle_favorite(
    app: tauri::AppHandle,
    file_path: String
) -> Result<bool, String>
```

**TypeScript:**
```typescript
invoke<boolean>('toggle_favorite', {
  filePath: string
}): Promise<boolean>
```

**レスポンス:**
```json
true  // 新しいお気に入り状態
```

---

### 4.2 `get_favorites`

お気に入りファイル一覧を取得します。

**シグネチャ:**
```rust
fn get_favorites(
    app: tauri::AppHandle
) -> Result<Vec<SearchResult>, String>
```

**TypeScript:**
```typescript
invoke<SearchResult[]>('get_favorites'): Promise<SearchResult[]>
```

---

### 4.3 `get_recent_files`

最近使用したファイル一覧を取得します。

**シグネチャ:**
```rust
fn get_recent_files(
    app: tauri::AppHandle
) -> Result<Vec<SearchResult>, String>
```

**TypeScript:**
```typescript
invoke<SearchResult[]>('get_recent_files'): Promise<SearchResult[]>
```

---

### 4.4 `record_file_access`

ファイルのアクセス記録を更新します。

**シグネチャ:**
```rust
fn record_file_access(
    app: tauri::AppHandle,
    file_path: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('record_file_access', {
  filePath: string
}): Promise<void>
```

---

## 5. 設定管理

### 5.1 `get_settings`

アプリケーション設定を取得します。

**シグネチャ:**
```rust
fn get_settings(
    app: tauri::AppHandle
) -> Result<AppSettings, String>
```

**TypeScript:**
```typescript
invoke<AppSettings>('get_settings'): Promise<AppSettings>
```

**レスポンス:**
```json
{
  "watched_folders": ["/path/to/folder1", "/path/to/folder2"],
  "excluded_folders": ["/path/to/excluded"],
  "excluded_extensions": [".tmp", ".log"],
  "scan_timing": "realtime",
  "hotkey": "Ctrl+Shift+F",
  "window_position": { "x": 100, "y": 100 },
  "auto_hide": true,
  "theme": "light",
  "default_tags": ["重要"]
}
```

---

### 5.2 `save_settings`

アプリケーション設定を保存します。

**シグネチャ:**
```rust
fn save_settings(
    app: tauri::AppHandle,
    settings: AppSettings
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('save_settings', {
  settings: AppSettings
}): Promise<void>
```

---

### 5.3 `add_watched_folder`

監視フォルダを追加します。

**シグネチャ:**
```rust
fn add_watched_folder(
    app: tauri::AppHandle,
    folder_path: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('add_watched_folder', {
  folderPath: string
}): Promise<void>
```

---

### 5.4 `remove_watched_folder`

監視フォルダを削除します。

**シグネチャ:**
```rust
fn remove_watched_folder(
    app: tauri::AppHandle,
    folder_path: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('remove_watched_folder', {
  folderPath: string
}): Promise<void>
```

---

### 5.5 `add_excluded_folder`

除外フォルダを追加します。

**シグネチャ:**
```rust
fn add_excluded_folder(
    app: tauri::AppHandle,
    folder_path: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('add_excluded_folder', {
  folderPath: string
}): Promise<void>
```

---

### 5.6 `remove_excluded_folder`

除外フォルダを削除します。

**シグネチャ:**
```rust
fn remove_excluded_folder(
    app: tauri::AppHandle,
    folder_path: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('remove_excluded_folder', {
  folderPath: string
}): Promise<void>
```

---

## 6. ファイル整理（Phase 7）

### 6.1 `get_organization_suggestions`

整理が必要なファイルの提案を取得します。

**シグネチャ:**
```rust
fn get_organization_suggestions(
    app: tauri::AppHandle
) -> Result<Vec<OrganizationSuggestion>, String>
```

**TypeScript:**
```typescript
invoke<OrganizationSuggestion[]>(
  'get_organization_suggestions'
): Promise<OrganizationSuggestion[]>
```

**レスポンス:**
```json
[
  {
    "file_path": "C:/Users/User/Desktop/report.pdf",
    "file_name": "report.pdf",
    "current_location": "C:/Users/User/Desktop",
    "suggested_destination": "C:/Users/User/Documents/Reports",
    "reason": "PDFレポートファイル",
    "confidence": 0.9,
    "rule_id": null
  }
]
```

---

### 6.2 `apply_organization_suggestion`

単一ファイルを提案先に移動します。

**シグネチャ:**
```rust
fn apply_organization_suggestion(
    app: tauri::AppHandle,
    file_path: String,
    destination: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('apply_organization_suggestion', {
  filePath: string,
  destination: string
}): Promise<void>
```

**パラメータ:**
- `filePath`: 移動元ファイルパス
- `destination`: 移動先ファイルパス

**動作:**
1. ファイルを移動
2. 移動履歴をDBに保存
3. ファイルメタデータを更新

---

### 6.3 `move_files_batch`

複数のファイルを一括移動します。

**シグネチャ:**
```rust
fn move_files_batch(
    app: tauri::AppHandle,
    moves: Vec<FileMove>
) -> Result<BatchMoveResult, String>
```

**TypeScript:**
```typescript
invoke<BatchMoveResult>('move_files_batch', {
  moves: FileMove[]
}): Promise<BatchMoveResult>
```

**パラメータ:**
```typescript
interface FileMove {
  source: string;
  destination: string;
}
```

**レスポンス:**
```json
{
  "success_count": 8,
  "failed_count": 2,
  "errors": [
    "file1.txt: File not found",
    "file2.txt: Permission denied"
  ]
}
```

---

### 6.4 `get_user_rules`

ユーザー定義の整理ルール一覧を取得します。

**シグネチャ:**
```rust
fn get_user_rules(
    app: tauri::AppHandle
) -> Result<Vec<OrganizationRule>, String>
```

**TypeScript:**
```typescript
invoke<OrganizationRule[]>(
  'get_user_rules'
): Promise<OrganizationRule[]>
```

**レスポンス:**
```json
[
  {
    "id": "rule-001",
    "name": "PDFレポート整理",
    "conditions": "{\"file_type\":\"pdf\",\"name_pattern\":\"report\"}",
    "destination": "C:/Users/User/Documents/Reports",
    "priority": 10,
    "enabled": true,
    "created_at": "2025-11-06T12:00:00+09:00",
    "updated_at": "2025-11-06T12:00:00+09:00"
  }
]
```

---

### 6.5 `save_user_rule`

ユーザー定義ルールを保存（新規作成または更新）します。

**シグネチャ:**
```rust
fn save_user_rule(
    app: tauri::AppHandle,
    rule: OrganizationRule
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('save_user_rule', {
  rule: OrganizationRule
}): Promise<void>
```

---

### 6.6 `delete_user_rule`

ユーザー定義ルールを削除します。

**シグネチャ:**
```rust
fn delete_user_rule(
    app: tauri::AppHandle,
    rule_id: String
) -> Result<(), String>
```

**TypeScript:**
```typescript
invoke('delete_user_rule', {
  ruleId: string
}): Promise<void>
```

---

### 6.7 `get_move_history`

ファイル移動履歴を取得します。

**シグネチャ:**
```rust
fn get_move_history(
    app: tauri::AppHandle,
    limit: Option<usize>
) -> Result<Vec<MoveHistoryEntry>, String>
```

**TypeScript:**
```typescript
invoke<MoveHistoryEntry[]>('get_move_history', {
  limit?: number
}): Promise<MoveHistoryEntry[]>
```

**パラメータ:**
- `limit`: 取得件数（デフォルト: 100）

**レスポンス:**
```json
[
  {
    "id": 1,
    "original_path": "C:/Users/User/Desktop/file.pdf",
    "destination_path": "C:/Users/User/Documents/Reports/file.pdf",
    "moved_at": "2025-11-06T12:30:00+09:00",
    "rule_id": "rule-001",
    "user_confirmed": true
  }
]
```

---

### 6.8 `detect_cloud_file_status`

クラウドファイルのステータスを検出します。

**シグネチャ:**
```rust
fn detect_cloud_file_status(
    file_path: String
) -> Result<CloudFileStatus, String>
```

**TypeScript:**
```typescript
invoke<CloudFileStatus>('detect_cloud_file_status', {
  filePath: string
}): Promise<CloudFileStatus>
```

**レスポンス:**
```json
{
  "is_cloud_file": true,
  "provider": "OneDrive",
  "sync_status": "Synced",
  "local_path": "C:/Users/User/OneDrive/Documents/file.pdf",
  "cloud_path": "C:/Users/User/OneDrive/Documents/file.pdf"
}
```

**プロバイダー:**
- `"OneDrive"` - Microsoft OneDrive
- `"GoogleDrive"` - Google Drive
- `"Dropbox"` - Dropbox

**同期ステータス:**
- `"Synced"` - 同期済み
- `"Syncing"` - 同期中
- `"OnlineOnly"` - オンラインのみ
- `"Unknown"` - 不明

---

## 7. Python分析エンジン

### 7.1 `python_health_check`

Python分析エンジンのヘルスチェックを行います。

**シグネチャ:**
```rust
fn python_health_check() -> Result<String, String>
```

**TypeScript:**
```typescript
invoke('python_health_check'): Promise<string>
```

**レスポンス:**
```json
"Python bridge is healthy"
```

---

### 7.2 `analyze_pdf_file`

PDFファイルを分析します。

**シグネチャ:**
```rust
fn analyze_pdf_file(
    file_path: String
) -> Result<AnalyzeResult, String>
```

**TypeScript:**
```typescript
invoke<AnalyzeResult>('analyze_pdf_file', {
  filePath: string
}): Promise<AnalyzeResult>
```

**レスポンス:**
```json
{
  "text_content": "抽出されたテキスト...",
  "page_count": 10,
  "file_size": 1048576,
  "success": true
}
```

---

### 7.3 `analyze_excel_file`

Excelファイルを分析します。

**シグネチャ:**
```rust
fn analyze_excel_file(
    file_path: String
) -> Result<AnalyzeResult, String>
```

**TypeScript:**
```typescript
invoke<AnalyzeResult>('analyze_excel_file', {
  filePath: string
}): Promise<AnalyzeResult>
```

---

### 7.4 `analyze_word_file`

Wordファイルを分析します。

**シグネチャ:**
```rust
fn analyze_word_file(
    file_path: String
) -> Result<AnalyzeResult, String>
```

**TypeScript:**
```typescript
invoke<AnalyzeResult>('analyze_word_file', {
  filePath: string
}): Promise<AnalyzeResult>
```

---

### 7.5 `analyze_ppt_file`

PowerPointファイルを分析します。

**シグネチャ:**
```rust
fn analyze_ppt_file(
    file_path: String
) -> Result<AnalyzeResult, String>
```

**TypeScript:**
```typescript
invoke<AnalyzeResult>('analyze_ppt_file', {
  filePath: string
}): Promise<AnalyzeResult>
```

---

## 📊 API統計

| カテゴリ | API数 |
|---------|------|
| データベース管理 | 2個 |
| ファイルスキャン・検索 | 2個 |
| タグ管理 | 8個 |
| お気に入り管理 | 4個 |
| 設定管理 | 7個 |
| **ファイル整理（Phase 7）** | **8個** |
| Python分析エンジン | 5個 |
| **合計** | **35個** |

---

## 🔧 エラーハンドリング

すべてのAPIは `Result<T, String>` を返します。

**成功:**
```typescript
const result = await invoke('get_tags');
// result: Tag[]
```

**エラー:**
```typescript
try {
  await invoke('delete_tag', { tagName: 'non-existent' });
} catch (error) {
  console.error(error); // "Tag not found: non-existent"
}
```

---

## 📝 使用例

### ファイル整理機能の完全な使用例

```typescript
import { invoke } from '@tauri-apps/api/core';

// 1. 整理提案を取得
const suggestions = await invoke<OrganizationSuggestion[]>(
  'get_organization_suggestions'
);

console.log(`${suggestions.length}個のファイルが整理候補です`);

// 2. 単一ファイルを移動
const suggestion = suggestions[0];
await invoke('apply_organization_suggestion', {
  filePath: suggestion.file_path,
  destination: suggestion.suggested_destination
});

console.log('ファイルを移動しました');

// 3. 複数ファイルを一括移動
const moves = suggestions.slice(1, 5).map(s => ({
  source: s.file_path,
  destination: s.suggested_destination
}));

const result = await invoke<BatchMoveResult>('move_files_batch', { moves });

console.log(`成功: ${result.success_count}, 失敗: ${result.failed_count}`);

// 4. 移動履歴を確認
const history = await invoke<MoveHistoryEntry[]>('get_move_history', {
  limit: 10
});

console.log('最近の移動履歴:', history);

// 5. クラウドファイル検出
const cloudStatus = await invoke<CloudFileStatus>(
  'detect_cloud_file_status',
  { filePath: '/path/to/file.pdf' }
);

if (cloudStatus.is_cloud_file) {
  console.log(`クラウドファイル: ${cloudStatus.provider}`);
}
```

---

**作成日**: 2025年11月6日
**バージョン**: 0.2.0
**次回更新**: 新API追加時
