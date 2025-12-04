"""
OCR分析モジュール

pytesseract + Pillowを使用して画像からテキストを抽出します。
日本語と英語の両方に対応（jpn+eng）。
"""

import os
from typing import Dict, Any

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False


# 対応画像形式
SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif'}

# 画像サイズ制限（ピクセル）: メモリ使用量を抑えるため
MAX_IMAGE_WIDTH = 3000
MAX_IMAGE_HEIGHT = 3000

# ファイルサイズ制限（バイト）: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024


def analyze_image_ocr(file_path: str) -> Dict[str, Any]:
    """
    画像ファイルからOCRでテキストを抽出

    Args:
        file_path: 画像ファイルのパス

    Returns:
        {
            "text": "抽出されたテキスト",
            "file_size": ファイルサイズ(bytes),
            "image_width": 画像幅,
            "image_height": 画像高さ,
            "success": True/False
        }
    """
    # Pillow未インストール
    if not PILLOW_AVAILABLE:
        return {
            "error": "Pillow is not installed. Please run: pip install Pillow",
            "text": "",
            "file_size": 0,
            "success": False
        }

    # pytesseract未インストール
    if not PYTESSERACT_AVAILABLE:
        return {
            "error": "pytesseract is not installed. Please run: pip install pytesseract",
            "text": "",
            "file_size": 0,
            "success": False
        }

    # ファイル存在チェック
    if not os.path.exists(file_path):
        return {
            "error": f"File not found: {file_path}",
            "text": "",
            "file_size": 0,
            "success": False
        }

    # ファイルサイズチェック
    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        return {
            "error": f"File too large: {file_size} bytes (max {MAX_FILE_SIZE} bytes)",
            "text": "",
            "file_size": file_size,
            "success": False
        }

    # 拡張子チェック
    _, ext = os.path.splitext(file_path)
    ext_lower = ext.lower()
    if ext_lower not in SUPPORTED_FORMATS:
        return {
            "error": f"Unsupported image format: {ext} (supported: {', '.join(SUPPORTED_FORMATS)})",
            "text": "",
            "file_size": file_size,
            "success": False
        }

    try:
        # 画像読み込み
        image = Image.open(file_path)
        original_width, original_height = image.size

        # 画像サイズチェック & リサイズ
        needs_resize = False
        new_width, new_height = original_width, original_height

        if original_width > MAX_IMAGE_WIDTH or original_height > MAX_IMAGE_HEIGHT:
            # アスペクト比を維持してリサイズ
            aspect_ratio = original_width / original_height

            if original_width > MAX_IMAGE_WIDTH:
                new_width = MAX_IMAGE_WIDTH
                new_height = int(MAX_IMAGE_WIDTH / aspect_ratio)

            if new_height > MAX_IMAGE_HEIGHT:
                new_height = MAX_IMAGE_HEIGHT
                new_width = int(MAX_IMAGE_HEIGHT * aspect_ratio)

            needs_resize = True

        # リサイズ実行
        if needs_resize:
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # OCR実行（日本語+英語）
        # Tesseract言語パック: jpn+eng
        try:
            text = pytesseract.image_to_string(image, lang='jpn+eng')
        except pytesseract.TesseractNotFoundError:
            return {
                "error": "Tesseract-OCR is not installed or not found in PATH. "
                         "Please install Tesseract-OCR: "
                         "https://github.com/tesseract-ocr/tesseract",
                "text": "",
                "file_size": file_size,
                "success": False
            }
        except Exception as e:
            # 日本語言語パックがない場合は英語のみで再試行
            try:
                text = pytesseract.image_to_string(image, lang='eng')
                text = f"[Warning: Japanese language pack not found, using English only]\n{text}"
            except Exception as e2:
                return {
                    "error": f"OCR failed: {str(e)} (fallback also failed: {str(e2)})",
                    "text": "",
                    "file_size": file_size,
                    "success": False
                }

        # テキスト整形（前後の空白削除）
        text = text.strip()

        return {
            "text": text,
            "file_size": file_size,
            "image_width": original_width,
            "image_height": original_height,
            "resized": needs_resize,
            "resized_width": new_width if needs_resize else None,
            "resized_height": new_height if needs_resize else None,
            "success": True
        }

    except Exception as e:
        return {
            "error": f"Failed to analyze image: {str(e)}",
            "text": "",
            "file_size": file_size if file_size else 0,
            "success": False
        }


if __name__ == "__main__":
    # テスト用
    import sys
    if len(sys.argv) > 1:
        result = analyze_image_ocr(sys.argv[1])
        print(result)
    else:
        print("Usage: python ocr_analyzer.py <image_file_path>")
