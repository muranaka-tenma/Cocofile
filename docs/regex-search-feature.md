# 正規表現検索機能 - 実装ドキュメント

## 概要

CocoFileプロジェクトに正規表現検索機能を実装しました。ファイル名とファイル内容の両方で正規表現によるパターンマッチングが可能になります。

**実装日**: 2025-12-04

---

## 実装内容

### 1. Rust側の実装

#### 1.1 依存関係の追加

**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/Cargo.toml`

```toml
regex = "1"
```

#### 1.2 正規表現検索関数の追加

**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/file_scanner.rs`

新しい関数 `search_files_regex` を追加:

```rust
pub fn search_files_regex(
    app: &tauri::AppHandle,
    pattern: &str,
) -> Result<Vec<SearchResult>, String>
```

**主な機能**:
- 正規表現パターンのコンパイルとバリデーション
- ファイル名での正規表現マッチング
- ファイル内容での正規表現マッチング
- マッチ箇所のスニペット生成（前後32文字）
- スコアリング:
  - ファイル名のみマッチ: 1.0
  - 内容のみマッチ: 0.8
  - 両方マッチ: 1.2
- 最大100件の結果を返す
- スコア順にソート

**エラーハンドリング**:
- 無効な正規表現パターンの場合、詳細なエラーメッセージを返す
- パターンが空の場合、空の結果を返す

#### 1.3 Tauriコマンドの登録

**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/lib.rs`

新しいTauriコマンド `search_files_regex` を追加:

```rust
#[tauri::command]
fn search_files_regex(
    app: tauri::AppHandle,
    pattern: String,
) -> Result<Vec<file_scanner::SearchResult>, String> {
    file_scanner::search_files_regex(&app, &pattern)
}
```

---

### 2. フロントエンド実装

#### 2.1 TauriService APIの追加

**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/services/TauriService.ts`

新しいメソッド `searchFilesRegex` を追加:

```typescript
static async searchFilesRegex(pattern: string): Promise<SearchResult[]> {
  return await invoke<SearchResult[]>("search_files_regex", { pattern });
}
```

#### 2.2 RealFileServiceの拡張

**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/services/RealFileService.ts`

正規表現検索メソッドを追加:

```typescript
async searchFilesRegex(pattern: string): Promise<SearchResult[]> {
  const tauriResults = await TauriService.searchFilesRegex(pattern.trim());
  return tauriResults.map((result) => this.convertToSearchResult(result));
}
```

#### 2.3 状態管理の拡張

**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/store/searchStore.ts`

新しい状態とアクションを追加:

```typescript
interface SearchState {
  isRegexMode: boolean;
  regexError: string | null;
  setIsRegexMode: (isRegexMode: boolean) => void;
  setRegexError: (error: string | null) => void;
}
```

#### 2.4 検索ロジックの統合

**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/hooks/useSearchData.ts`

正規表現モード時の検索処理を追加:

```typescript
if (isRegexMode) {
  try {
    results = await fileService.searchFilesRegex(keyword);
    setRegexError(null);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Invalid regex pattern";
    setRegexError(errorMsg);
    results = [];
  }
}
```

#### 2.5 UIの実装

**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/screens/MainSearchScreen.tsx`

以下のUI要素を追加:

1. **正規表現トグルボタン**:
   - アイコン: `Code` (lucide-react)
   - 有効時は青色でハイライト
   - ツールチップ: "正規表現検索を有効化"

2. **検索ボックスの視覚的変化**:
   - 正規表現モード時、枠が紫色に変化
   - プレースホルダーが正規表現の例に変更

3. **エラー表示**:
   - 正規表現が無効な場合、赤いエラーメッセージを表示
   - アイコン: `AlertCircle` (lucide-react)

---

## 使用方法

### 基本的な正規表現パターン

1. **数字を含むファイル名を検索**:
   ```
   report\d{4}\.pdf
   ```
   例: `report2024.pdf`, `report2023.pdf`

2. **特定の形式の日付を検索**:
   ```
   \d{4}-\d{2}-\d{2}
   ```
   例: `2024-12-04`

3. **複数の拡張子を検索**:
   ```
   \.(pdf|docx|xlsx)$
   ```
   例: `.pdf`, `.docx`, `.xlsx`で終わるファイル

4. **大文字小文字を区別しない**:
   Rustの`regex`クレートでは、フラグ `(?i)` を使用:
   ```
   (?i)invoice
   ```

### UI操作

1. 検索ボックス横の「正規表現」ボタンをクリック
2. 検索ボックスが紫色になり、正規表現モードに切り替わる
3. 正規表現パターンを入力
4. 自動的に検索が実行される
5. エラーがある場合、検索ボックス下にエラーメッセージが表示される

---

## 技術仕様

### パフォーマンス考慮事項

- **最大検索件数**: 10,000ファイル
- **最大結果件数**: 100件
- **タイムアウト**: なし（全ファイルをスキャン）
- **キャッシュ**: 正規表現検索結果はキャッシュされない

### セキュリティ

- **ReDoS対策**:
  - Rustの`regex`クレートは自動的にReDoS攻撃から保護
  - 線形時間でマッチングを保証

- **入力検証**:
  - 空のパターンは早期にリジェクト
  - 無効な正規表現は詳細なエラーメッセージを返す

### エラーハンドリング

1. **無効な正規表現**:
   - Rust側でエラーメッセージを生成
   - フロントエンドでエラーUIを表示

2. **データベースエラー**:
   - ログに記録
   - ユーザーに一般的なエラーメッセージを表示

---

## テスト

### 動作確認済み

- ✅ Rustコードのコンパイル (`cargo check`)
- ✅ TypeScriptの型チェック (`npx tsc --noEmit`)

### 推奨テストケース

1. **基本的なパターン**:
   - `\d+` (数字)
   - `[a-z]+` (小文字アルファベット)
   - `.*\.pdf` (PDFファイル)

2. **複雑なパターン**:
   - `(?i)invoice.*2024` (大文字小文字を区別しない)
   - `(report|document)_\d{4}` (複数のキーワード)

3. **エラーケース**:
   - `[` (閉じカッコなし)
   - `(` (閉じカッコなし)
   - `*` (先行する文字なし)

---

## 今後の改善案

1. **正規表現の履歴**:
   - よく使う正規表現パターンを保存
   - ワンクリックで再利用可能に

2. **正規表現ビルダー**:
   - GUIで正規表現を構築
   - 初心者向けのサポート

3. **パフォーマンス最適化**:
   - インデックスベースの正規表現検索
   - 並列処理の導入

4. **プレビュー機能**:
   - 入力中にマッチ件数をリアルタイム表示
   - マッチ箇所のハイライト

---

## 関連ファイル

### Rust
- `/home/muranaka-tenma/CocoFile/src-tauri/Cargo.toml`
- `/home/muranaka-tenma/CocoFile/src-tauri/src/file_scanner.rs`
- `/home/muranaka-tenma/CocoFile/src-tauri/src/lib.rs`

### TypeScript
- `/home/muranaka-tenma/CocoFile/frontend/src/services/TauriService.ts`
- `/home/muranaka-tenma/CocoFile/frontend/src/services/RealFileService.ts`
- `/home/muranaka-tenma/CocoFile/frontend/src/store/searchStore.ts`
- `/home/muranaka-tenma/CocoFile/frontend/src/hooks/useSearchData.ts`
- `/home/muranaka-tenma/CocoFile/frontend/src/screens/MainSearchScreen.tsx`

---

## 作成者

実装日: 2025-12-04
