"""
Text file analyzer for .txt and .md files
"""

import os

# ファイルサイズ制限（1MB）
MAX_TEXT_SIZE = 1_000_000


def analyze_text(file_path: str) -> dict:
    """
    テキストファイル (.txt, .md) を分析してテキストを抽出

    Args:
        file_path: ファイルパス

    Returns:
        dict: {
            "text": 抽出されたテキスト,
            "file_size": ファイルサイズ（バイト）
        }
    """
    try:
        # ファイルサイズを取得
        file_size = os.path.getsize(file_path)

        # テキストファイルを読み込む（複数のエンコーディングを試行）
        # ファイルサイズが1MB超の場合は先頭1MBのみ読み込む
        text = None
        encodings = ['utf-8', 'utf-8-sig', 'shift_jis', 'cp932', 'euc-jp', 'iso-2022-jp', 'latin-1']

        # 読み込むバイト数を決定
        read_size = min(file_size, MAX_TEXT_SIZE) if file_size > MAX_TEXT_SIZE else None

        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    if read_size is not None:
                        # 先頭1MBのみ読み込む
                        text = f.read(read_size)
                    else:
                        text = f.read()
                break  # 成功したらループを抜ける
            except (UnicodeDecodeError, UnicodeError):
                continue

        if text is None:
            # どのエンコーディングでも読めない場合はバイナリとして読む
            with open(file_path, 'rb') as f:
                if read_size is not None:
                    raw_bytes = f.read(read_size)
                else:
                    raw_bytes = f.read()
                # 印刷可能な文字のみ抽出
                text = ''.join(chr(b) for b in raw_bytes if 32 <= b < 127 or b in (9, 10, 13))

        return {
            "text": text,
            "file_size": file_size
        }

    except Exception as e:
        raise Exception(f"Failed to analyze text file: {str(e)}")
