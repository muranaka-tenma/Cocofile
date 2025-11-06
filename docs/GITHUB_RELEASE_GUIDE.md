# GitHub リリース手順書

**対象**: CocoFile v0.1.0 Alpha - Linux版リリース
**作成日**: 2025年11月5日
**所要時間**: 10-15分

---

## 前提条件チェック

以下が準備できていることを確認してください：

- ✅ GitHubアカウントを持っている
- ✅ CocoFileリポジトリのオーナー権限がある
- ✅ gitコマンドが使える環境（WSL2でOK）

---

## リリースに含めるファイル

以下のファイルが準備完了しています：

### 1. バイナリファイル（Linux版）

```
src-tauri/target/release/cocofile (15MB)
src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu (36MB)
```

**合計サイズ**: 51MB

### 2. ドキュメント

```
docs/USER_MANUAL.md - ユーザーマニュアル
docs/RELEASE_NOTES_v0.1.0.md - リリースノート
CHANGELOG.md - 変更履歴
README.md - プロジェクト説明
```

---

## リリース手順（3ステップ）

### Step 1: リリース用パッケージ作成（5分）

#### 1-1. リリースディレクトリ作成

WSL2ターミナルで以下を実行：

```bash
cd /home/muranaka-tenma/CocoFile
mkdir -p release/v0.1.0-linux-x86_64
```

#### 1-2. バイナリをコピー

```bash
# Rustバイナリをコピー
cp src-tauri/target/release/cocofile release/v0.1.0-linux-x86_64/

# Pythonバイナリをコピー
cp src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu release/v0.1.0-linux-x86_64/

# 実行権限を付与
chmod +x release/v0.1.0-linux-x86_64/cocofile
chmod +x release/v0.1.0-linux-x86_64/python-analyzer-x86_64-unknown-linux-gnu
```

#### 1-3. READMEを追加

```bash
cat > release/v0.1.0-linux-x86_64/README.txt << 'EOF'
CocoFile v0.1.0 Alpha - Linux版

## インストール方法

1. 両方のファイルを同じフォルダに配置してください：
   - cocofile (メインアプリケーション)
   - python-analyzer-x86_64-unknown-linux-gnu (分析エンジン)

2. 実行権限を確認：
   chmod +x cocofile
   chmod +x python-analyzer-x86_64-unknown-linux-gnu

3. アプリケーションを起動：
   ./cocofile

## 必要要件

- Linux x86_64
- glibc 2.31以降
- X11サーバー（WSL2の場合）

## ドキュメント

- ユーザーマニュアル: https://github.com/yourusername/CocoFile/blob/main/docs/USER_MANUAL.md
- リリースノート: https://github.com/yourusername/CocoFile/blob/main/docs/RELEASE_NOTES_v0.1.0.md

## サポート

問題が発生した場合:
https://github.com/yourusername/CocoFile/issues

## ライセンス

MIT License
EOF
```

#### 1-4. アーカイブを作成

```bash
cd release
tar -czf cocofile-v0.1.0-linux-x86_64.tar.gz v0.1.0-linux-x86_64/
cd ..
```

**完成**: `release/cocofile-v0.1.0-linux-x86_64.tar.gz` (約51MB)

---

### Step 2: Gitタグを作成（2分）

#### 2-1. 最新の変更をコミット

```bash
cd /home/muranaka-tenma/CocoFile

# 新しく作成したファイルをステージング
git add CHANGELOG.md
git add docs/GITHUB_RELEASE_GUIDE.md

# コミット
git commit -m "docs: Add CHANGELOG and GitHub release guide for v0.1.0"
```

#### 2-2. タグを作成

```bash
git tag -a v0.1.0 -m "CocoFile v0.1.0 Alpha - Linux版初回リリース

主な機能:
- 高速全文検索（SQLite FTS5 + N-gram）
- PDF/Excel/Word/PowerPoint対応
- タグ管理、お気に入り、重複検出
- 5画面UI実装

プラットフォーム: Linux x86_64
バイナリサイズ: 51MB (Rust 15MB + Python 36MB)
ライセンス: MIT"
```

#### 2-3. GitHubにプッシュ

```bash
# コミットをプッシュ
git push origin main

# タグをプッシュ
git push origin v0.1.0
```

---

### Step 3: GitHubでリリースを作成（5分）

#### 3-1. GitHubリリースページを開く

1. ブラウザで`https://github.com/yourusername/CocoFile`を開く
2. 右側の「Releases」をクリック
3. 「Draft a new release」ボタンをクリック

#### 3-2. リリース情報を入力

**Tag**: `v0.1.0` (プルダウンから選択)

**Release Title**: `CocoFile v0.1.0 Alpha - Linux版初回リリース`

**Description**（以下をコピペ）:

```markdown
# CocoFile v0.1.0 Alpha

完全ローカル動作のファイル管理デスクトップアプリケーションの初回リリース（MVP Alpha版）です。

## 🎯 主な機能

- **高速全文検索**: SQLite FTS5 + N-gram による日本語対応検索（0.5秒以内目標）
- **対応ファイル**: PDF、Excel (.xlsx/.xls)、Word (.docx)、PowerPoint (.pptx)
- **ファイル管理**: タグ管理、お気に入り、重複検出、最近使用
- **UI**: 5画面 + グローバルホットキー (Ctrl+Shift+F)

## 📦 インストール（Linux版）

### 必要要件
- Linux x86_64
- glibc 2.31以降
- X11サーバー（WSL2の場合）

### インストール手順

1. **ダウンロード**: `cocofile-v0.1.0-linux-x86_64.tar.gz` をダウンロード
2. **解凍**:
   ```bash
   tar -xzf cocofile-v0.1.0-linux-x86_64.tar.gz
   cd v0.1.0-linux-x86_64
   ```
3. **起動**:
   ```bash
   ./cocofile
   ```

## 📚 ドキュメント

- [ユーザーマニュアル](https://github.com/yourusername/CocoFile/blob/main/docs/USER_MANUAL.md)
- [リリースノート](https://github.com/yourusername/CocoFile/blob/main/docs/RELEASE_NOTES_v0.1.0.md)
- [変更履歴](https://github.com/yourusername/CocoFile/blob/main/CHANGELOG.md)

## ⚠️ 既知の問題

- **プラットフォーム**: Linux版のみ対応（Windows/macOSは今後対応予定）
- **未実装機能**: 日付フィルターUI、ファイルプレビュー、自動スキャン
- **パフォーマンス**: 500MB超のファイルは分析に時間がかかります

詳細は[リリースノート](https://github.com/yourusername/CocoFile/blob/main/docs/RELEASE_NOTES_v0.1.0.md)をご覧ください。

## 🐛 バグ報告・機能要望

[GitHub Issues](https://github.com/yourusername/CocoFile/issues)でお知らせください。

## 📅 今後の予定

- **v0.2.0** (2025年12月): Windows/macOS対応、追加UI機能
- **v0.3.0** (2026年1月): AI機能統合（Ollama、意味検索）

---

**リリース日**: 2025年11月5日
**バージョン**: 0.1.0 (MVP Alpha)
**ライセンス**: MIT License
**バイナリサイズ**: 51MB (Rust 15MB + Python 36MB)
```

#### 3-3. バイナリをアップロード

1. 「Attach binaries...」をクリック
2. `release/cocofile-v0.1.0-linux-x86_64.tar.gz` をドラッグ&ドロップ
3. アップロード完了を待つ

#### 3-4. リリースを公開

1. **「This is a pre-release」にチェック**（Alpha版のため）
2. 「Publish release」ボタンをクリック

---

## リリース完了後の確認

### 確認項目

- ✅ リリースページが正しく表示される
- ✅ `cocofile-v0.1.0-linux-x86_64.tar.gz` がダウンロードできる
- ✅ タグ `v0.1.0` が表示される
- ✅ ドキュメントへのリンクが動作する

### ダウンロードテスト

```bash
# 別のディレクトリでテスト
mkdir -p /tmp/cocofile-test
cd /tmp/cocofile-test

# ダウンロード（URLは実際のリリースURLに置き換え）
wget https://github.com/yourusername/CocoFile/releases/download/v0.1.0/cocofile-v0.1.0-linux-x86_64.tar.gz

# 解凍
tar -xzf cocofile-v0.1.0-linux-x86_64.tar.gz

# 起動テスト
cd v0.1.0-linux-x86_64
./cocofile
```

---

## トラブルシューティング

### Q1: `git push`で認証エラーが出る

**対処法**: GitHub Personal Access Tokenを使用

```bash
# トークンを環境変数に設定
export GITHUB_TOKEN=your_token_here

# URLにトークンを含めてプッシュ
git push https://$GITHUB_TOKEN@github.com/yourusername/CocoFile.git main
git push https://$GITHUB_TOKEN@github.com/yourusername/CocoFile.git v0.1.0
```

### Q2: タグがすでに存在する

**対処法**: タグを削除して再作成

```bash
# ローカルタグを削除
git tag -d v0.1.0

# リモートタグを削除
git push origin :refs/tags/v0.1.0

# 再度タグを作成
git tag -a v0.1.0 -m "..."
git push origin v0.1.0
```

### Q3: ファイルが大きすぎてGitHubにアップロードできない

**対処法**: GitHub Releasesは2GBまで対応しています。51MBなので問題ありません。

---

## 次のステップ

リリース完了後：

1. **Phase 8**: Windows/macOS版のビルド（1-2週間）
2. **フィードバック収集**: Alpha版ユーザーからの意見収集
3. **v0.2.0準備**: 追加機能の実装

詳細は [`docs/NEXT_STEPS_AFTER_PHASE7.md`](./NEXT_STEPS_AFTER_PHASE7.md) を参照してください。

---

**作成日**: 2025年11月5日
**対象バージョン**: v0.1.0 Alpha
**プラットフォーム**: Linux x86_64
**ライセンス**: MIT License
