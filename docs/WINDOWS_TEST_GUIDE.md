# CocoFile - Windows実機テスト手順書

## 📋 目的

WSL2開発環境で作成したCocoFileを、Windows環境で実際に動かしてテストする。

---

## 🚀 ステップ1: リリースビルドの作成

### WSL2で実行

```bash
# プロジェクトディレクトリに移動
cd /home/muranaka-tenma/CocoFile/frontend

# リリースビルド実行（5-10分かかります）
npm run tauri:build
```

**生成されるファイル:**
```
/home/muranaka-tenma/CocoFile/src-tauri/target/release/
├── cocofile.exe          ← 実行ファイル
└── bundle/
    └── msi/
        └── CocoFile_0.1.0_x64_en-US.msi  ← インストーラー
```

---

## 📦 ステップ2: ファイルをWindowsにコピー

### 方法A: 直接コピー（シンプル）

```bash
# WSL2からWindowsデスクトップにコピー
cp /home/muranaka-tenma/CocoFile/src-tauri/target/release/cocofile.exe /mnt/c/Users/YourUserName/Desktop/CocoFile.exe
```

> **注意**: `YourUserName` を実際のWindowsユーザー名に置き換えてください

### 方法B: Windowsエクスプローラーで開く

```bash
# Windowsエクスプローラーで開く
explorer.exe /home/muranaka-tenma/CocoFile/src-tauri/target/release/
```

→ `cocofile.exe` を手動でデスクトップにコピー

---

## ▶️ ステップ3: CocoFileを起動

### Windowsで実行

1. デスクトップの `CocoFile.exe` をダブルクリック
2. Windowsセキュリティ警告が出たら「**詳細情報**」→「**実行**」をクリック
3. CocoFileウィンドウが開く（1200x800px）

**初回起動時：**
- データベースが自動作成される
- ログファイルが生成される
  - 場所: `C:\Users\YourName\AppData\Local\com.cocofile.app\logs\`

---

## ✅ ステップ4: 基本機能テスト

### テスト1: 設定画面

1. 右下の「Dev Navigation」パネルで **Settings** をクリック
2. 「監視フォルダを追加」をクリック
3. テスト用フォルダを選択（例: `C:\Users\YourName\Documents`）
4. フォルダが一覧に追加されることを確認

### テスト2: スキャン機能

1. **Scan Index** ボタンをクリック
2. 「スキャン開始」ボタンをクリック
3. フォルダパス入力（例: `C:\Users\YourName\Documents`）
4. スキャンが開始されることを確認
5. 進捗が表示されることを確認
6. 完了後、DB統計が更新されることを確認

**期待される動作:**
- ファイル数がカウントされる
- PDF/Excel/Word/PowerPointファイルが解析される
- データベースに保存される

### テスト3: 検索機能

1. **Main Search** ボタンをクリック
2. 検索ボックスにキーワード入力（例: "report"）
3. 検索結果が表示されることを確認
4. ファイルをクリック → 実際に開くことを確認

### テスト4: タグ管理

1. **Tag Management** ボタンをクリック
2. 「タグを作成」ボタンをクリック
3. タグ名と色を選択
4. タグが一覧に追加されることを確認
5. タグを編集・削除できることを確認

---

## 🐛 トラブルシューティング

### 問題1: アプリが起動しない

**原因と対処:**
- Windows Defenderがブロック → 「詳細情報」→「実行」
- 依存関係不足 → Visual C++ Redistributable をインストール
  - https://aka.ms/vs/17/release/vc_redist.x64.exe

### 問題2: データベースエラー

**対処:**
```powershell
# PowerShellで実行
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\com.cocofile.app"
```
→ アプリを再起動してデータベースを再作成

### 問題3: ファイルスキャンが失敗

**確認事項:**
- フォルダパスが正しいか
- フォルダへのアクセス権限があるか
- 対応ファイル形式か（PDF/Excel/Word/PowerPoint）

**ログ確認:**
```
C:\Users\YourName\AppData\Local\com.cocofile.app\logs\cocofile.log
```

### 問題4: Python解析エラー

**原因:**
Python実行ファイルが見つからない

**対処:**
CocoFileはPythonをバンドルしているため通常不要。
エラーが出る場合は `src-tauri/python-backend/` の確認が必要。

---

## 📊 テストチェックリスト

### 基本機能

- [ ] アプリ起動
- [ ] ウィンドウ表示（1200x800px）
- [ ] Dev Navigationパネル表示

### 設定機能

- [ ] 監視フォルダ追加
- [ ] 監視フォルダ削除
- [ ] 除外フォルダ設定
- [ ] 除外拡張子設定
- [ ] スキャンタイミング変更
- [ ] ホットキー設定

### スキャン機能

- [ ] フォルダスキャン開始
- [ ] 進捗表示
- [ ] スキャン完了
- [ ] DB統計更新（ファイル数、タグ数、DB容量）
- [ ] エラーハンドリング

### 検索機能

- [ ] キーワード検索
- [ ] 検索結果表示
- [ ] ファイルタイプフィルター（PDF/Excel/Word/PowerPoint）
- [ ] タグフィルター
- [ ] ファイルを開く
- [ ] ファイルの場所を開く

### タグ機能

- [ ] タグ一覧表示
- [ ] タグ作成
- [ ] タグ編集（名前・色変更）
- [ ] タグ削除
- [ ] タグの使用数表示
- [ ] タグでソート（使用頻度/名前/作成日）

### ファイル詳細

- [ ] ファイル詳細モーダル表示
- [ ] タグ追加/削除
- [ ] メモ編集
- [ ] お気に入り切り替え
- [ ] ファイル情報表示

---

## 🎯 パフォーマンステスト

### メモリ使用量

**測定方法:**
タスクマネージャー → 詳細 → CocoFile.exe を確認

**目標値:**
- アイドル時: 150MB以下
- スキャン時: 500MB以下

### CPU使用率

**目標値:**
- アイドル時: 1%以下
- スキャン時: 50%以下

### 検索速度

**測定方法:**
検索ボックスにキーワード入力 → 結果表示までの時間

**目標値:**
- キーワード検索: 0.5秒以内
- フィルター適用: 0.5秒以内

---

## 📝 バグ報告フォーマット

バグを見つけた場合は以下の形式で記録：

```
### バグ報告

**日時:** 2025-11-05 12:00

**操作手順:**
1. 設定画面を開く
2. 監視フォルダを追加
3. ...

**期待される動作:**
フォルダが一覧に追加される

**実際の動作:**
エラーメッセージが表示される

**エラーメッセージ:**
```
Error: Failed to add folder
```

**環境:**
- OS: Windows 11 23H2
- CocoFile: v0.1.0
- ログファイル: [ログの内容を添付]
```

---

## 🚢 リリース準備（テスト成功後）

### インストーラーの作成

既に生成されています:
```
src-tauri/target/release/bundle/msi/CocoFile_0.1.0_x64_en-US.msi
```

### インストーラーテスト

1. `.msi` ファイルをダブルクリック
2. インストールウィザードに従う
3. インストール先: `C:\Program Files\CocoFile\`
4. スタートメニューにショートカット作成
5. デスクトップにショートカット作成（オプション）

### アンインストールテスト

1. 設定 → アプリ → CocoFile
2. アンインストール
3. ファイルが削除されることを確認
4. データベースは残る（`AppData` フォルダ）

---

## 🎉 テスト完了後の次のステップ

テストが成功したら：

1. **バグ修正**
   - 見つかった問題を修正
   - 再ビルド → 再テスト

2. **Phase 7: 新機能実装**
   - ファイル整理支援機能（Phase 5設計済み）
   - クラウドストレージ対応

3. **配布準備**
   - README更新
   - ユーザーマニュアル作成
   - Webサイト/GitHub Releasesで公開

---

**作成日**: 2025-11-05
**対象**: CocoFile v0.1.0
**想定テスト時間**: 1-2時間
