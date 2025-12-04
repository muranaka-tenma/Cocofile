"""
CocoFile Python Backend - Main Entry Point

stdin/stdout JSON通信でRust(Tauri)と連携します。

通信プロトコル:
- Input (stdin): JSON形式のコマンド
  例: {"command": "analyze_pdf", "path": "/path/to/file.pdf"}

- Output (stdout): JSON形式のレスポンス
  例: {"status": "success", "text": "抽出されたテキスト..."}
"""

import sys
import os
import io
import json
import traceback
from typing import Dict, Any

# stdout/stderrを行バッファリングモードに設定（PyInstallerでのstdio通信のため）
# PyInstallerでビルドされたexeでは、os.fdopen()が失敗する場合があるため、try-exceptで保護
def setup_unbuffered_io():
    """stdout/stderrを行バッファリングモードに設定"""
    try:
        # reconfigure()を使用して行バッファリングを有効化（Python 3.7+）
        # line_buffering=Trueで、各print()後に自動的にflushされる
        sys.stdout.reconfigure(line_buffering=True)
        sys.stderr.reconfigure(line_buffering=True)
        return True
    except (OSError, AttributeError, ValueError) as e:
        # エラーが発生した場合は、環境変数PYTHONUNBUFFERED=1に依存
        # （Rust側でPYTHONUNBUFFERED=1を設定済み）
        sys.stderr.write(f"[WARN] Failed to enable line buffering: {type(e).__name__}: {e}\n")
        sys.stderr.write(f"[INFO] Relying on PYTHONUNBUFFERED environment variable\n")
        sys.stderr.flush()
        return False

# I/O設定を実行
setup_unbuffered_io()

# 分析モジュールのインポート
from analyzers.pdf_analyzer import analyze_pdf
from analyzers.excel_analyzer import analyze_excel
from analyzers.word_analyzer import analyze_word
from analyzers.ppt_analyzer import analyze_ppt
from analyzers.text_analyzer import analyze_text
from analyzers.ocr_analyzer import analyze_image_ocr


def send_response(status: str, data: Any = None, error: str = None):
    """レスポンスをJSON形式でstdoutに送信"""
    response = {"status": status}
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error

    # JSON出力（改行で区切り）
    try:
        json_str = json.dumps(response, ensure_ascii=False)
        print(json_str)
        sys.stdout.flush()
    except (OSError, ValueError, IOError) as e:
        # デバッグ: stderrにエラー情報を出力
        try:
            sys.stderr.write(f"[ERROR] send_response failed: {type(e).__name__}: {e}\n")
            sys.stderr.flush()
        except:
            pass


def handle_command(command_data: Dict[str, Any]):
    """コマンドを処理してレスポンスを返す"""
    command = command_data.get("command")

    if command == "health":
        # ヘルスチェック
        send_response("success", {"message": "Python backend is healthy"})

    elif command == "analyze_pdf":
        # PDF分析
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_pdf(file_path)
        send_response("success", result)

    elif command == "analyze_excel":
        # Excel分析
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_excel(file_path)
        send_response("success", result)

    elif command == "analyze_word":
        # Word分析
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_word(file_path)
        send_response("success", result)

    elif command == "analyze_ppt":
        # PowerPoint分析
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_ppt(file_path)
        send_response("success", result)

    elif command == "analyze_text":
        # テキストファイル分析 (.txt, .md)
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_text(file_path)
        send_response("success", result)

    elif command == "analyze_image_ocr":
        # 画像OCR分析 (.png, .jpg, .jpeg, .gif, .bmp, .tiff)
        file_path = command_data.get("path")
        if not file_path:
            send_response("error", error="Missing 'path' parameter")
            return

        result = analyze_image_ocr(file_path)
        send_response("success", result)

    else:
        send_response("error", error=f"Unknown command: {command}")


def main():
    """メインループ: stdinからコマンドを読み取り、処理する"""
    # コマンド処理ループ
    while True:
        try:
            # stdinから1行読み取り
            line = sys.stdin.readline()

            # 空行またはEOFで終了
            if not line:
                break

            # JSON解析
            command_data = json.loads(line.strip())

            # コマンド処理
            handle_command(command_data)

        except json.JSONDecodeError as e:
            send_response("error", error=f"Invalid JSON: {str(e)}")

        except Exception as e:
            # 予期しないエラー
            error_detail = traceback.format_exc()
            send_response("error", error=f"Internal error: {str(e)}\n{error_detail}")


if __name__ == "__main__":
    main()
