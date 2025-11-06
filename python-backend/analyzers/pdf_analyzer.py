"""
PDF分析モジュール

pdfplumberを使用してPDFからテキストを抽出します。
"""

import os
from typing import Dict, Any

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False


def analyze_pdf(file_path: str) -> Dict[str, Any]:
    """
    PDFファイルを分析してテキストを抽出

    Args:
        file_path: PDFファイルのパス

    Returns:
        {
            "text": "抽出されたテキスト",
            "page_count": ページ数,
            "file_size": ファイルサイズ(bytes)
        }
    """
    if not PDFPLUMBER_AVAILABLE:
        return {
            "error": "pdfplumber is not installed",
            "text": "",
            "page_count": 0,
            "file_size": 0
        }

    # ファイル存在チェック
    if not os.path.exists(file_path):
        return {
            "error": f"File not found: {file_path}",
            "text": "",
            "page_count": 0,
            "file_size": 0
        }

    try:
        # ファイルサイズ取得
        file_size = os.path.getsize(file_path)

        # PDF読み込み
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            extracted_text = []

            # 全ページからテキスト抽出
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)

            # テキストを結合
            full_text = "\n".join(extracted_text)

            return {
                "text": full_text,
                "page_count": page_count,
                "file_size": file_size,
                "success": True
            }

    except Exception as e:
        return {
            "error": f"Failed to analyze PDF: {str(e)}",
            "text": "",
            "page_count": 0,
            "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
        }


if __name__ == "__main__":
    # テスト用
    import sys
    if len(sys.argv) > 1:
        result = analyze_pdf(sys.argv[1])
        print(result)
    else:
        print("Usage: python pdf_analyzer.py <pdf_file_path>")
