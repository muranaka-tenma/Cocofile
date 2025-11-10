# CocoFile ベータテストガイド

**バージョン**: v0.1.1-alpha
**最終更新**: 2025年11月10日

ベータテストにご参加いただきありがとうございます！このガイドでは、CocoFileのインストール方法、テスト項目、フィードバック方法をご案内します。

---

## 📋 目次

1. [事前準備](#事前準備)
2. [インストール](#インストール)
3. [基本的な使い方](#基本的な使い方)
4. [テスト項目](#テスト項目)
5. [フィードバック方法](#フィードバック方法)
6. [既知の問題](#既知の問題)
7. [トラブルシューティング](#トラブルシューティング)

---

## 事前準備

### システム要件

#### Linux
- Ubuntu 20.04以降、または他のLinuxディストリビューション
- 依存パッケージ:
  - `libwebkit2gtk-4.1` (Ubuntu 24.04) or `libwebkit2gtk-4.0` (Ubuntu 22.04)
  - `libgtk-3-0`
  - `libsqlite3-0`

#### Windows
- Windows 10 (1803以降) または Windows 11
- .NET Framework 4.7.2以降（通常はプリインストール済み）

#### macOS
- macOS 13 (Ventura) 以降
- Apple Silicon (M1/M2/M3) または Intel Mac

### ダウンロード

GitHub Releasesからダウンロード:
https://github.com/muranaka-tenma/Cocofile/releases/tag/v0.1.1-alpha

---

## インストール

### Linux

#### 方法1: .deb パッケージ（Ubuntu/Debian系）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.deb

# インストール
sudo dpkg -i CocoFile_0.1.0_amd64.deb

# 依存関係を修正（必要に応じて）
sudo apt-get install -f

# 起動
cocofile
```

#### 方法2: AppImage（全ディストリビューション）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.0_amd64.AppImage

# 実行権限を付与
chmod +x CocoFile_0.1.0_amd64.AppImage

# 起動
./CocoFile_0.1.0_amd64.AppImage
```

### Windows

#### 方法1: MSI インストーラー

1. `CocoFile_0.1.0_x64_en-US.msi` をダウンロード
2. ダブルクリックして実行
3. インストールウィザードに従う
4. スタートメニューから「CocoFile」を起動

#### 方法2: NSIS インストーラー

1. `CocoFile_0.1.0_x64-setup.exe` をダウンロード
2. ダブルクリックして実行
3. Windows Defender SmartScreenが表示された場合:
   - 「詳細情報」→「実行」
4. インストールウィザードに従う
5. デスクトップアイコンまたはスタートメニューから起動

### macOS

1. `CocoFile_0.1.0_aarch64.dmg` をダウンロード（Apple Siliconの場合）
2. DMGファイルをダブルクリック
3. CocoFileアイコンをApplicationsフォルダにドラッグ
4. Applicationフォルダから起動
5. 初回起動時、「開発元を確認できません」と表示された場合:
   - 右クリック → 「開く」
   - または、システム設定 → プライバシーとセキュリティ → 「このまま開く」

---

## 基本的な使い方

### 1. フォルダを追加

1. アプリを起動
2. 「フォルダを追加」ボタンをクリック
3. スキャンしたいフォルダを選択
4. 「スキャン開始」をクリック

### 2. ファイルを検索

1. 検索ボックスにキーワードを入力
2. 検索結果が即座に表示されます
3. ファイルタイプでフィルター可能
4. 結果をクリックしてファイルを開く

### 3. タグを追加

1. ファイルを選択
2. 「タグを追加」をクリック
3. タグ名を入力
4. タグでフィルタリング可能

---

## テスト項目

以下の項目をテストし、動作状況や問題をフィードバックしてください。

### 必須テスト項目

#### 基本機能

- [ ] **インストール**
  - インストール手順が明確か
  - インストールが正常に完了したか
  - アンインストールできるか

- [ ] **起動**
  - アプリが起動するか
  - 起動時間は許容範囲か（10秒以内）

- [ ] **フォルダスキャン**
  - フォルダを追加できるか
  - スキャンが正常に実行されるか
  - 進捗表示が正しく動作するか
  - スキャンをキャンセルできるか

- [ ] **検索**
  - キーワード検索が機能するか
  - 検索速度は満足できるか（0.5秒以内が目標）
  - 日本語検索が正しく動作するか
  - ファイルタイプフィルターが機能するか

- [ ] **ファイル操作**
  - 検索結果からファイルを開けるか
  - フォルダを開く機能が動作するか

#### パフォーマンス

- [ ] **メモリ使用量**
  - アイドル時のメモリ使用量（目標: 150MB以下）
  - スキャン時のメモリ使用量（目標: 500MB以下）

- [ ] **CPU使用率**
  - アイドル時のCPU使用率（目標: 1%以下）
  - スキャン時のCPU使用率（目標: 50%以下）

- [ ] **検索速度**
  - 小規模（100ファイル未満）: 即座
  - 中規模（1000ファイル）: 0.5秒以内
  - 大規模（10000ファイル）: 1秒以内

### オプションテスト項目

- [ ] **大量ファイルのスキャン**
  - 10,000ファイル以上
  - 100,000ファイル以上（可能であれば）

- [ ] **大きなファイル**
  - 100MB以上のPDF
  - 50MB以上のExcel

- [ ] **特殊なファイル名**
  - 日本語ファイル名
  - スペース含む名前
  - 特殊文字含む名前

---

## フィードバック方法

### 1. バグ報告

バグを見つけた場合:

1. GitHubでIssueを作成: https://github.com/muranaka-tenma/Cocofile/issues/new/choose
2. 「Bug Report」テンプレートを選択
3. 以下の情報を含める:
   - 使用OS・バージョン
   - インストール方法
   - 再現手順
   - 期待される動作
   - 実際の動作
   - スクリーンショット（可能であれば）

### 2. 機能要望

新機能のアイデアがある場合:

1. GitHubでIssueを作成
2. 「Feature Request」テンプレートを選択
3. 以下を記載:
   - 欲しい機能
   - 理由・ユースケース
   - 代替案（あれば）

### 3. 全体的なフィードバック

1. GitHubでIssueを作成
2. 「Beta Feedback」テンプレートを選択
3. またはフィードバックフォーム（準備中）を使用

### フィードバック内容

以下の情報を含めてください:

**環境情報**:
- OS: (例) Ubuntu 24.04 / Windows 11 / macOS 14.2
- インストール方法: (例) .deb / MSI / DMG / AppImage
- ハードウェア: (例) CPU, RAM

**使用感**（1-5点で評価）:
- 全体的な満足度
- インストールの容易さ
- UIの使いやすさ
- 検索速度

**パフォーマンス**:
- メモリ使用量: (例) 120MB
- CPU使用率: (例) 2%
- 検索速度の感想: 速い/普通/遅い

**コメント**:
- 良かった点
- 改善してほしい点
- 遭遇した問題
- その他の感想

---

## 既知の問題

現時点で既知の問題はありません。

※ ベータテストで発見された問題はここに追加されます。

---

## トラブルシューティング

### Linux

#### アプリが起動しない

```bash
# 依存関係を確認
ldd /usr/bin/cocofile

# 不足しているパッケージをインストール
sudo apt-get install libwebkit2gtk-4.1-0 libgtk-3-0 libsqlite3-0
```

#### AppImageが起動しない

```bash
# FUSE をインストール
sudo apt-get install fuse libfuse2

# または、FUSE不要で実行
./CocoFile_0.1.0_amd64.AppImage --appimage-extract-and-run
```

### Windows

#### Windows Defender SmartScreen

1. 「詳細情報」をクリック
2. 「実行」をクリック

#### インストールできない

- 管理者権限で実行
- .NET Framework 4.7.2以降がインストールされているか確認

### macOS

#### 「開発元を確認できません」

方法1:
1. アプリを右クリック
2. 「開く」を選択
3. 「開く」をクリック

方法2:
1. システム設定 → プライバシーとセキュリティ
2. 「このまま開く」をクリック

#### Apple Siliconで動作しない

- `CocoFile_0.1.0_aarch64.dmg` をダウンロードしていることを確認
- Rosetta 2がインストールされているか確認（Intel Macの場合）

---

## サポート

### 質問・相談

- GitHub Discussions: https://github.com/muranaka-tenma/Cocofile/discussions
- GitHub Issues: https://github.com/muranaka-tenma/Cocofile/issues

### ドキュメント

- README: https://github.com/muranaka-tenma/Cocofile/blob/main/README.md
- インストールガイド: `docs/INSTALL_GUIDE.md`
- リリースノート: `docs/RELEASE_NOTES_v0.1.1.md`

---

## 謝辞

ベータテストにご協力いただきありがとうございます！
皆様のフィードバックが、CocoFileをより良いプロダクトにします。

---

**Happy Testing! 🎉**

**プロジェクト**: CocoFile（ココファイル）
**バージョン**: v0.1.1-alpha
**リリース**: https://github.com/muranaka-tenma/Cocofile/releases/tag/v0.1.1-alpha
