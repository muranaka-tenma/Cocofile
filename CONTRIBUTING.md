# Contributing to CocoFile

CocoFileへのコントリビューションを歓迎します！

## 📋 目次

1. [行動規範](#行動規範)
2. [始める前に](#始める前に)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [ブランチ戦略](#ブランチ戦略)
5. [プルリクエストの流れ](#プルリクエストの流れ)
6. [コーディング規約](#コーディング規約)
7. [テスト](#テスト)
8. [コミットメッセージ](#コミットメッセージ)
9. [バグ報告](#バグ報告)
10. [機能要望](#機能要望)

---

## 行動規範

このプロジェクトに参加する全ての人は、以下を守ってください：

- 敬意を持って接する
- 建設的なフィードバックを提供する
- 他の視点を尊重する
- コミュニティの利益を最優先する

---

## 始める前に

### Issue を確認

1. [既存のIssue](https://github.com/muranaka-tenma/Cocofile/issues)を確認
2. 重複がなければ新しいIssueを作成
3. 大きな変更の場合は、実装前にIssueで議論

### コントリビューション の種類

- **バグ修正**: テストと再現手順を含める
- **新機能**: 事前にIssueで提案・議論
- **ドキュメント**: typo修正から大規模な改善まで歓迎
- **テスト**: テストカバレッジの向上

---

## 開発環境のセットアップ

### 必要なツール

#### すべてのプラットフォーム共通

- **Git**: https://git-scm.com/
- **Node.js**: v20以降（https://nodejs.org/）
- **Rust**: 最新安定版（https://rustup.rs/）
- **Python**: 3.10以降（https://www.python.org/）

#### プラットフォーム固有

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libsqlite3-dev
```

**Windows**:
- Microsoft Visual Studio 2022（C++デスクトップ開発ワークロード）
- WebView2 Runtime

**macOS**:
```bash
xcode-select --install
```

### リポジトリのクローン

```bash
git clone https://github.com/muranaka-tenma/Cocofile.git
cd CocoFile
```

### 依存関係のインストール

```bash
# フロントエンド依存関係
cd frontend
npm install
cd ..

# Python依存関係
cd python-backend
pip install -r requirements.txt
pip install pyinstaller
cd ..
```

### 開発サーバーの起動

```bash
npm run tauri:dev
```

### ビルド

```bash
# フロントエンドビルド
npm run build

# Tauriアプリビルド
npm run tauri:build
```

---

## ブランチ戦略

### ブランチ命名規則

- `main` - 本番用ブランチ
- `develop` - 開発用ブランチ（今後導入予定）
- `feature/機能名` - 新機能開発
- `fix/バグ名` - バグ修正
- `docs/内容` - ドキュメント更新
- `refactor/内容` - リファクタリング

### 例

```bash
git checkout -b feature/add-regex-search
git checkout -b fix/memory-leak-on-scan
git checkout -b docs/update-install-guide
```

---

## プルリクエストの流れ

### 1. Forkとブランチ作成

```bash
# リポジトリをFork（GitHubのUIで実行）

# Forkをクローン
git clone https://github.com/YOUR_USERNAME/Cocofile.git
cd CocoFile

# upstream を追加
git remote add upstream https://github.com/muranaka-tenma/Cocofile.git

# 新しいブランチを作成
git checkout -b feature/your-feature
```

### 2. 変更の実装

- コードを書く
- テストを追加/更新
- ローカルでテスト実行
- コミット

### 3. プッシュ

```bash
git push origin feature/your-feature
```

### 4. プルリクエスト作成

GitHubで「New Pull Request」をクリック

**PRのタイトル**:
```
[type]: 変更の概要
```

**例**:
- `feat: 正規表現検索機能を追加`
- `fix: スキャン時のメモリリークを修正`
- `docs: インストールガイドを更新`

**PRの説明**:
- 何を変更したか
- なぜ変更したか
- どうテストしたか
- 関連するIssue（あれば `Closes #123`）

### 5. レビューと修正

- レビューコメントに対応
- 必要に応じて追加コミット
- CI/CDが通ることを確認

### 6. マージ

メンテナーがレビュー後、マージします

---

## コーディング規約

### TypeScript/JavaScript

**命名規則**:
- 変数・関数: `camelCase`
- 型・インターフェース: `PascalCase`
- 定数: `UPPER_SNAKE_CASE`

**コード品質**:
- ESLint/Prettier に従う
- `strict` モード有効
- 未使用変数/import禁止
- `console.log` は削除（本番環境）

**例**:
```typescript
// Good
const searchResults: SearchResult[] = await performSearch(query);

// Bad
const search_results = await performSearch(query); // snake_case
```

### Python

**命名規則**:
- 変数・関数: `snake_case`
- クラス: `PascalCase`
- 定数: `UPPER_SNAKE_CASE`

**コード品質**:
- Black でフォーマット
- 型ヒント推奨
- docstring 推奨

**例**:
```python
# Good
def analyze_pdf_file(file_path: str) -> dict:
    """PDF ファイルを分析してメタデータを返す"""
    pass

# Bad
def AnalyzePdfFile(filePath):  # PascalCase, camelCase
    pass
```

### Rust

- `rustfmt` でフォーマット
- `clippy` の警告をすべて解決

---

## テスト

### フロントエンド

```bash
cd frontend
npm test
```

### Python

```bash
cd python-backend
pytest
```

### E2E テスト

```bash
# 今後実装予定
```

---

## コミットメッセージ

### 形式

```
[type]: [subject]

[body]（任意）

[footer]（任意）
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（コード動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセス、依存関係更新など

### 例

```bash
git commit -m "feat: 正規表現検索機能を追加

FTS5の制約により通常検索では不可能な高度な検索パターンに対応するため、
正規表現による検索機能を実装。

Closes #42"
```

---

## バグ報告

### 良いバグ報告の例

**タイトル**: `[BUG] スキャン中にアプリがクラッシュする`

**内容**:
```
## 環境
- OS: Ubuntu 24.04
- バージョン: v0.1.1-alpha
- インストール方法: .deb

## 再現手順
1. アプリを起動
2. 10,000ファイル以上のフォルダを追加
3. スキャン開始
4. 約5,000ファイル処理後にクラッシュ

## 期待される動作
すべてのファイルがスキャンされる

## 実際の動作
アプリがクラッシュして終了

## エラーメッセージ
「Segmentation fault (core dumped)」

## ログ
（ログファイルがあれば添付）
```

### Issue テンプレート

[Bug Report テンプレート](.github/ISSUE_TEMPLATE/bug_report.md) を使用してください

---

## 機能要望

### 良い機能要望の例

**タイトル**: `[FEATURE] ダークモード対応`

**内容**:
```
## 機能の概要
アプリ全体でダークモードをサポート

## 背景・理由
- 夜間の使用時に目が疲れる
- 多くのアプリがダークモードに対応している
- OSの設定に合わせて自動切り替えできると便利

## 提案する実装
- システムのダークモード設定を自動検出
- アプリ内で手動切り替えも可能
- テーマ設定を保存

## 参考
- VS Code のテーマ切り替え
- macOS のダークモード
```

### Issue テンプレート

[Feature Request テンプレート](.github/ISSUE_TEMPLATE/feature_request.md) を使用してください

---

## その他

### ドキュメント貢献

- README.md の改善
- API ドキュメント追加
- チュートリアル作成
- 翻訳

### コードレビュー

他のPRをレビューすることも大きな貢献です：
- 建設的なフィードバック
- テストの提案
- コード品質の改善提案

---

## 質問・サポート

- **GitHub Issues**: https://github.com/muranaka-tenma/Cocofile/issues
- **GitHub Discussions**: https://github.com/muranaka-tenma/Cocofile/discussions

---

## ライセンス

コントリビューションは、プロジェクトと同じ MIT ライセンスの下でリリースされます。

---

**Thank you for contributing to CocoFile!** 🎉
