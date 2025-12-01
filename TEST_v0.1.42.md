# v0.1.42 ローカルテスト手順

## 修正内容

### 問題
- データベースには90,974ファイルが存在
- しかしUI上で「0ファイル」と表示される
- 原因：フロントエンドが`get_db_stats`コマンドを呼び出していない

### 修正箇所

**frontend/src/services/TauriService.ts (72-88行目)**
```typescript
// 修正前：環境チェックで早期リターン
if (!isTauriEnvironment()) {
  return { total_files: 1234, ... };  // モックデータ
}
const result = await invoke('get_db_stats');

// 修正後：常にinvokeを試行、失敗時のみフォールバック
try {
  const result = await invoke('get_db_stats');
  return result;  // 実データを返す
} catch (error) {
  console.error('[TauriService] get_db_stats FAILED:', error);
  return { total_files: 1234, ... };  // フォールバック
}
```

## テスト手順（Windows環境）

### 1. 開発環境で確認

```bash
# WSLから現在の変更を確認
git status

# 期待される出力：
# M frontend/src/services/TauriService.ts
```

### 2. Windows PowerShellでプロジェクトを開く

```powershell
cd C:\Users\muranaka-tenma\path\to\CocoFile  # 実際のパスに置き換え
```

### 3. 開発サーバーで起動

```powershell
cd frontend
npm run tauri dev
```

### 4. テスト項目

#### ✅ チェック1: アプリ起動
- [ ] アプリウィンドウが正常に開く
- [ ] エラーダイアログが表示されない

#### ✅ チェック2: デベロッパーツールでログ確認
1. アプリ起動後、`F12`キーを押す
2. `Console`タブを開く
3. 以下のログを確認：

**期待されるログ（成功時）：**
```
[TauriService] getDatabaseStats called, isTauriEnv: true
[TauriService] Attempting to call get_db_stats command...
[TauriService] ✅ get_db_stats SUCCESS: {total_files: 90974, ...}
```

**もしくは（失敗時）：**
```
[TauriService] getDatabaseStats called, isTauriEnv: true
[TauriService] Attempting to call get_db_stats command...
[TauriService] ❌ get_db_stats FAILED: [エラーメッセージ]
[DEV] Falling back to mock database stats
```

#### ✅ チェック3: スキャン・インデックス画面
1. 左メニューから「スキャン・インデックス管理」を選択
2. 「インデックス統計」セクションを確認
3. **期待される表示：**
   - 総ファイル数: **90,974** （または実際のファイル数）
   - ~~総ファイル数: 0~~ （これが表示されていたら失敗）

#### ✅ チェック4: Rustログ確認（オプション）
WSL側で以下を実行：
```bash
tail -f ~/.local/share/com.cocofile.app/logs/cocofile.log | grep "get_db_stats"
```

**期待される出力：**
```
[2025-11-20T...] [INFO] [Command] get_db_stats called
[2025-11-20T...] [INFO] [Command] get_db_stats returned: 90974 files, 15 tags, 898000000 bytes
```

## テスト結果

### ✅ 成功の場合
- [ ] ファイル数が正しく表示される（90,974件）
- [ ] コンソールに成功ログが表示される
- [ ] Rustログに`get_db_stats called`が記録される

**→ v0.1.42としてコミット・プッシュしてOK**

### ❌ 失敗の場合
- [ ] 依然として0ファイルと表示される
- [ ] コンソールにエラーログが表示される

**→ エラーメッセージをコピーしてClaudeに報告**

## 追加デバッグ（失敗時）

### isTauriEnvironment()の確認
Consoleタブで以下を実行：
```javascript
window.__TAURI__
```

**期待される出力：**
```javascript
{core: {...}, event: {...}, ...}  // Tauriオブジェクトが存在
```

**もしundefinedの場合：**
Tauri環境が正しく初期化されていない

### invoke()の直接呼び出しテスト
Consoleタブで以下を実行：
```javascript
const { invoke } = window.__TAURI__.core;
invoke('get_db_stats').then(console.log).catch(console.error);
```

**期待される出力：**
```javascript
{total_files: 90974, total_tags: 15, db_size_bytes: 898000000}
```

## 変更の取り消し（必要な場合）

```bash
# WSLで変更を破棄
git checkout frontend/src/services/TauriService.ts
```

---

**作成日**: 2025-11-20
**対象バージョン**: v0.1.42-test
**テスト担当**: muranaka-tenma
