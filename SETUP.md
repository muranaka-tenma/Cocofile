# CocoFile - 環境構築ガイド

## 必要な環境

### システム要件
- **OS**: Linux (WSL2含む) / macOS / Windows
- **Rust**: 1.70以上
- **Node.js**: 18.0以上
- **Python**: 3.10以上

## 環境構築手順

### 1. Rust環境

Rustがインストールされていない場合：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

バージョン確認：
```bash
rustc --version
cargo --version
```

### 2. Node.js環境

Node.jsがインストールされていない場合、[nvm](https://github.com/nvm-sh/nvm)の使用を推奨：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

バージョン確認：
```bash
node --version
npm --version
```

### 3. Python環境

#### Python本体のインストール

Python 3.10以上がインストールされていることを確認：
```bash
python3 --version
```

#### uvパッケージマネージャーのインストール（推奨）

`uv`は高速なPythonパッケージマネージャーです：
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### 4. 依存関係のインストール

#### フロントエンド（React + Vite）

```bash
cd frontend
npm install
```

#### Pythonバックエンド

仮想環境の作成と依存関係のインストール：
```bash
cd python-backend

# uvを使用する場合（推奨）
uv venv
uv pip install -r requirements.txt

# または標準のvenvを使用する場合
python3 -m venv venv
source venv/bin/activate  # Linuxの場合
# venv\Scripts\activate   # Windowsの場合
pip install -r requirements.txt
```

#### Tauriバックエンド（Rust）

依存関係の確認：
```bash
cd src-tauri
cargo check
```

### 5. 開発サーバーの起動

#### 開発モードで起動

フロントエンドとTauriアプリを同時に起動：
```bash
cd frontend
npm run tauri:dev
```

または、個別に起動：

**フロントエンドのみ**:
```bash
cd frontend
npm run dev
```

**Tauriアプリのみ**:
```bash
cd frontend
npm run tauri dev
```

### 6. ビルド

本番用ビルド：
```bash
cd frontend
npm run tauri:build
```

ビルド成果物は `src-tauri/target/release/` に生成されます。

## トラブルシューティング

### Python仮想環境が作成できない（Linux）

`python3-venv`パッケージが必要な場合があります：
```bash
sudo apt install python3-venv
```

または、uvパッケージマネージャーを使用してください（上記参照）。

### Tauriビルドエラー（Linux）

システムライブラリが不足している場合：
```bash
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Node.js依存関係のエラー

node_modulesをクリーンアップして再インストール：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## データベース

### SQLite + FTS5

CocoFileはSQLiteをデータベースとして使用します。

- **バージョン**: SQLite 3.35以上
- **拡張機能**: FTS5（全文検索）+ N-gramトークナイザー

Rustの`rusqlite`クレートが`bundled`フィーチャーで組み込まれているため、
別途SQLiteをインストールする必要はありません。

### データベースの初期化

初回起動時に自動的にデータベースが作成されます。
データベースファイルの場所：
- Linux: `~/.local/share/cocofile/cocofile.db`
- macOS: `~/Library/Application Support/cocofile/cocofile.db`
- Windows: `%APPDATA%\cocofile\cocofile.db`

## Python分析エンジン

Pythonバックエンドは以下のライブラリを使用してファイル分析を行います：

- **PDF**: pdfplumber
- **Excel**: openpyxl
- **Word**: docx2txt
- **PowerPoint**: python-pptx

バイナリ化（本番用）：
```bash
cd python-backend
source .venv/bin/activate  # uvの場合も同様
pyinstaller --onefile main.py
```

## 開発環境の確認

全ての環境が正しくセットアップされているか確認：
```bash
# Rust
rustc --version
cargo --version

# Node.js
node --version
npm --version

# Python
python3 --version
uv --version  # uvを使用する場合

# Cargo check
cd src-tauri && cargo check

# フロントエンド依存関係
cd ../frontend && npm list --depth=0
```

## 推奨エディタ

- **VS Code** + 拡張機能:
  - rust-analyzer
  - ESLint
  - Prettier
  - Tauri
  - Python

## 次のステップ

環境構築が完了したら、[README.md](./README.md)を参照して開発を開始してください。

---

**作成日**: 2025-11-04
**プロジェクト**: CocoFile（ココファイル）
