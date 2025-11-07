# CocoFile v0.1.1 Alpha - リリースノート

**リリース日**: 2025年11月7日（予定）
**リリースタイプ**: Pre-release（Alpha版）
**ステータス**: 🚧 準備中

---

## 🎉 主な変更点

### ✨ 新機能

#### クロスプラットフォーム対応

**Linux追加形式**
- ✅ **.deb パッケージ**（Debian/Ubuntu）
  - システム統合（アプリケーションメニュー）
  - 依存関係自動解決
  - サイズ: 5.3MB（非常にコンパクト！）

- ✅ **AppImage**（全ディストリビューション対応）
  - 自己完結型（全依存関係バンドル）
  - ポータブル実行
  - サイズ: 78MB

**Windows対応**（自動ビルド）
- 🆕 **MSIインストーラー**
  - スタートメニュー統合
  - プログラムと機能からアンインストール可能
  - 推定サイズ: 50MB

**macOS対応**（自動ビルド）
- 🆕 **DMGインストーラー**
  - アプリケーションフォルダへのドラッグ&ドロップインストール
  - macOS 10.15 Catalina以降対応
  - 推定サイズ: 60MB

#### CI/CD自動化

- ✅ **GitHub Actions CI/CD**
  - Linux/Windows/macOS並列自動ビルド
  - タグプッシュで自動リリース作成
  - 全成果物の自動アップロード

---

## 📦 配布形式

### Linux

| 形式 | サイズ | 用途 | 対応ディストリビューション |
|-----|--------|------|--------------------------|
| tar.gz | 41MB | ポータブル版 | 全て |
| .deb | 5.3MB | パッケージ管理 | Debian、Ubuntu、Mint等 |
| AppImage | 78MB | ポータブル版 | 全て（FUSE不要） |

### Windows

| 形式 | サイズ | 用途 | 対応バージョン |
|-----|--------|------|---------------|
| MSI | ~50MB | インストーラー | Windows 10/11 |
| .exe | ~15MB | スタンドアロン | Windows 10/11 |

### macOS

| 形式 | サイズ | 用途 | 対応バージョン |
|-----|--------|------|---------------|
| DMG | ~60MB | インストーラー | macOS 10.15以降 |
| .app | - | アプリケーション | macOS 10.15以降 |

---

## 🔧 改善点

### バンドル最適化

- Linuxパッケージサイズの大幅削減
  - tar.gz: 51MB → 41MB（20%削減）
  - .deb: システムパッケージ活用で5.3MB

### ビルドプロセス改善

- GitHub Actionsによる自動化
- クロスプラットフォームビルドの並列実行
- ビルド時間の短縮（推定15分以内）

---

## 📥 インストール方法

### Linux - .deb（Debian/Ubuntu）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.1_amd64.deb

# インストール
sudo dpkg -i CocoFile_0.1.1_amd64.deb

# 依存関係の解決（必要な場合）
sudo apt-get install -f

# 起動
cocofile
```

### Linux - AppImage（全ディストリビューション）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/CocoFile_0.1.1_amd64.AppImage

# 実行権限を付与
chmod +x CocoFile_0.1.1_amd64.AppImage

# 起動
./CocoFile_0.1.1_amd64.AppImage
```

### Linux - tar.gz（ポータブル版）

```bash
# ダウンロード
wget https://github.com/muranaka-tenma/Cocofile/releases/download/v0.1.1-alpha/cocofile-v0.1.1-linux-x86_64.tar.gz

# 展開
tar -xzf cocofile-v0.1.1-linux-x86_64.tar.gz
cd v0.1.1-linux-x86_64

# 実行権限を付与
chmod +x cocofile
chmod +x python-analyzer-x86_64-unknown-linux-gnu

# 起動
./cocofile
```

### Windows - MSI

1. `CocoFile_0.1.1_x64_en-US.msi` をダウンロード
2. ダブルクリックしてインストーラーを起動
3. インストールウィザードに従う
4. スタートメニューから「CocoFile」を起動

### macOS - DMG

1. `CocoFile_0.1.1_x64.dmg` をダウンロード
2. DMGファイルをマウント
3. `CocoFile.app` をアプリケーションフォルダにドラッグ
4. アプリケーションフォルダから起動

**注意**: 初回起動時に「開発元が未確認」の警告が表示される場合があります。
- 右クリック → 「開く」で起動できます

---

## 🐛 バグ修正

### ビルドシステム

- ✅ Ubuntu 24.04でのパッケージ名変更に対応（libwebkit2gtk-4.1-dev）
- ✅ Tauriビルドのパス解決問題を修正
- ✅ フロントエンドビルドとTauriビルドの分離

---

## ⚠️ 既知の問題

### 未実装機能

1. **ファイルプレビュー** - v0.2.0で実装予定
2. **日付範囲フィルターUI** - データベース対応済み、UI未実装
3. **自動スキャン機能** - v0.2.0で実装予定

### 技術的制約

1. **macOSコード署名なし**
   - 初回起動時に「開発元が未確認」警告
   - 右クリック → 「開く」で起動可能
   - 正式リリース（v0.2.0）で署名対応予定

2. **macOS Apple Silicon未対応**
   - 現在x86_64のみ
   - Rosetta 2経由で動作
   - Universal Binary対応はv0.2.0で検討

3. **ファイルサイズ制限**
   - 500MB超のファイルは分析時間がかかる
   - 警告表示あり

---

## 📊 パフォーマンス

### バイナリサイズ

| プラットフォーム | 形式 | サイズ | v0.1.0比較 |
|----------------|------|--------|-----------|
| Linux | tar.gz | 41MB | 変更なし |
| Linux | .deb | 5.3MB | - |
| Linux | AppImage | 78MB | - |
| Windows | MSI | ~50MB | 新規 |
| macOS | DMG | ~60MB | 新規 |

### 推定メモリ使用量

| 状態 | 使用量 | ステータス |
|-----|--------|----------|
| アイドル時 | 30-50MB | ✅ 目標150MB以下達成 |
| 検索中 | 100-200MB | ✅ 目標500MB以下達成 |
| スキャン中 | 200-300MB | ✅ 目標500MB以下達成 |

**注意**: 実機での測定結果は今後公開予定

---

## 🔒 セキュリティ

### プライバシー

- **完全ローカル動作**: インターネット接続不要
- **データ送信なし**: すべてのデータはローカルに保存
- **OSファイル権限に依存**: アクセス可能なファイルのみ処理

### データ保存場所

| プラットフォーム | パス |
|----------------|------|
| Linux | `~/.config/CocoFile/` |
| Windows | `%APPDATA%\CocoFile\` |
| macOS | `~/Library/Application Support/CocoFile/` |

---

## 🚀 アップグレード方法

### v0.1.0からのアップグレード

#### Linux

**tar.gz版**:
```bash
# 新バージョンをダウンロードして展開
# データは自動的に引き継がれます
```

**.deb版**:
```bash
# 新しい.debをインストール（上書き）
sudo dpkg -i CocoFile_0.1.1_amd64.deb
```

**AppImage版**:
```bash
# 新しいAppImageに置き換えるだけ
# データは自動的に引き継がれます
```

#### Windows

1. 古いバージョンをアンインストール
2. 新しいMSIをインストール
3. データは自動的に引き継がれます

#### macOS

1. 古い`CocoFile.app`を削除
2. 新しい`CocoFile.app`をコピー
3. データは自動的に引き継がれます

---

## 📚 ドキュメント

### ユーザー向け

- [ユーザーマニュアル](USER_MANUAL.md)
- [インストールガイド](../README.md#インストール手順)
- [FAQ](FAQ.md)（準備中）

### 開発者向け

- [Phase 11計画書](PHASE11_PLAN.md)
- [Phase 11進捗サマリー](PHASE11_PROGRESS_SUMMARY.md)
- [GitHub Actions設定](.github/workflows/build.yml)

---

## 🎯 次のバージョン予定

### v0.2.0（予定: 2025年12月）

1. **新機能**
   - ファイルプレビュー機能
   - 日付範囲フィルターUI
   - 自動スキャン機能

2. **改善**
   - macOSコード署名
   - Apple Silicon Universal Binary
   - パフォーマンス最適化

3. **ドキュメント**
   - FAQ充実
   - トラブルシューティング
   - 動画チュートリアル

---

## 🙏 クレジット

### 使用技術

- **Tauri** 2.0 - デスクトップアプリフレームワーク
- **React** 18 - フロントエンドライブラリ
- **Rust** - システムプログラミング言語
- **Python** 3.12 - ファイル分析エンジン
- **SQLite** 3.35+ - 埋め込みデータベース
- **GitHub Actions** - CI/CDプラットフォーム

### ライセンス

MIT License - 詳細は [LICENSE](../LICENSE) を参照

---

## 📞 サポート

### バグ報告・機能要望

[GitHub Issues](https://github.com/muranaka-tenma/Cocofile/issues) にお願いします。

**報告時に含めてください**:
1. OS環境（Linux/Windows/macOS、バージョン）
2. 配布形式（tar.gz/.deb/AppImage/MSI/DMG）
3. 再現手順
4. 期待される動作
5. 実際の動作
6. ログファイル（`~/.config/CocoFile/logs/cocofile.log`）

---

## 📝 変更履歴

### v0.1.1 Alpha（2025年11月7日）

**新機能**:
- Linux .deb パッケージ対応
- Linux AppImage 対応
- Windows MSIインストーラー対応
- macOS DMGインストーラー対応
- GitHub Actions CI/CD自動ビルド

**改善**:
- バンドルサイズ最適化
- ビルドプロセス改善

**バグ修正**:
- Ubuntu 24.04パッケージ名対応
- Tauriビルドパス問題修正

### v0.1.0 Alpha（2025年11月6日）

初回リリース（Linux版のみ）

---

**リリース日**: 2025年11月7日（予定）
**ダウンロード**: [GitHub Releases](https://github.com/muranaka-tenma/Cocofile/releases/tag/v0.1.1-alpha)
**プロジェクト**: CocoFile（ココファイル）
**愛称**: ココ
**開発者**: muranaka-tenma

---

**注意**: このリリースはAlpha版です。本番環境での使用前に十分なテストを行ってください。
