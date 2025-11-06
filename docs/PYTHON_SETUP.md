# Python Backend Setup Guide

**CocoFileのPythonバックエンドをセットアップする手順書**

---

## 📋 前提条件

- Python 3.10+ がインストールされていること
- pipが利用可能であること

---

## 🚀 方法1: 開発環境セットアップ（推奨）

### Linux/macOS

```bash
cd /home/muranaka-tenma/CocoFile/python-backend

# 仮想環境作成
python3 -m venv venv

# 仮想環境有効化
source venv/bin/activate

# 依存関係インストール
pip install -r requirements.txt

# 動作確認
echo '{"command": "health"}' | python main.py
```

### Windows

```powershell
cd C:\path\to\CocoFile\python-backend

# 仮想環境作成
python -m venv venv

# 仮想環境有効化
.\venv\Scripts\Activate.ps1

# 依存関係インストール
pip install -r requirements.txt

# 動作確認
echo {"command": "health"} | python main.py
```

---

## 📦 方法2: PyInstallerでバイナリ化（本番環境）

### 依存関係インストール

```bash
cd python-backend

# 仮想環境で実行推奨
source venv/bin/activate

# PyInstallerと依存ライブラリをインストール
pip install pyinstaller pdfplumber openpyxl docx2txt python-pptx
```

### バイナリ作成

```bash
# PyInstallerでバイナリ化
pyinstaller python-analyzer.spec

# 出力先: dist/python-analyzer (Linux/macOS)
#        dist/python-analyzer.exe (Windows)
```

### バイナリの配置

```bash
# Tauriバイナリディレクトリに配置
mkdir -p ../src-tauri/binaries

# Linux
cp dist/python-analyzer ../src-tauri/binaries/python-analyzer-x86_64-unknown-linux-gnu

# macOS
cp dist/python-analyzer ../src-tauri/binaries/python-analyzer-x86_64-apple-darwin

# Windows
cp dist/python-analyzer.exe ../src-tauri/binaries/python-analyzer-x86_64-pc-windows-msvc.exe
```

### 動作確認

```bash
# バイナリのテスト
echo '{"command": "health"}' | ./dist/python-analyzer
```

期待される出力:
```json
{"status": "success", "data": {"message": "Python backend started"}}
{"status": "success", "data": {"message": "Python backend is healthy"}}
```

---

## 🔧 方法3: システムPythonで直接実行（非推奨）

**警告**: この方法は開発環境でのみ使用してください。

```bash
# システムPythonに直接インストール
python3 -m pip install --user pdfplumber openpyxl docx2txt python-pptx
```

または

```bash
# --break-system-packages フラグを使用（Debian/Ubuntu）
python3 -m pip install --break-system-packages pdfplumber openpyxl docx2txt python-pptx
```

---

## 📊 依存ライブラリ一覧

| ライブラリ | バージョン | 用途 | ライセンス |
|-----------|----------|------|-----------|
| pdfplumber | 0.11.0 | PDF解析 | MIT |
| openpyxl | 3.1.2 | Excel解析 | MIT |
| docx2txt | 0.8 | Word解析 | MIT |
| python-pptx | 0.6.23 | PowerPoint解析 | MIT |
| pyinstaller | 6.3.0 | バイナリ化 | GPL |

---

## 🧪 動作確認スクリプト

### ヘルスチェック

```bash
cd python-backend
echo '{"command": "health"}' | python main.py
```

### PDF分析テスト

```bash
# テスト用PDFファイルのパスを指定
echo '{"command": "analyze_pdf", "path": "/path/to/test.pdf"}' | python main.py
```

### 全アナライザーインポートテスト

```bash
python3 -c "
from analyzers.pdf_analyzer import analyze_pdf
from analyzers.excel_analyzer import analyze_excel
from analyzers.word_analyzer import analyze_word
from analyzers.ppt_analyzer import analyze_ppt
print('All analyzers imported successfully!')
"
```

---

## 🐛 トラブルシューティング

### 1. pip がない

**エラー**: `No module named pip`

**解決策**:
```bash
# Ubuntu/Debian
sudo apt install python3-pip python3-venv

# macOS
python3 -m ensurepip --upgrade

# Windows
python -m ensurepip --upgrade
```

### 2. PyInstallerでバイナリが大きすぎる

**症状**: バイナリサイズが100MB超

**解決策**:
```bash
# UPX圧縮を有効化（既に.specで設定済み）
# 不要なライブラリを除外
pyinstaller --exclude-module matplotlib --exclude-module numpy python-analyzer.spec
```

### 3. pdfplumberのインストール失敗

**エラー**: `error: could not build wheels for pdfplumber`

**解決策**:
```bash
# 依存するC拡張のビルドツールをインストール
# Ubuntu/Debian
sudo apt install build-essential python3-dev

# macOS
xcode-select --install

# Windows
# Visual Studio Build Toolsをインストール
```

### 4. バイナリ実行時のエラー

**エラー**: `ImportError: No module named 'xxx'`

**解決策**:
- `.spec`ファイルの`hiddenimports`にモジュールを追加
- 再度PyInstallerを実行

---

## 📝 開発時の推奨フロー

1. **初回セットアップ**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **開発中**:
   ```bash
   # 仮想環境を有効化して開発
   source venv/bin/activate
   python main.py  # テスト実行
   ```

3. **本番リリース前**:
   ```bash
   # バイナリ化してテスト
   pyinstaller python-analyzer.spec
   ./dist/python-analyzer  # バイナリテスト
   ```

---

## 🔗 関連ドキュメント

- PyInstaller公式ドキュメント: https://pyinstaller.org/
- pdfplumber: https://github.com/jsvine/pdfplumber
- openpyxl: https://openpyxl.readthedocs.io/
- docx2txt: https://github.com/ankushshah89/python-docx2txt
- python-pptx: https://python-pptx.readthedocs.io/

---

**最終更新**: 2025年11月4日
