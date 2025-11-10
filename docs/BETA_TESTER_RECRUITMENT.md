# ベータテスター募集！

**CocoFile v0.1.1-alpha** のベータテスターを募集しています！

---

## 📋 CocoFile とは？

CocoFileは、**完全ローカル動作**のファイル管理デスクトップアプリです。
PDF、Excel、Word、PowerPointファイルの内容を全文検索し、効率的にファイルを見つけることができます。

### 主な特徴

- ✅ **完全オフライン動作** - データは一切外部に送信されません
- ✅ **高速全文検索** - SQLite FTS5 + N-gram tokenizer による日本語対応検索
- ✅ **多形式対応** - PDF、Excel、Word、PowerPoint
- ✅ **クロスプラットフォーム** - Linux、Windows、macOS 全対応

---

## 🎯 募集内容

### 募集人数

**5-10名**

### 対象ユーザー

以下のいずれかに該当する方：

- ✅ Linux/Windows/macOS いずれかを使用
- ✅ ローカルに多数のファイル（PDF、Office文書）を保存している
- ✅ ファイルを素早く見つけたいニーズがある
- ✅ フィードバックを提供できる（日本語OK）

### 期間

**2-4週間**（2025年11月10日〜12月上旬予定）

---

## 📥 ダウンロード

### v0.1.1-alpha

**[リリースページ](https://github.com/muranaka-tenma/Cocofile/releases/tag/v0.1.1-alpha)**

#### 🐧 Linux
- [.deb (Debian/Ubuntu)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.deb) - 5.2MB
- [AppImage (全ディストリビューション)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.AppImage) - 77.7MB

#### 🪟 Windows
- [MSI Installer](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_x64_en-US.msi) - 4.6MB
- [NSIS Installer](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_x64-setup.exe) - 3.2MB

#### 🍎 macOS
- [DMG (Apple Silicon)](https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_aarch64.dmg) - 4.7MB

---

## 📝 テスト内容

### 基本機能テスト

以下の機能をテストしてフィードバックをお願いします：

#### 必須テスト項目

- [ ] **インストール** - 手順が明確か、問題なくインストールできるか
- [ ] **起動** - アプリが正常に起動するか
- [ ] **フォルダスキャン** - フォルダを追加してスキャンできるか
- [ ] **検索** - キーワード検索が正しく動作するか、速度は満足できるか
- [ ] **ファイル操作** - 検索結果からファイルを開けるか

#### オプション

- [ ] 大量ファイル（10,000+）のスキャン
- [ ] 大きなファイル（100MB+）の処理
- [ ] 日本語ファイル名の処理

### パフォーマンス測定

可能であれば、以下を測定してください：

- メモリ使用量（アイドル時、スキャン時、検索時）
- CPU使用率（アイドル時、スキャン時）
- 検索速度の体感

---

## 💬 フィードバック方法

### 1. GitHubフィードバック

以下のいずれかの方法でフィードバックをお願いします：

#### バグ報告
- [Bug Report](https://github.com/muranaka-tenma/Cocofile/issues/new?template=bug_report.md)

#### 機能要望
- [Feature Request](https://github.com/muranaka-tenma/Cocofile/issues/new?template=feature_request.md)

#### 全体的なフィードバック
- [Beta Feedback](https://github.com/muranaka-tenma/Cocofile/issues/new?template=beta_feedback.md)

### 2. フィードバック内容

以下を含めてください：

**環境情報**:
- OS とバージョン（例: Ubuntu 24.04 / Windows 11 / macOS 14.2）
- インストール方法（例: .deb / MSI / DMG）

**使用感**（1-5点）:
- 全体的な満足度
- インストールの容易さ
- UIの使いやすさ
- 検索速度

**コメント**:
- 良かった点
- 改善してほしい点
- 遭遇したバグ
- その他の感想

---

## 📖 ガイド

### ベータテストガイド

詳細な手順は **[docs/BETA_TEST_GUIDE.md](https://github.com/muranaka-tenma/Cocofile/blob/main/docs/BETA_TEST_GUIDE.md)** を参照してください。

インストール方法、テスト項目、トラブルシューティングを記載しています。

---

## 🎁 参加特典

- v0.1.2以降のリリースに名前を掲載（希望者のみ）
- 開発の優先順位に影響（フィードバックを優先的に反映）
- 早期アクセス（将来のバージョンを先行体験）

---

## ❓ よくある質問

### Q: インストールが難しそう...

A: 各プラットフォームの標準的なインストーラーを用意しています。[ベータテストガイド](https://github.com/muranaka-tenma/Cocofile/blob/main/docs/BETA_TEST_GUIDE.md) に詳細な手順があります。

### Q: どれくらい時間がかかる？

A: インストールとテストで30分〜1時間程度です。その後、実際に使いながらフィードバックをお願いします。

### Q: プログラミング知識は必要？

A: 不要です。普通に使って感想をいただければ十分です。

### Q: Windows Defender に警告が出る

A: 開発者署名がないため警告が出ますが、安全です。「詳細情報」→「実行」で起動できます。

### Q: macOS で「開発元を確認できません」

A: 右クリック → 「開く」で起動できます。詳細は[ベータテストガイド](https://github.com/muranaka-tenma/Cocofile/blob/main/docs/BETA_TEST_GUIDE.md#macos)を参照。

---

## 📞 サポート

### 質問・相談

- **GitHub Issues**: https://github.com/muranaka-tenma/Cocofile/issues
- **GitHub Discussions**: https://github.com/muranaka-tenma/Cocofile/discussions

---

## 🙏 参加方法

**このIssueにコメントで参加表明してください！**

以下の形式でコメントをお願いします：

```
参加します！

- OS: （例: Ubuntu 24.04 / Windows 11 / macOS 14.2）
- インストール方法: （例: .deb / MSI / DMG）
- 簡単な自己紹介:（任意）
```

---

**皆様のフィードバックが CocoFile をより良いプロダクトにします。**
**ご参加お待ちしています！🎉**

---

**プロジェクト**: CocoFile（ココファイル）
**リリース**: v0.1.1-alpha
**リポジトリ**: https://github.com/muranaka-tenma/Cocofile
