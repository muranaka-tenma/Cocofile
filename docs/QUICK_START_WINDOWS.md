# CocoFile - Windows実行クイックスタート

## ✅ ビルド完了！

**日時:** 2025-11-05 21:17 JST
**ビルド方法:** WSL2 クロスコンパイル
**ビルド時間:** 8分13秒
**ファイルサイズ:** 23MB

---

## 📍 ファイルの場所

### Windows上
```
C:\Users\muranaka-tenma\Documents\CocoFile.exe
```

### WSL2上（オリジナル）
```
/home/muranaka-tenma/CocoFile/src-tauri/target/x86_64-pc-windows-gnu/release/cocofile.exe
```

---

## 🚀 実行手順

### ステップ1: エクスプローラーで開く

1. **Windows + E** でエクスプローラーを開く
2. `C:\Users\muranaka-tenma\Documents\` に移動
3. `CocoFile.exe` を探す

### ステップ2: 実行

1. `CocoFile.exe` をダブルクリック
2. **セキュリティ警告が出た場合:**
   - 「詳細情報」をクリック
   - 「実行」をクリック

### ステップ3: 初回起動確認

**期待される動作:**
- ウィンドウが開く（1200x800px）
- 右下に「Dev Navigation」パネルが表示される
- 4つのボタンが表示される:
  - Main Search
  - Scan Index
  - Settings
  - Tag Management

---

## 🧪 テストチェックリスト

### 基本動作
- [ ] アプリが起動する
- [ ] ウィンドウが表示される
- [ ] Dev Navigationパネルが表示される

### S-001: メイン検索画面
- [ ] 「Main Search」ボタンをクリック
- [ ] 画面が切り替わる
- [ ] 検索ボックスが表示される
- [ ] キーワード入力できる
- [ ] 検索結果が表示される（モックデータ）

### S-002: 設定画面
- [ ] 「Settings」ボタンをクリック
- [ ] 設定画面が表示される
- [ ] 監視フォルダリストが表示される
- [ ] 「フォルダを追加」ボタンをクリック
- [ ] フォルダ選択ダイアログが開く

### S-003: スキャン・インデックス画面
- [ ] 「Scan Index」ボタンをクリック
- [ ] スキャン画面が表示される
- [ ] DB統計が表示される
- [ ] 「スキャン開始」ボタンが表示される

### S-004: タグ管理画面
- [ ] 「Tag Management」ボタンをクリック
- [ ] タグ一覧が表示される（モックデータ）
- [ ] 「タグを作成」ボタンが表示される

---

## ⚠️ トラブルシューティング

### 問題1: アプリが起動しない

#### エラー: "VCRUNTIME140.dll が見つかりません"

**原因:** Visual C++ Redistributable が不足

**対処:**
1. 以下のURLからダウンロード
   https://aka.ms/vs/17/release/vc_redist.x64.exe
2. インストール
3. PCを再起動
4. `CocoFile.exe` を再度実行

#### エラー: Windows Defender がブロック

**対処:**
1. 「詳細情報」をクリック
2. 「実行」をクリック
3. または、Windows セキュリティで除外設定:
   - 設定 → ウイルスと脅威の防止 → 除外設定
   - `C:\Users\muranaka-tenma\Documents\CocoFile.exe` を追加

### 問題2: ウィンドウが開くが真っ白

**原因:** WebView2 ランタイムが不足（稀）

**対処:**
1. Microsoft Edge をアップデート
2. WebView2 Runtime をインストール
   https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 問題3: データベースエラー

**現象:** 「Failed to initialize database」

**対処:**
1. データベースフォルダを削除
   - 場所: `C:\Users\muranaka-tenma\AppData\Local\com.cocofile.app\`
2. PowerShellで実行:
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\com.cocofile.app"
   ```
3. アプリを再起動

---

## 📊 期待される初回起動ログ

アプリが正常に起動すると、以下のファイルが作成されます:

```
C:\Users\muranaka-tenma\AppData\Local\com.cocofile.app\
├── data\
│   └── cocofile.db        ← SQLiteデータベース
└── logs\
    └── cocofile.log       ← ログファイル
```

### ログ確認方法

PowerShell:
```powershell
Get-Content "$env:LOCALAPPDATA\com.cocofile.app\logs\cocofile.log" -Tail 50
```

エクスプローラー:
```
Win + R → %LOCALAPPDATA%\com.cocofile.app\logs → Enter
```

---

## 🎯 テスト成功の判断基準

以下がすべて動作すれば **Phase 6 完了** です:

- [x] Windows版.exeビルド完了
- [ ] アプリが起動する
- [ ] 5つの画面すべてにアクセスできる
- [ ] エラーなしで動作する
- [ ] データベースが作成される

---

## 📝 バグを見つけた場合

以下の情報を記録してください:

### バグ報告フォーマット

```markdown
### バグ報告 #X

**日時:** 2025-11-05 XX:XX

**操作手順:**
1. CocoFile.exeを起動
2. 「Settings」ボタンをクリック
3. ...

**期待される動作:**
設定画面が表示される

**実際の動作:**
エラーメッセージが表示された

**エラーメッセージ:**
```
[エラーメッセージをここに貼り付け]
```

**環境:**
- OS: Windows 11 23H2
- CocoFile: v0.1.0
- ビルド: WSL2クロスコンパイル版

**ログ:**
[C:\Users\muranaka-tenma\AppData\Local\com.cocofile.app\logs\cocofile.log の内容]
```

---

## 🎉 テスト完了後

Phase 6のテストが完了したら、**Phase 7: 新機能実装** に進みます。

### Phase 7 予定
1. ファイル整理支援機能（S-006画面）
2. クラウドストレージ対応
3. ファイル移動提案エンジン

**設計書:** `docs/PHASE5_FILE_ORGANIZATION_DESIGN.md`

---

## 💡 開発者向けメモ

### ビルドに関する警告（非致命的）

```
warning: variant `Warn` is never constructed
warning: function `warn` is never used
warning: function `get_log_file_path` is never used
warning: struct `FileTags` is never constructed
```

これらは未使用のコードに対する警告で、動作には影響しません。

### 依存DLL

`cocofile.exe` は以下のDLLに依存しています（同梱されています）:

```
/home/muranaka-tenma/CocoFile/src-tauri/target/x86_64-pc-windows-gnu/release/
├── cocofile.exe            ← メイン実行ファイル
├── cocofile_lib.dll        ← ライブラリ
└── WebView2Loader.dll      ← WebView2ローダー
```

**注意:** 現在は.exeのみコピーしています。もしWebView2関連のエラーが出た場合、これらのDLLも同じフォルダにコピーする必要があります。

---

## 📚 関連ドキュメント

- **Phase 6 継続ガイド:** `docs/PHASE6_CONTINUATION_GUIDE.md`
- **プロジェクト状態:** `docs/PROJECT_STATE_SNAPSHOT.md`
- **詳細テスト手順:** `docs/WINDOWS_TEST_GUIDE.md`
- **ビルド手順:** `docs/WINDOWS_BUILD_GUIDE.md`

---

**作成日:** 2025-11-05 21:17 JST
**ビルド成果物:** `C:\Users\muranaka-tenma\Documents\CocoFile.exe`
**次のステップ:** Windows実機テスト実行
