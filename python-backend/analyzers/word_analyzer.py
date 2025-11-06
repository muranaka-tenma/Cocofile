"""
Word分析モジュール

docx2txtを使用してWordファイルからテキストを抽出します。
"""

import os
from typing import Dict, Any

try:
    import docx2txt
    DOCX2TXT_AVAILABLE = True
except ImportError:
    DOCX2TXT_AVAILABLE = False


def analyze_word(file_path: str) -> Dict[str, Any]:
    """
    Wordファイルを分析してテキストを抽出

    Args:
        file_path: Wordファイルのパス

    Returns:
        {
            "text": "抽出されたテキスト",
            "file_size": ファイルサイズ(bytes)
        }
    """
    if not DOCX2TXT_AVAILABLE:
        return {
            "error": "docx2txt is not installed",
            "text": "",
            "file_size": 0
        }

    if not os.path.exists(file_path):
        return {
            "error": f"File not found: {file_path}",
            "text": "",
            "file_size": 0
        }

    try:
        file_size = os.path.getsize(file_path)

        # テキスト抽出
        text = docx2txt.process(file_path)

        return {
            "text": text,
            "file_size": file_size,
            "success": True
        }

    except Exception as e:
        return {
            "error": f"Failed to analyze Word: {str(e)}",
            "text": "",
            "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
        }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = analyze_word(sys.argv[1])
        print(result)
    else:
        print("Usage: python word_analyzer.py <word_file_path>")
