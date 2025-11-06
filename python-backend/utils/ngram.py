"""
N-gram処理ユーティリティ

日本語テキストを2-gram（バイグラム）に分割してFTS5検索用に前処理します。

例:
    "営業資料" → "営業 業資 資料"
"""

from typing import List


def ngram_tokenize(text: str, n: int = 2) -> str:
    """
    テキストをN-gramに分割（スペース区切り文字列として返す）

    Args:
        text: 入力テキスト
        n: N-gramのサイズ（デフォルト: 2）

    Returns:
        スペース区切りのN-gram文字列

    Examples:
        >>> ngram_tokenize("営業資料")
        '営業 業資 資料'

        >>> ngram_tokenize("ファイル検索")
        'ファ ァイ イル ルル 検索 索'
    """
    if not text or len(text) < n:
        return text

    # 改行や余分なスペースを削除
    text = text.replace("\n", " ").replace("\r", "")
    text = " ".join(text.split())  # 連続するスペースを1つに

    tokens = []

    # 文字単位でN-gram作成
    for i in range(len(text) - n + 1):
        gram = text[i:i+n]
        # スペースのみのN-gramは除外
        if gram.strip():
            tokens.append(gram)

    return " ".join(tokens)


def ngram_tokenize_list(text: str, n: int = 2) -> List[str]:
    """
    テキストをN-gramに分割（リストとして返す）

    Args:
        text: 入力テキスト
        n: N-gramのサイズ

    Returns:
        N-gramトークンのリスト
    """
    result = ngram_tokenize(text, n)
    return result.split() if result else []


def prepare_for_fts5(text: str, n: int = 2) -> str:
    """
    FTS5インデックス登録用にテキストを前処理

    Args:
        text: 元のテキスト
        n: N-gramサイズ

    Returns:
        FTS5に登録する文字列（N-gram処理済み）
    """
    return ngram_tokenize(text, n)


def prepare_search_query(keyword: str, n: int = 2) -> str:
    """
    検索クエリをN-gram化してFTS5 MATCH句用に整形

    Args:
        keyword: 検索キーワード
        n: N-gramサイズ

    Returns:
        FTS5 MATCH句に渡す文字列

    Examples:
        >>> prepare_search_query("営業資料")
        '営業 AND 業資 AND 資料'
    """
    tokens = ngram_tokenize_list(keyword, n)

    if not tokens:
        return ""

    # AND条件で結合
    return " AND ".join(tokens)


if __name__ == "__main__":
    # テスト実行
    test_cases = [
        "営業資料",
        "ファイル検索",
        "CocoFile プロジェクト",
        "日本語の全文検索テスト"
    ]

    print("=== N-gram Tokenization Test ===\n")

    for text in test_cases:
        result = ngram_tokenize(text)
        query = prepare_search_query(text)
        print(f"Input:  {text}")
        print(f"N-gram: {result}")
        print(f"Query:  {query}")
        print()
