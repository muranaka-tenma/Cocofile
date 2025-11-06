# CocoFile - ユーザーテストガイド

**作成日**: 2025年11月4日
**対象**: 初めてCocoFileをテストするユーザー
**環境**: WSL2 (Ubuntu) または Linux/macOS/Windows デスクトップ

---

## 🎯 テストの目的

このガイドでは、CocoFileが安全に動作することを段階的に確認します。

**確認すること**:
1. ✅ バックエンド機能が正常に動作するか
2. ✅ ファイルが絶対に変更・削除されないか
3. ✅ GUI が正常に起動するか（デスクトップ環境のみ）
4. ✅ 検索・スキャン機能が期待通りに動くか

---

## 📋 前提条件チェック

### 環境確認

```bash
# 現在のディレクトリ確認
pwd
# 期待: /home/muranaka-tenma/CocoFile

# 必要なファイルの存在確認
ls -la src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu
ls -la test_files/
```

**期待される出力**:
- `python-analyzer-x86_64-unknown-linux-gnu` (36MB) が存在
- `test_files/` ディレクトリにサンプルファイルが存在

---

## 🧪 Phase 1: バックエンド機能テスト（WSL2可能）

### テスト1-1: Pythonバックエンド ヘルスチェック

**目的**: 分析エンジンが正常に起動するか確認

```bash
cd ~/CocoFile/src-tauri/binaries
echo '{"command":"health"}' | ./python-analyzer-x86_64-unknown-linux-gnu
```

**期待される出力**:
```json
{"status": "success", "data": {"message": "Python backend started"}}
{"status": "success", "data": {"message": "Python backend is healthy"}}
```

✅ **判定**: 上記のメッセージが表示されれば合格

---

### テスト1-2: Excelファイル分析

**目的**: Excel (.xlsx) ファイルからテキストを抽出できるか確認

```bash
cd ~/CocoFile/src-tauri/binaries
cat << 'EOF' | ./python-analyzer-x86_64-unknown-linux-gnu
{"command":"analyze_excel","path":"/home/muranaka-tenma/CocoFile/test_files/売上データ2024.xlsx"}
EOF
```

**期待される出力**:
```json
{
  "status": "success",
  "data": {
    "text": "[Sheet: 売上データ]\n商品名 価格 数量\nノートPC 98000 5\nマウス 2500 10\nキーボード 8500 8",
    "sheet_count": 1,
    "file_size": 4987,
    "success": true
  }
}
```

✅ **判定**: 売上データの内容が表示されれば合格

---

### テスト1-3: PowerPointファイル分析

**目的**: PowerPoint (.pptx) ファイルからテキストを抽出できるか確認

```bash
cd ~/CocoFile/src-tauri/binaries
cat << 'EOF' | ./python-analyzer-x86_64-unknown-linux-gnu
{"command":"analyze_ppt","path":"/home/muranaka-tenma/CocoFile/test_files/営業報告2024.pptx"}
EOF
```

**期待される出力**:
```json
{
  "status": "success",
  "data": {
    "text": "[Slide 1]\n2024年度 営業報告\n第3四半期実績サマリー\n[Slide 2]\n売上実績\n総売上: 1,250万円\n前年比: 115%",
    "slide_count": 2,
    "file_size": 29224,
    "success": true
  }
}
```

✅ **判定**: スライドの内容が表示されれば合格

---

### テスト1-4: ファイルが変更されていないことを確認

**目的**: 分析後もファイルが無傷であることを確認

```bash
# 分析前のファイルハッシュ値を記録
cd ~/CocoFile/test_files
sha256sum 売上データ2024.xlsx > /tmp/before_hash.txt
sha256sum 営業報告2024.pptx >> /tmp/before_hash.txt

# 再度分析を実行（上記のテスト1-2、1-3を実行）
# （分析コマンドをもう一度実行してください）

# 分析後のハッシュ値を確認
sha256sum 売上データ2024.xlsx > /tmp/after_hash.txt
sha256sum 営業報告2024.pptx >> /tmp/after_hash.txt

# ハッシュ値を比較
diff /tmp/before_hash.txt /tmp/after_hash.txt
```

**期待される出力**:
```
（何も表示されない = ファイルが全く変更されていない）
```

✅ **判定**: 何も出力されなければ合格（ファイル無傷）

---

## 🖥️ Phase 2: GUIテスト（デスクトップ環境のみ）

⚠️ **WSL2では実行不可**: X11サーバー（VcXsrv等）のセットアップが必要

### 方法A: Windows上でテスト（推奨）

#### ステップ1: Windows環境でビルド

```powershell
# PowerShellで実行
cd C:\path\to\CocoFile
npm install
cd src-tauri
cargo build --release
```

#### ステップ2: アプリケーション起動

```powershell
cd src-tauri
cargo tauri dev
```

または、リリースビルドを作成:

```powershell
cd src-tauri
cargo tauri build
```

**期待される動作**:
- CocoFileのウィンドウが開く
- 検索ボックスが表示される
- メニューが表示される

---

### 方法B: macOSでテスト

```bash
cd ~/CocoFile
npm install
cd src-tauri
cargo tauri dev
```

---

### 方法C: Linux デスクトップ環境でテスト

```bash
cd ~/CocoFile

# 必要なシステム依存関係をインストール
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# アプリケーション起動
cd src-tauri
cargo tauri dev
```

---

## 🔍 Phase 3: 実際のファイルで小規模テスト

⚠️ **重要**: 最初は**必ず重要でないファイル**でテストしてください

### ステップ3-1: テストディレクトリを作成

```bash
# 専用のテストディレクトリ作成
mkdir ~/cocofile_test_data
cd ~/cocofile_test_data

# サンプルファイルをコピー（重要でないファイルを選んでください）
cp ~/Documents/不要なファイル1.xlsx .
cp ~/Documents/不要なファイル2.pdf .
```

### ステップ3-2: CocoFileでスキャン

1. CocoFileを起動
2. 「フォルダをスキャン」ボタンをクリック
3. `~/cocofile_test_data` を選択
4. スキャン開始

**確認すること**:
- スキャンが完了するか
- ファイル一覧が表示されるか
- 検索が動作するか

### ステップ3-3: ファイルが変更されていないことを確認

```bash
# スキャン前のハッシュ値
cd ~/cocofile_test_data
sha256sum * > /tmp/before_scan.txt

# CocoFileでスキャン実行（上記手順）

# スキャン後のハッシュ値
sha256sum * > /tmp/after_scan.txt

# 比較
diff /tmp/before_scan.txt /tmp/after_scan.txt
```

**期待される結果**:
```
（何も表示されない = ファイルは全く変更されていない）
```

✅ **判定**: 差分がなければ合格

---

## 📊 Phase 4: データベース確認

### ステップ4-1: データベースの場所を確認

**Linux/WSL2**:
```bash
ls -lh ~/.local/share/cocofile/
```

**macOS**:
```bash
ls -lh ~/Library/Application\ Support/cocofile/
```

**Windows**:
```powershell
Get-ChildItem $env:APPDATA\cocofile\
```

**期待される出力**:
```
cocofile.db  （数KB〜数MB、スキャンしたファイル数に依存）
```

### ステップ4-2: データベースの内容を確認

```bash
# Linux/WSL2
sqlite3 ~/.local/share/cocofile/cocofile.db "SELECT COUNT(*) FROM file_metadata;"
```

**期待される出力**:
```
5  （スキャンしたファイル数）
```

### ステップ4-3: データベースの健全性チェック

```bash
sqlite3 ~/.local/share/cocofile/cocofile.db "PRAGMA integrity_check;"
```

**期待される出力**:
```
ok
```

---

## 🛡️ 安全性確認チェックリスト

テスト完了後、以下を確認してください:

- [ ] ✅ Pythonバックエンドが正常に起動した
- [ ] ✅ Excelファイル分析が成功した
- [ ] ✅ PowerPointファイル分析が成功した
- [ ] ✅ 分析前後でファイルのハッシュ値が同一（ファイル無傷）
- [ ] ✅ CocoFile GUIが起動した（デスクトップ環境）
- [ ] ✅ テストディレクトリのスキャンが成功した
- [ ] ✅ スキャン前後でファイルが無傷であることを確認した
- [ ] ✅ データベースが正常に作成された
- [ ] ✅ データベースの整合性チェックが成功した

---

## ⚠️ トラブルシューティング

### 問題1: Pythonバックエンドが起動しない

**症状**: `{"status": "error", ...}` が返ってくる

**原因**: バイナリの権限不足

**対処法**:
```bash
chmod +x ~/CocoFile/src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu
```

---

### 問題2: GUI が起動しない（WSL2）

**症状**: `Error: cannot open display`

**原因**: WSL2にはディスプレイサーバーがない

**対処法**:
1. **Option A**: Windows/macOS/Linux デスクトップ環境でテスト
2. **Option B**: WSL2にX11サーバー（VcXsrv）をセットアップ

---

### 問題3: cargo tauri dev でエラー

**症状**: `error: no such command: 'tauri'`

**原因**: cargo-tauri CLIが未インストール

**対処法**:
```bash
cargo install tauri-cli
```

---

### 問題4: データベースが見つからない

**症状**: `~/.local/share/cocofile/cocofile.db` が存在しない

**原因**: まだ一度もスキャンしていない

**対処法**:
- 一度フォルダをスキャンすると自動的に作成されます

---

## 🎯 次のステップ

### テスト成功後

Phase 1-4が全て成功したら、以下に進んでください:

#### 短期（1週間以内）
1. **小規模テスト**: 重要でないファイル 10-100個でテスト
2. **日常使用**: 毎日検索機能を使ってみる
3. **データベースバックアップ**: 定期的にバックアップを取る

#### 中期（2-4週間）
4. **中規模テスト**: 実際のドキュメント 1,000ファイルでテスト
5. **パフォーマンス確認**: メモリ使用量・検索速度を確認

#### 長期（1-2ヶ月）
6. **全面展開**: 全てのドキュメントをスキャン
7. **週次バックアップ**: 自動化を検討

---

## 📞 問題が発生した場合

### データベースをリセットしたい場合

```bash
# Linux/WSL2
rm ~/.local/share/cocofile/cocofile.db

# macOS
rm ~/Library/Application\ Support/cocofile/cocofile.db

# Windows
Remove-Item "$env:APPDATA\cocofile\cocofile.db"
```

**次回起動時に自動的に新しいデータベースが作成されます。**

⚠️ **注意**: ユーザーのファイル自体は影響を受けません。

---

## 🔗 関連ドキュメント

- `/docs/SAFETY_AND_DATA_MANAGEMENT.md` - 安全性・データ管理の詳細
- `/docs/INTEGRATION_TEST_REPORT.md` - 統合テスト結果
- `/SETUP.md` - 環境構築ガイド
- `/README.md` - プロジェクト概要

---

**作成日**: 2025年11月4日
**ステータス**: ✅ バックエンド機能テスト完了（WSL2環境）
**次回更新**: GUIテスト実施後

---

## 🎉 まとめ

**CocoFileは安全にテストできます**

- ✅ バックエンド機能は全て正常動作確認済み
- ✅ ファイルは絶対に変更・削除されない
- ✅ データベースのみが書き込み対象
- ✅ 最悪の場合もデータベースをリセットすれば復旧可能

**推奨**: まずPhase 1（バックエンドテスト）から始めて、徐々にPhase 3（実ファイルテスト）へ進んでください。
