# 🔵 次回開いたときに最初にやること

**最終更新**: 2025年11月14日 19:45

---

## ⚡ 今すぐ確認すべきこと

### 1. GitHub Actionsのビルド状況を確認

```bash
# ブラウザで以下にアクセス
https://github.com/muranaka-tenma/Cocofile/actions
```

**確認ポイント**：
- ✅ v0.1.17-alphaのビルドが**成功**しているか？
- ❌ ビルドが**失敗**しているか？

---

## 📋 ビルド成功していた場合

### ステップ1：バイナリをダウンロード

```bash
# GitHubリリースページにアクセス
https://github.com/muranaka-tenma/Cocofile/releases

# v0.1.17-alphaのLinux版をダウンロード（例）
# - CocoFile_0.1.17_amd64.deb
# - CocoFile_0.1.17_amd64.AppImage
```

### ステップ2：実行して動作確認

```bash
# AppImageの場合
chmod +x CocoFile_0.1.17_amd64.AppImage
./CocoFile_0.1.17_amd64.AppImage

# .debの場合
sudo dpkg -i CocoFile_0.1.17_amd64.deb
cocofile
```

**確認ポイント**：
- ✅ アプリが起動するか？
- ✅ デッドロック問題が解決されているか？（フリーズしないか？）
- ✅ ファイルスキャン機能が動作するか？

### ステップ3：README.mdを更新

```bash
cd /home/muranaka-tenma/CocoFile

# README.mdのバージョン表記をv0.1.1-alphaからv0.1.17-alphaに更新
# （Editツールを使用）

# コミットしてプッシュ
git add README.md
git commit -m "docs: Update version to v0.1.17-alpha in README"
git push origin main
```

---

## 🚨 ビルド失敗していた場合

### ステップ1：エラーログを確認

GitHub Actionsのログを開いて、どこで失敗したか確認：
- Pythonバイナリのビルド？
- Tauriのビルド？
- 依存関係のインストール？

### ステップ2：エラーを修正

エラー内容に応じて修正を加える

### ステップ3：タグを再プッシュ

```bash
cd /home/muranaka-tenma/CocoFile

# タグを削除して再作成
git tag -d v0.1.17-alpha
git push origin :refs/tags/v0.1.17-alpha

# 修正をコミット
git add .
git commit -m "fix: ビルドエラーを修正"
git push origin main

# タグを再作成してプッシュ
git tag v0.1.17-alpha
git push origin v0.1.17-alpha
```

---

## 📚 参考情報

### 重要ドキュメント

| ファイル | 用途 |
|---------|------|
| **CLAUDE.md** | プロジェクト設定 + 作業ログ（**唯一の真実の情報源**） |
| **check-status.sh** | プロジェクト現在地を自動表示（`cd CocoFile`で自動実行） |
| **README.md** | ユーザー向けドキュメント |

### 今回修正した問題

**デッドロック問題（v0.1.16で修正）**：
- **症状**: 実行ファイルが起動時にフリーズして応答しない
- **原因**: Rust側がPython起動完了メッセージを待ち続けるが、Python側のstdoutエラーでメッセージが届かない
- **解決**: Rust側の起動確認ロジックを削除し、プロセス起動直後にOkを返すように変更

詳細はGit履歴を参照：
```bash
git show 94e92b1  # v0.1.16のコミット
```

---

## 🎯 次の開発タスク（動作確認後）

1. **ユーザーフィードバック収集**
   - 実際に使ってみて問題点を洗い出す
   - パフォーマンス測定（メモリ、CPU、検索速度）

2. **新機能の追加**
   - ファイルプレビュー機能
   - 日付範囲フィルターUI
   - 自動スキャン機能

3. **ドキュメント改善**
   - トラブルシューティングガイド
   - 動画チュートリアル

---

**このファイルの削除タイミング**：
v0.1.17-alphaのリリースが完了し、動作確認が終わったら、このファイルは削除してOKです。
次の大きな作業が発生したら、また新しいNEXT.mdを作成してください。

---

**作成日**: 2025年11月14日
**作成者**: ココ（CocoFile開発アシスタント）
