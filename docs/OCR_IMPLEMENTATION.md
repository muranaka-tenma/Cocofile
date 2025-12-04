# OCR機能実装ガイド

## 概要
CocoFileにOCR（Optical Character Recognition）機能を実装しました。この機能により、画像ファイル内のテキストを自動的に抽出し、検索可能にします。

## 実装内容

### 1. Python側の実装

#### `python-backend/analyzers/ocr_analyzer.py`
- **使用ライブラリ**: pytesseract + Pillow
- **対応形式**: PNG, JPG, JPEG, GIF, BMP, TIFF
- **言語**: 日本語 + 英語（jpn+eng）
- **画像サイズ制限**:
  - 最大幅: 3000px
  - 最大高さ: 3000px
  - ファイルサイズ: 10MB以下
- **パフォーマンス最適化**:
  - 大きな画像は自動的にリサイズ（アスペクト比維持）
  - メモリ使用量を抑制

#### 主要関数
```python
def analyze_image_ocr(file_path: str) -> Dict[str, Any]:
    """
    画像ファイルからOCRでテキストを抽出

    Returns:
        {
            "text": "抽出されたテキスト",
            "file_size": ファイルサイズ(bytes),
            "image_width": 画像幅,
            "image_height": 画像高さ,
            "success": True/False
        }
    """
```

#### エラーハンドリング
- Pillow未インストール時の適切なエラーメッセージ
- pytesseract未インストール時の適切なエラーメッセージ
- Tesseract-OCR未インストール時の適切なエラーメッセージ
- 日本語言語パック未インストール時の英語フォールバック

### 2. Rust側の統合

#### `src-tauri/src/python_bridge.rs`
新しいOCR分析メソッドを追加:
```rust
pub fn analyze_image_ocr(&mut self, file_path: &str) -> Result<AnalyzeResult, String>
```

#### `src-tauri/src/file_scanner.rs`
- 画像ファイル（png, jpg, jpeg, gif, bmp, tiff, tif）を検出時にOCR処理を実行
- OCR設定（有効/無効）に従って処理を制御
- 抽出したテキストをN-gram処理してFTS5データベースに保存

#### `src-tauri/src/settings_manager.rs`
設定構造体にOCR設定を追加:
```rust
pub struct AppSettings {
    // ...
    pub ocr_enabled: bool, // OCR機能の有効/無効
    // ...
}
```

### 3. フロントエンド実装

#### 型定義 (`frontend/src/types/index.ts`)
```typescript
export interface AppSettings {
  // ...
  ocrEnabled: boolean;
  // ...
}
```

#### ストア (`frontend/src/store/settingsStore.ts`)
- `updateOcrEnabled(enabled: boolean)` アクションを追加
- Tauri型とフロントエンド型の相互変換に対応

#### 設定画面 (`frontend/src/screens/SettingsScreen.tsx`)
OCR設定セクションを追加:
- チェックボックスでOCR機能の有効/無効を切り替え
- 対応形式の説明
- OCR無効時の警告メッセージ

## システム要件

### 必須パッケージ

#### Python
```bash
pip install pytesseract==0.3.10
pip install Pillow==10.1.0
```

#### システム
Tesseract-OCRがインストールされている必要があります:

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-jpn  # 日本語言語パック
```

**Windows:**
1. [Tesseract-OCR Installer](https://github.com/UB-Mannheim/tesseract/wiki) からインストーラーをダウンロード
2. インストール時に日本語言語パックを選択
3. インストールパスをPATHに追加

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # 日本語言語パック
```

## 使用方法

### 1. OCR機能を有効化
1. 設定画面を開く
2. 「OCR設定」セクションで「画像内テキスト抽出（OCR）を有効にする」にチェック

### 2. 画像ファイルをスキャン
- ファイルスキャンを実行すると、画像ファイルから自動的にテキストが抽出されます
- 抽出されたテキストはデータベースに保存され、全文検索が可能になります

### 3. 画像内テキストを検索
- 通常の検索と同じように、キーワードを入力すると画像内のテキストも検索対象になります
- 検索結果には画像ファイルも表示され、スニペットに抽出されたテキストの一部が表示されます

## パフォーマンス考慮事項

### 処理速度
- OCRは比較的重い処理です（1ファイルあたり数秒）
- バックグラウンドで処理されるため、UI操作には影響しません
- 画像サイズが大きい場合は自動的にリサイズして処理速度を向上

### メモリ使用量
- 大きな画像は自動的にリサイズ（最大3000x3000px）
- ファイルサイズ10MB以上の画像はスキップ
- 同時処理数は制限されています（Rust側で制御）

### データベースサイズ
- 抽出されたテキストはN-gram処理されてデータベースに保存されます
- 画像1枚あたり数KB〜数十KBのデータベース容量が必要です

## トラブルシューティング

### OCRが動作しない場合

1. **Tesseract-OCRがインストールされているか確認**
   ```bash
   tesseract --version
   ```

2. **日本語言語パックがインストールされているか確認**
   ```bash
   tesseract --list-langs
   ```
   "jpn"が表示されればOK

3. **Pythonパッケージがインストールされているか確認**
   ```bash
   python3 -c "import pytesseract; from PIL import Image; print('OK')"
   ```

4. **ログファイルを確認**
   - Linux: `~/.config/CocoFile/logs/python-bridge-debug.log`
   - Windows: `%APPDATA%\CocoFile\logs\python-bridge-debug.log`
   - macOS: `~/Library/Application Support/CocoFile/logs/python-bridge-debug.log`

### OCR精度が低い場合

1. **画像の品質を確認**
   - 低解像度の画像はOCR精度が低下します
   - ぼやけた画像やノイズが多い画像は認識が困難です

2. **画像の向きを確認**
   - テキストが横向きや逆さまの場合は認識できません
   - 事前に画像を回転させてください

3. **フォントの種類**
   - 手書き文字や特殊なフォントは認識精度が低下します
   - 標準的な明朝体やゴシック体が最も認識精度が高いです

## 制限事項

- **Phase 1では以下の機能は未実装**:
  - OCR処理の進捗表示
  - OCR処理の同時実行数制限（設定可能）
  - OCRエラーの詳細ログ（ユーザー向け）

- **対応していない形式**:
  - PDF内の画像（PDFテキスト抽出のみ対応）
  - SVG形式
  - WebP形式

## 今後の拡張予定

- [ ] OCR処理の進捗表示（リアルタイム）
- [ ] OCR同時処理数の設定（UI）
- [ ] OCRキャッシュ機能（再スキャン高速化）
- [ ] 複数言語の選択機能
- [ ] PDF内画像のOCR対応
- [ ] OCR精度向上（画像前処理）

## 技術的詳細

### データフロー
1. ユーザーがファイルスキャンを実行
2. `file_scanner.rs`が画像ファイルを検出
3. `python_bridge.rs`経由で`ocr_analyzer.py`を呼び出し
4. pytesseractがTesseract-OCRを実行してテキスト抽出
5. 抽出されたテキストをN-gram処理
6. SQLite FTS5データベースに保存
7. 検索時にFTS5で全文検索

### データベーススキーマ
既存の`files_fts`テーブルを使用:
```sql
CREATE VIRTUAL TABLE files_fts USING fts5(
    file_path UNINDEXED,
    content,
    tokenize='unicode61'
);
```

画像ファイルのOCRテキストも`content`カラムに保存されます。

---

**作成日**: 2025-12-04
**バージョン**: v0.2.0（OCR機能追加）
**担当**: Claude Code Assistant
