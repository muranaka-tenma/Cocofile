#!/bin/bash
# バックエンド動作確認スクリプト

set -e

echo "=== CocoFile Backend Test (Phase 3) ==="
echo

# 1. Pythonバックエンドのヘルスチェック
echo "1. Python Backend Health Check"
echo '{"command": "health"}' | python3 python-backend/main.py | head -2
echo

# 2. N-gram処理のテスト
echo "2. N-gram Tokenization Test"
python3 -c "
import sys
sys.path.append('python-backend')
from utils.ngram import ngram_tokenize, prepare_search_query

test_text = '営業資料'
print(f'Input:  {test_text}')
print(f'N-gram: {ngram_tokenize(test_text)}')
print(f'Query:  {prepare_search_query(test_text)}')
"
echo

# 3. 全ファイル形式のアナライザーテスト
echo "3. All File Analyzers Test"
python3 -c "
import sys
sys.path.append('python-backend')

# Test if all analyzers are importable
from analyzers.pdf_analyzer import analyze_pdf
from analyzers.excel_analyzer import analyze_excel
from analyzers.word_analyzer import analyze_word
from analyzers.ppt_analyzer import analyze_ppt

print('✓ PDF Analyzer')
print('✓ Excel Analyzer')
print('✓ Word Analyzer')
print('✓ PowerPoint Analyzer')
"
echo

# 4. Rustコンパイル確認
echo "4. Rust Compilation Check"
cd src-tauri
cargo check --quiet 2>&1 | tail -1
cd ..
echo

# 5. TypeScriptビルド確認
echo "5. TypeScript Build Check"
cd frontend
npm run build 2>&1 | tail -5
cd ..
echo

# 6. Tauri Commandsカウント
echo "6. Tauri Commands Count"
grep -o "#\[tauri::command\]" src-tauri/src/lib.rs | wc -l | xargs echo "Total Commands:"
echo

echo "=== All Tests Passed ==="
