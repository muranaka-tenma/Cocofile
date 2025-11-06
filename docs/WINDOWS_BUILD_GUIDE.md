# CocoFile - Windowsビルド手順書

## 🎯 目的

WSL2で開発したCocoFileを、Windows上でビルドして`.exe`ファイルを作成する。

---

## 📋 前提条件

Windowsに以下がインストールされている必要があります：

### 必須ツール

1. **Node.js** (v18以上)
   - https://nodejs.org/
   - インストール確認: `node --version`

2. **Rust** (最新版)
   - https://rustup.rs/
   - インストール確認: `rustc --version`

3. **Visual Studio Build Tools** (C++コンパイラ)
   - https://visualstudio.microsoft.com/downloads/
   - 「Desktop development with C++」をインストール

---

## 🚀 方法1: WSL2プロジェクトから直接ビルド（推奨）

### ステップ1: Windows PowerShellを開く

**Windows + X** → **Windows PowerShell** を選択

### ステップ2: WSL2プロジェクトに移動

```powershell
# WSL2のプロジェクトにアクセス
cd \\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\frontend
```

> **注意**: `Ubuntu` の部分はWSL2のディストリビューション名です。
> 違う場合は `\\wsl$\` だけ入力してTab補完で確認してください。

### ステップ3: ビルド実行

```powershell
# Windowsビルド実行（5-10分かかります）
npm run tauri:build
```

### ステップ4: 実行ファイルの場所

ビルド成功後、以下に生成されます：

```
\\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\src-tauri\target\release\
├── CocoFile.exe                    ← 実行ファイル
└── bundle\
    └── msi\
        └── CocoFile_0.1.0_x64_en-US.msi  ← インストーラー
```

### ステップ5: ファイルをデスクトップにコピー

```powershell
# 実行ファイルをデスクトップにコピー
Copy-Item "\\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\src-tauri\target\release\CocoFile.exe" "$HOME\Desktop\"

# インストーラーもコピー
Copy-Item "\\wsl$\Ubuntu\home\muranaka-tenma\CocoFile\src-tauri\target\release\bundle\msi\CocoFile_0.1.0_x64_en-US.msi" "$HOME\Desktop\"
```

---

## 🚀 方法2: プロジェクトをWindowsにコピーしてビルド

### ステップ1: Windowsエクスプローラーで開く

1. **Windows + R** を押す
2. 以下を入力して Enter:
```
\\wsl$\Ubuntu\home\muranaka-tenma\CocoFile
```

### ステップ2: フォルダをコピー

1. `CocoFile` フォルダを右クリック → コピー
2. デスクトップまたは `C:\Users\YourName\` に貼り付け

### ステップ3: Windows PowerShellで移動

```powershell
cd C:\Users\YourName\CocoFile\frontend
```

### ステップ4: 依存関係をインストール

```powershell
npm install
```

### ステップ5: ビルド実行

```powershell
npm run tauri:build
```

---

## ✅ ビルド成功の確認

### 正常終了メッセージ

```
Finished 2 bundles at:
    C:\Users\YourName\CocoFile\src-tauri\target\release\bundle\msi\CocoFile_0.1.0_x64_en-US.msi
    C:\Users\YourName\CocoFile\src-tauri\target\release\CocoFile.exe
```

### 生成されるファイル

```
src-tauri\target\release\
├── CocoFile.exe                    (約10-20MB)
└── bundle\
    └── msi\
        └── CocoFile_0.1.0_x64_en-US.msi  (インストーラー)
```

---

## 🎮 実行してテスト

### 方法A: 実行ファイルを直接起動

```powershell
# デスクトップの CocoFile.exe をダブルクリック
```

### 方法B: インストーラーを実行

```powershell
# CocoFile_0.1.0_x64_en-US.msi をダブルクリック
# → C:\Program Files\CocoFile\ にインストール
# → スタートメニューから起動可能
```

---

## 🐛 トラブルシューティング

### エラー1: `node: command not found`

**原因**: Node.jsがインストールされていない

**対処**:
1. https://nodejs.org/ からインストール
2. PowerShellを再起動
3. `node --version` で確認

### エラー2: `cargo: command not found`

**原因**: Rustがインストールされていない

**対処**:
1. https://rustup.rs/ からインストール
2. PowerShellを再起動
3. `rustc --version` で確認

### エラー3: `error: linker 'link.exe' not found`

**原因**: Visual Studio Build Toolsがインストールされていない

**対処**:
1. https://visualstudio.microsoft.com/downloads/ から「Build Tools for Visual Studio」をダウンロード
2. 「Desktop development with C++」をインストール
3. PCを再起動

### エラー4: `npm ERR! code EACCES`

**原因**: 権限エラー

**対処**:
PowerShellを**管理者として実行**し、再度ビルド

### エラー5: ビルドは成功したが.exeが見つからない

**確認**:
```powershell
# ファイルを検索
Get-ChildItem -Path . -Recurse -Filter "CocoFile.exe"
```

---

## 📊 ビルド時間の目安

| ステップ | 所要時間 |
|---------|----------|
| `npm install` | 2-5分 |
| フロントエンドビルド | 10-30秒 |
| Rustコンパイル | 2-5分 |
| パッケージング | 30秒-1分 |
| **合計** | **5-12分** |

---

## 🎉 次のステップ

ビルド成功後：

1. **動作テスト**
   - `docs/WINDOWS_TEST_GUIDE.md` を参照
   - 全機能をテスト

2. **バグ修正**
   - 問題があれば修正 → 再ビルド

3. **配布準備**
   - `.msi`インストーラーを配布
   - README更新

---

## 💡 ヒント

### ビルドを高速化

```powershell
# 増分ビルド（2回目以降は高速）
npm run tauri:build

# クリーンビルド（問題がある場合）
cargo clean
npm run tauri:build
```

### デバッグビルド（開発用）

```powershell
# リリースビルドより高速だが最適化なし
npm run tauri dev
```

---

**作成日**: 2025-11-05
**対象**: CocoFile v0.1.0
**環境**: Windows 10/11 x64
