# Phase 5: ファイル整理支援機能 - 設計書

## 概要

CocoFileに「ファイル整理支援機能」を追加し、散らばったファイルに適切な保存先を提案する。

**主な機能:**
- 整理が必要なファイルの自動検出
- 移動先候補の提案（AIベース + ルールベース）
- ワンクリック/一括移動
- 整理ルールのカスタマイズ
- クラウドストレージ（OneDrive/Google Drive）対応

---

## S-006: ファイル整理画面

### 画面構成

```
┌─────────────────────────────────────────────────────┐
│  📁 ファイル整理アシスタント                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│  📊 整理状況サマリー                                  │
│  ┌───────────────────────────────────────────┐      │
│  │ 要整理: 47ファイル  提案済: 32  完了: 15  │      │
│  └───────────────────────────────────────────┘      │
│                                                       │
│  🔍 フィルター: [すべて ▼] [種類: PDF ▼]           │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ ファイル一覧                                    │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ☐ report_2024.pdf                          │    │
│  │    📍 現在: C:\Users\User\Desktop\         │    │
│  │    💡 提案: C:\Users\User\Documents\Reports\│    │
│  │    理由: PDFファイル、ファイル名に"report"   │    │
│  │    [移動する] [別の場所...]                 │    │
│  │                                              │    │
│  │ ☐ invoice_jan.xlsx                         │    │
│  │    📍 現在: C:\Users\User\Downloads\       │    │
│  │    💡 提案: C:\Users\User\Documents\Finance\│    │
│  │    理由: Excelファイル、"invoice"を含む     │    │
│  │    [移動する] [別の場所...]                 │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  [選択項目を移動 (2)] [すべて自動整理]              │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### UI要素

1. **サマリーカード**
   - 要整理ファイル数
   - 提案済み数
   - 完了数

2. **フィルター**
   - すべて / 要整理のみ / 提案済みのみ
   - ファイル種別
   - 場所（Desktop / Downloads / その他）

3. **ファイルカード**
   - チェックボックス（複数選択）
   - ファイル名・アイコン
   - 現在の場所
   - 提案先（複数候補）
   - 理由の説明
   - アクションボタン

---

## 整理ルールエンジン

### ルール優先順位

1. **ユーザー定義ルール**（最優先）
2. **学習ベースルール**（過去の移動履歴から学習）
3. **デフォルトルール**（プリセット）

### ルールの型定義

```typescript
interface OrganizationRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;

  conditions: {
    fileType?: FileType[];
    namePattern?: string;  // 正規表現
    contentKeywords?: string[];
    sizeRange?: { min: number; max: number };
    tags?: string[];
    ageInDays?: number;  // ファイル作成からの日数
  };

  destination: string;  // フォルダパス
  confidence: number;   // 0.0-1.0
}
```

### デフォルトルール例

```typescript
const DEFAULT_RULES: OrganizationRule[] = [
  {
    id: 'pdf-reports',
    name: 'PDFレポートをReportsフォルダへ',
    conditions: {
      fileType: ['pdf'],
      namePattern: /report|レポート|報告/i,
    },
    destination: 'Documents/Reports',
    confidence: 0.9,
  },
  {
    id: 'invoices',
    name: '請求書をFinanceフォルダへ',
    conditions: {
      namePattern: /invoice|請求書|領収書/i,
    },
    destination: 'Documents/Finance',
    confidence: 0.95,
  },
  {
    id: 'old-downloads',
    name: '古いダウンロードファイルを整理',
    conditions: {
      ageInDays: 90,
    },
    destination: 'Documents/Archive',
    confidence: 0.7,
  },
];
```

---

## 整理対象の検出ロジック

### 検出条件

```typescript
interface ClutterDetectionCriteria {
  // デスクトップに30日以上放置
  desktopOldFiles: {
    location: 'Desktop',
    ageInDays: 30,
  };

  // ダウンロードフォルダに90日以上
  downloadsOldFiles: {
    location: 'Downloads',
    ageInDays: 90,
  };

  // タグが付いていない重要そうなファイル
  untaggedImportant: {
    fileSize: 1048576,  // 1MB以上
    tags: [],
  };

  // ルールに合致するが移動されていないファイル
  ruleMatchNotMoved: {
    matchesRule: true,
    inWrongLocation: true,
  };
}
```

### 提案の生成

```rust
// Rust側の実装イメージ
pub fn generate_organization_suggestions(
    app: &AppHandle
) -> Result<Vec<OrganizationSuggestion>, String> {
    let conn = database::get_connection(app)?;

    // 1. デスクトップとダウンロードフォルダの古いファイル取得
    let cluttered_files = get_cluttered_files(&conn)?;

    // 2. 各ファイルにルールを適用
    let mut suggestions = Vec::new();
    for file in cluttered_files {
        if let Some(suggestion) = apply_rules(&file) {
            suggestions.push(suggestion);
        }
    }

    // 3. 信頼度でソート
    suggestions.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());

    Ok(suggestions)
}
```

---

## データベース拡張

### 新しいテーブル

```sql
-- ファイル移動履歴
CREATE TABLE file_move_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rule_id TEXT,  -- 適用されたルールID（null = 手動移動）
  user_confirmed BOOLEAN DEFAULT 1,
  INDEX idx_moved_at (moved_at)
);

-- 整理ルール
CREATE TABLE organization_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  conditions TEXT NOT NULL,  -- JSON文字列
  destination TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 整理提案（一時保存）
CREATE TABLE organization_suggestions (
  file_path TEXT PRIMARY KEY,
  suggested_destination TEXT NOT NULL,
  reason TEXT,
  confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
  rule_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES organization_rules(id)
);
```

---

## 新しいTauri API

### Rust Commands

```rust
// ファイル整理関連API
#[tauri::command]
pub fn get_organization_suggestions(app: AppHandle) -> Result<Vec<OrganizationSuggestion>, String>;

#[tauri::command]
pub fn apply_organization_suggestion(
    app: AppHandle,
    file_path: String,
    destination: String
) -> Result<(), String>;

#[tauri::command]
pub fn move_files_batch(
    app: AppHandle,
    moves: Vec<FileMove>
) -> Result<BatchMoveResult, String>;

#[tauri::command]
pub fn get_user_rules(app: AppHandle) -> Result<Vec<OrganizationRule>, String>;

#[tauri::command]
pub fn save_user_rule(
    app: AppHandle,
    rule: OrganizationRule
) -> Result<(), String>;

#[tauri::command]
pub fn delete_user_rule(
    app: AppHandle,
    rule_id: String
) -> Result<(), String>;

#[tauri::command]
pub fn get_move_history(
    app: AppHandle,
    limit: Option<usize>
) -> Result<Vec<MoveHistoryEntry>, String>;
```

### 型定義

```rust
#[derive(Serialize, Deserialize)]
pub struct OrganizationSuggestion {
    pub file_path: String,
    pub file_name: String,
    pub current_location: String,
    pub suggested_destination: String,
    pub reason: String,
    pub confidence: f32,
    pub rule_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct FileMove {
    pub source: String,
    pub destination: String,
}

#[derive(Serialize, Deserialize)]
pub struct BatchMoveResult {
    pub success_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}
```

---

## クラウドストレージ対応

### 現状の対応

✅ **既に基本対応済み:**
- OneDrive: `C:\Users\[User]\OneDrive\` を監視フォルダに追加
- Google Drive: `G:\マイドライブ\` を監視フォルダに追加
- Dropbox: `C:\Users\[User]\Dropbox\` を監視フォルダに追加

### Phase 5で追加する機能

**1. クラウド同期状態の検出**

```rust
#[derive(Serialize, Deserialize)]
pub struct CloudFileStatus {
    pub is_cloud_file: bool,
    pub provider: Option<CloudProvider>,
    pub sync_status: SyncStatus,
    pub local_path: String,
    pub cloud_path: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub enum CloudProvider {
    OneDrive,
    GoogleDrive,
    Dropbox,
}

#[derive(Serialize, Deserialize)]
pub enum SyncStatus {
    Synced,
    Syncing,
    OnlineOnly,
    Error,
}
```

**2. 検出方法**

Windows API:
```rust
use winapi::um::fileapi::GetFileAttributesW;
use winapi::um::winnt::FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS;

pub fn is_online_only_file(path: &str) -> bool {
    let attrs = unsafe { GetFileAttributesW(path.as_ptr()) };
    (attrs & FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS) != 0
}
```

**3. UI表示**

ファイルカードにクラウドアイコン追加:
```
☁️ OneDrive (同期済み)
🔄 Google Drive (同期中...)
⚠️ Dropbox (オンラインのみ)
```

---

## 実装ロードマップ

### Phase 5-A: 設計 ✅ 完了
- 画面設計
- データベース設計
- API設計

### Phase 5-B: データベース拡張（推定: 1時間）
- [ ] マイグレーションスクリプト作成
- [ ] 新テーブル作成
- [ ] テストデータ投入

### Phase 5-C: バックエンドAPI実装（推定: 3-4時間）
- [ ] `organization_manager.rs` モジュール作成
- [ ] ルールエンジン実装
- [ ] 提案生成ロジック実装
- [ ] ファイル移動処理実装
- [ ] 8個の新APIをTauriに登録

### Phase 5-D: フロントエンド実装（推定: 4-5時間）
- [ ] S-006画面コンポーネント作成
- [ ] 整理ルール管理UI
- [ ] ファイル移動処理UI
- [ ] Dev Navigationにボタン追加

### Phase 5-E: クラウド対応（推定: 2-3時間）
- [ ] クラウドファイル検出実装
- [ ] 同期状態表示UI
- [ ] OneDrive/Google Drive/Dropbox別のアイコン

### Phase 5-F: テスト（推定: 2時間）
- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] Windows実機テスト

**合計推定時間: 12-15時間**

---

## 優先度と次のステップ

### 推奨の進め方

1. **Phase 6: Windows実機テスト（最優先）**
   - 現在のMVP機能を実機で確認
   - バグ修正
   - 基本機能の安定化

2. **Phase 5: ファイル整理機能実装**
   - 実機テスト完了後に実装開始
   - Phase 5-B → 5-C → 5-D → 5-E → 5-F の順

3. **Phase 7: リリース準備**
   - ビルド最適化
   - インストーラー作成
   - ドキュメント整備

---

## 注意事項

- ファイル移動は**破壊的操作**なので、必ずバックアップ機能を提供
- クラウドファイルの移動は同期に時間がかかる可能性がある
- 大量ファイルの一括移動はUI凍結を避けるため非同期処理必須

---

**作成日**: 2025-11-05
**ステータス**: 設計完了、実装待ち
**次のステップ**: Phase 6 Windows実機テストを優先
