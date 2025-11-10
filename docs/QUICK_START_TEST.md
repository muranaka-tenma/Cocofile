# CocoFile クイックスタートテスト

**所要時間**: 15-30分

セルフテストを素早く実施するための手順です。

---

## 🚀 インストール

### Linux (.deb)

```bash
# ダウンロード
cd ~/Downloads
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.deb

# インストール
sudo dpkg -i CocoFile_0.1.0_amd64.deb
sudo apt-get install -f

# 起動
cocofile
```

### Linux (AppImage)

```bash
# ダウンロード
cd ~/Downloads
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.AppImage

# 実行権限
chmod +x CocoFile_0.1.0_amd64.AppImage

# 起動
./CocoFile_0.1.0_amd64.AppImage
```

---

## ✅ 基本機能テスト（5分）

### 1. 起動確認

```bash
# アプリが起動するか
cocofile
```

- [ ] 10秒以内に起動
- [ ] UIが表示される

### 2. フォルダスキャン

**テスト用フォルダを作成**:

```bash
# テスト用フォルダ
mkdir -p ~/cocofile-test
cd ~/cocofile-test

# テストファイルを作成（10個のテキストファイル）
for i in {1..10}; do
  echo "これはテストファイル$i です。契約書 2024年" > "test$i.txt"
done

# PDFテスト用（pdftkがあれば）
# または、既存のPDFファイルをコピー
```

**CocoFileでスキャン**:

1. アプリで「フォルダを追加」
2. `~/cocofile-test` を選択
3. 「スキャン開始」

- [ ] スキャンが完了する
- [ ] 10ファイルが認識される

### 3. 検索テスト

**検索ボックスに「契約」と入力**:

- [ ] 検索結果が表示される
- [ ] 0.5秒以内に結果が出る
- [ ] 結果をクリックしてファイルが開ける

---

## ⚡ パフォーマンステスト（5分）

### メモリ使用量

```bash
# 別のターミナルで実行
ps aux | grep cocofile | grep -v grep
```

**確認**:
- アイドル時: _____ MB（目標: 150MB以下）
- スキャン時: _____ MB（目標: 500MB以下）

### 自動測定スクリプト

```bash
cd ~/CocoFile  # リポジトリのクローン先
./scripts/measure_performance.sh
```

---

## 🐛 問題があった場合

### ログを確認

```bash
# Linux
journalctl -f | grep cocofile

# または
~/.local/share/cocofile/logs/
```

### 問題を記録

`docs/SELF_TEST_CHECKLIST.md` の「バグ・問題点」セクションに記録

---

## 📝 結果の記録

### ファイルに記録

```bash
# SELF_TEST_CHECKLIST.md を編集
vim ~/CocoFile/docs/SELF_TEST_CHECKLIST.md

# または
code ~/CocoFile/docs/SELF_TEST_CHECKLIST.md
```

### Gitで記録

```bash
cd ~/CocoFile
git add docs/SELF_TEST_CHECKLIST.md
git commit -m "test: v0.1.1-alpha セルフテスト結果"
```

---

## 🚀 次のステップ

### バグがあった場合

1. 優先度を決定（Critical/High/Medium/Low）
2. 修正を実施
3. 再テスト

### バグがなかった場合

1. より詳細なテスト実施（`SELF_TEST_CHECKLIST.md`）
2. 大規模データでのテスト
3. Phase 13（v0.2.0開発）へ移行

---

**これで基本的なセルフテストは完了です！**
詳細なテストは `docs/SELF_TEST_CHECKLIST.md` を参照してください。
