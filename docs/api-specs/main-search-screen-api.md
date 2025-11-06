# メイン検索画面（S-001）API仕様書

生成日: 2025-11-04
収集元: frontend/src/services/mock/FileService.ts
@MOCK_TO_APIマーク数: 6
@BACKEND_COMPLEXマーク数: 0

## エンドポイント一覧

### 1. ファイル検索

- **エンドポイント**: `POST /api/search`
- **説明**: キーワードとフィルターに基づいてファイルを検索
- **Request**:
  ```typescript
  {
    keyword?: string;
    filters?: {
      tags?: string[];
      dateRange?: {
        startDate?: Date;
        endDate?: Date;
      };
      fileTypes?: string[];
    };
  }
  ```
- **Response**: `SearchResult[]`
  ```typescript
  {
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    thumbnail?: string;
    relevanceScore: number;
    frequencyScore: number;
    lastAccessedAt: Date;
    metadata: FileMetadata;
  }[]
  ```
- **処理内容**:
  - SQLite FTS5でキーワード全文検索
  - タグ、日付範囲、ファイル種別でフィルタリング
  - 関連度スコアと使用頻度スコアを計算してランキング
  - 0.5秒以内に結果を返す（パフォーマンス要件）

---

### 2. お気に入りファイル取得

- **エンドポイント**: `GET /api/files/favorites`
- **説明**: お気に入り登録済みのファイル一覧を取得
- **Request**: なし
- **Response**: `SearchResult[]`
- **処理内容**:
  - `isFavorite = true` のファイルを抽出
  - 最終アクセス日時順でソート

---

### 3. 最近使用したファイル取得

- **エンドポイント**: `GET /api/files/recent`
- **説明**: 最近アクセスしたファイル一覧を取得
- **Request**: なし
- **Response**: `SearchResult[]`
- **処理内容**:
  - `lastAccessedAt` で降順ソート
  - 上位10-20件を返す

---

### 4. お気に入り切り替え

- **エンドポイント**: `PUT /api/files/{filePath}/favorite`
- **説明**: ファイルのお気に入り状態を切り替え
- **Request**:
  ```typescript
  {
    isFavorite: boolean;
  }
  ```
- **Response**: `FileMetadata`
- **処理内容**:
  - ファイルパスで該当ファイルを検索
  - `isFavorite` フラグを反転
  - 更新されたメタデータを返す

---

### 5. ファイルを開く（Tauri Command）

- **Tauri Command**: `open_file`
- **説明**: ファイルをデフォルトアプリケーションで開く
- **Request**:
  ```typescript
  {
    filePath: string;
  }
  ```
- **Response**: `void`
- **実装方法**:
  ```rust
  // src-tauri/src/main.rs
  #[tauri::command]
  async fn open_file(file_path: String) -> Result<(), String> {
    use std::process::Command;
    #[cfg(target_os = "windows")]
    Command::new("cmd")
      .args(["/C", "start", "", &file_path])
      .spawn()
      .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    Command::new("open")
      .arg(&file_path)
      .spawn()
      .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    Command::new("xdg-open")
      .arg(&file_path)
      .spawn()
      .map_err(|e| e.to_string())?;

    Ok(())
  }
  ```
- **フロントエンド呼び出し**:
  ```typescript
  import { invoke } from '@tauri-apps/api/core';

  await invoke('open_file', { filePath: 'C:\\path\\to\\file.pdf' });
  ```

---

### 6. フォルダを開く（Tauri Command）

- **Tauri Command**: `open_folder`
- **説明**: ファイルの場所をエクスプローラーで開く
- **Request**:
  ```typescript
  {
    folderPath: string;
  }
  ```
- **Response**: `void`
- **実装方法**:
  ```rust
  // src-tauri/src/main.rs
  #[tauri::command]
  async fn open_folder(folder_path: String) -> Result<(), String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    Command::new("explorer")
      .arg(&folder_path)
      .spawn()
      .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    Command::new("open")
      .arg(&folder_path)
      .spawn()
      .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    Command::new("xdg-open")
      .arg(&folder_path)
      .spawn()
      .map_err(|e| e.to_string())?;

    Ok(())
  }
  ```
- **フロントエンド呼び出し**:
  ```typescript
  import { invoke } from '@tauri-apps/api/core';

  // ファイルパスから親ディレクトリを取得して開く
  const folderPath = filePath.substring(0, filePath.lastIndexOf('\\'));
  await invoke('open_folder', { folderPath });
  ```

---

## バックエンド実装要件

### SQLite FTS5検索クエリ

```sql
-- ファイル検索（全文検索 + フィルター）
SELECT
  f.file_path,
  f.file_name,
  f.file_type,
  f.file_size,
  f.last_accessed_at,
  f.access_count,
  f.is_favorite,
  fts.rank AS relevance_score
FROM files_fts fts
INNER JOIN file_metadata f ON fts.rowid = f.rowid
WHERE fts MATCH ?  -- キーワード（N-gram検索）
  AND (? IS NULL OR f.file_type IN (?))  -- ファイル種別フィルター
  AND (? IS NULL OR f.created_at >= ?)   -- 開始日フィルター
  AND (? IS NULL OR f.created_at <= ?)   -- 終了日フィルター
  AND (? IS NULL OR EXISTS (
    SELECT 1 FROM file_tags ft
    WHERE ft.file_path = f.file_path
    AND ft.tag_name IN (?)               -- タグフィルター
  ))
ORDER BY
  fts.rank DESC,                         -- 関連度順
  f.access_count DESC,                   -- 使用頻度順
  f.last_accessed_at DESC                -- 最終アクセス順
LIMIT 100;
```

### Python分析エンジン連携（フロー）

```yaml
新規ファイル検出時:
  1. Tauri fs-watchプラグインがファイル変更を検知
  2. Pythonバックエンドにファイルパスを送信
  3. Pythonでファイル分析:
     - PDF: pdfplumber で全文テキスト抽出
     - Excel: openpyxl でセル内容抽出
     - Word: docx2txt でテキスト抽出
     - PowerPoint: python-pptx でスライドテキスト抽出
  4. 抽出テキストをSQLite FTS5インデックスに登録
  5. タグ自動提案（ルールベース）
  6. ハッシュ値計算（SHA256）で重複検出
  7. メタデータをfile_metadataテーブルに保存
```

---

## モックサービス参照

実装時はこのモックサービスの挙動を参考にしてください：

**ファイル**: `frontend/src/services/mock/FileService.ts`

### 主要メソッド
- `searchFiles(keyword, filters)` - 検索機能
- `getFavorites()` - お気に入り取得
- `getRecentFiles()` - 最近使用取得
- `toggleFavorite(filePath)` - お気に入り切り替え
- `openFile(filePath)` - ファイルを開く
- `openFileLocation(filePath)` - フォルダを開く

### ヘルパー関数
- `calculateRelevanceScore()` - 関連度スコア計算
- `calculateFrequencyScore()` - 使用頻度スコア計算
- `formatFileSize()` - ファイルサイズフォーマット
- `formatRelativeTime()` - 相対時刻フォーマット

---

## パフォーマンス要件

| 項目 | 目標値 | 備考 |
|------|--------|------|
| 検索速度 | 0.5秒以内 | キーワード検索からUI表示まで |
| フィルター適用 | 0.5秒以内 | フィルター変更からUI更新まで |
| お気に入り表示 | 0.1秒以内 | タブ切り替え時 |
| 最近使用表示 | 0.1秒以内 | タブ切り替え時 |

---

## エラーハンドリング

### 共通エラーレスポンス

```typescript
{
  error: string;
  code: string;
  details?: any;
}
```

### エラーコード一覧

| コード | 説明 | HTTPステータス |
|--------|------|----------------|
| FILE_NOT_FOUND | ファイルが見つからない | 404 |
| INVALID_PATH | 無効なファイルパス | 400 |
| SEARCH_FAILED | 検索処理失敗 | 500 |
| DATABASE_ERROR | データベースエラー | 500 |
| PERMISSION_DENIED | ファイルアクセス権限なし | 403 |

---

## 次のステップ

1. **Tauri Commandの実装**
   - `open_file` コマンドを src-tauri/src/main.rs に追加
   - `open_folder` コマンドを src-tauri/src/main.rs に追加
   - Tauri設定ファイルでコマンドを有効化

2. **Pythonバックエンド実装**
   - ファイル分析エンジン（PDF/Excel/Word/PPT）
   - SQLiteデータベース操作モジュール
   - タグ自動提案ロジック

3. **SQLiteスキーマ設計**
   - file_metadataテーブル
   - files_ftsテーブル（FTS5仮想テーブル）
   - file_tagsテーブル（多対多）

4. **モックサービス置き換え**
   - FileService.tsをTauri Command呼び出しに変更
   - エラーハンドリング追加
   - リトライロジック追加

---

**作成日**: 2025年11月4日
**対象画面**: S-001 メイン検索画面
**対応要件**: requirements.md「3.1 S-001: メイン検索画面」
