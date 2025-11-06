# CocoFile - 技術的決定事項

**作成日**: 2025年11月4日
**ステータス**: 確定

このドキュメントは、プロジェクトの重要な技術的決定事項を記録します。

---

## 🔴 確定事項（変更時は全体影響を考慮）

### 1. Python統合の仕組み

**決定内容**:
```yaml
方式: PyInstaller + stdin/stdout JSON通信
理由: シンプルで確実、クロスプラットフォーム対応

実装詳細:
  バイナリ化:
    - PyInstaller でPythonスクリプトを単一実行ファイル化
    - 必要ライブラリ: pdfplumber, openpyxl, docx2txt, python-pptx
    - バンドル先: src-tauri/binaries/python-analyzer[.exe]

  通信方式:
    - Rust (Tauri Command) → Pythonプロセス起動
    - stdin: JSON形式でコマンド送信
      例: {"command": "analyze_pdf", "path": "C:\\file.pdf"}
    - stdout: JSON形式で結果受信
      例: {"status": "success", "text": "抽出テキスト..."}

  プロセス管理:
    - Tauri起動時に1回だけPythonプロセス起動
    - 長時間起動（常駐プロセス）
    - Tauri終了時にクリーンアップ
```

**実装ファイル**:
```
src-tauri/src/python_bridge.rs  # Rust側のブリッジ
python-backend/main.py           # Pythonのエントリーポイント（stdin/stdoutループ）
python-backend/analyzers/        # 各種分析モジュール
```

**代替案を却下した理由**:
- ❌ gRPC: オーバースペック、複雑すぎる
- ❌ REST API: ローカルポート使用が不要に複雑
- ❌ FFI (ctypes): Pythonバイナリ化が困難

---

### 2. SQLite FTS5のN-gram設定

**決定内容**:
```yaml
方式: アプリ側N-gram前処理 + FTS5 simple tokenizer
理由: C拡張不要、メンテナンス容易、日本語完全対応

実装詳細:
  テーブル設計:
    CREATE VIRTUAL TABLE files_fts USING fts5(
      file_path UNINDEXED,
      content,
      tokenize='unicode61'  -- 標準トークナイザー
    );

  N-gram前処理:
    - Python側で実装（インデックス登録時）
    - 2-gram（バイグラム）に分割
      例: "営業資料" → "営業 業資 資料"
    - スペース区切りでFTS5に登録

  検索時:
    - ユーザー入力: "営業資料"
    - アプリ側で2-gramに変換: "営業 業資 資料"
    - FTS5クエリ: MATCH '営業 AND 業資 AND 資料'

  パフォーマンス:
    - 10万ファイルで150MB（想定内）
    - 検索速度: 0.5秒以内（目標達成可能）
```

**実装ファイル**:
```python
# python-backend/database/fts_indexer.py
def ngram_tokenize(text: str, n: int = 2) -> str:
    """テキストをN-gramに分割"""
    tokens = []
    for i in range(len(text) - n + 1):
        tokens.append(text[i:i+n])
    return ' '.join(tokens)

# 使用例
content = "営業資料のファイル検索"
indexed = ngram_tokenize(content)  # "営業 業資 資料 料の のフ ファ ..."
```

**代替案を却下した理由**:
- ❌ C拡張でカスタムトークナイザー: ビルドが複雑、メンテナンス困難
- ❌ mecab-sqlite: 外部依存増加、形態素解析は過剰
- ❌ 外部検索エンジン（Meilisearch等）: ローカル動作のシンプルさ失われる

---

### 3. データベースファイル配置

**決定内容**:
```yaml
配置パス: Tauri標準のapp_data_dir()
ファイル名: cocofile.db（単一ファイル）

プラットフォーム別パス:
  Windows:
    - C:\Users\{USER}\AppData\Roaming\CocoFile\cocofile.db
  macOS:
    - ~/Library/Application Support/CocoFile/cocofile.db
  Linux:
    - ~/.config/CocoFile/cocofile.db

ディレクトリ構造:
  CocoFile/
  ├── cocofile.db          # メインデータベース
  ├── logs/                # ログファイル
  │   └── cocofile.log
  └── cache/               # サムネイルキャッシュ等
      └── thumbnails/
```

**実装コード**:
```rust
// src-tauri/src/database.rs
use tauri::Manager;

pub fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app.path_resolver()
        .app_data_dir()
        .expect("Failed to get app data dir");

    // ディレクトリ作成
    std::fs::create_dir_all(&app_data_dir)
        .expect("Failed to create app data dir");

    app_data_dir.join("cocofile.db")
}
```

**データベース設計**:
```sql
-- メインテーブル
CREATE TABLE file_metadata (
    file_path TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    hash_value TEXT,
    created_at TEXT,
    updated_at TEXT,
    last_accessed_at TEXT,
    access_count INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    memo TEXT,
    indexed_at TEXT NOT NULL
);

-- FTS5仮想テーブル（全文検索）
CREATE VIRTUAL TABLE files_fts USING fts5(
    file_path UNINDEXED,
    content,  -- N-gram処理済みテキスト
    tokenize='unicode61'
);

-- タグテーブル
CREATE TABLE tags (
    tag_name TEXT PRIMARY KEY,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

-- ファイル-タグ関連（多対多）
CREATE TABLE file_tags (
    file_path TEXT,
    tag_name TEXT,
    PRIMARY KEY (file_path, tag_name),
    FOREIGN KEY (file_path) REFERENCES file_metadata(file_path) ON DELETE CASCADE,
    FOREIGN KEY (tag_name) REFERENCES tags(tag_name) ON DELETE CASCADE
);

-- 重複グループ
CREATE TABLE duplicate_groups (
    group_id TEXT PRIMARY KEY,
    hash_value TEXT NOT NULL,
    file_count INTEGER NOT NULL
);

-- スキャン履歴
CREATE TABLE scan_history (
    scan_id TEXT PRIMARY KEY,
    target_folder TEXT,
    processed_files INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT
);
```

**代替案を却下した理由**:
- ❌ プロジェクトディレクトリ内: 削除リスク、権限問題
- ❌ ユーザー指定パス: 設定が複雑、初回起動が面倒
- ❌ 複数DB分割: 管理複雑、トランザクション難しい

---

## 📝 実装優先順位

これらの決定に基づき、以下の順序で実装を進めます：

1. **SQLiteデータベース初期化**（最優先）
   - スキーマ作成
   - Tauri Commandでアクセス

2. **Pythonブリッジ実装**
   - stdin/stdout通信の基本フレーム
   - ヘルスチェック機能

3. **ファイル分析エンジン**
   - PDF/Excel/Word/PowerPoint解析
   - N-gramインデックス化

4. **FTS5検索機能**
   - N-gram検索クエリ実装
   - パフォーマンステスト

---

## 🔄 将来の見直しポイント

以下の条件で再検討する可能性があります：

- **Python統合**: プロセス起動が遅い場合（>2秒）
- **N-gram方式**: 検索精度が80%未満の場合
- **単一DB**: ファイルサイズが1GB超の場合

---

**承認**: 2025年11月4日
**次回レビュー**: Phase 1 MVP完成時
