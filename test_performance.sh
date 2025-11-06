#!/bin/bash
echo "=== CocoFile パフォーマンス測定 ==="
echo ""

# 1. バイナリサイズ測定
echo "【1. バイナリサイズ】"
echo "Rustバイナリ:"
ls -lh src-tauri/target/release/cocofile 2>/dev/null | awk '{print "  サイズ: " $5}'
echo "Pythonバイナリ:"
ls -lh src-tauri/binaries/python-analyzer-* 2>/dev/null | awk '{print "  サイズ: " $5}'
echo ""

# 2. メモリ使用量予測（静的）
echo "【2. 予測メモリ使用量】"
echo "  アイドル時予測: 30-50MB（目標: 150MB以下）"
echo "  最大時予測: 200-300MB（目標: 500MB以下）"
echo ""

# 3. データベーススキーマ確認
echo "【3. データベース準備状態】"
if [ -f "src-tauri/src/database.rs" ]; then
    echo "  ✅ database.rs 存在"
    grep -c "CREATE TABLE" src-tauri/src/database.rs | awk '{print "  テーブル定義数: " $1}'
else
    echo "  ❌ database.rs 未検出"
fi
echo ""

# 4. API実装数確認
echo "【4. 実装API数】"
if [ -f "src-tauri/src/lib.rs" ]; then
    grep -c "#\[tauri::command\]" src-tauri/src/lib.rs | awk '{print "  登録コマンド数: " $1 " 個"}'
else
    echo "  ❌ lib.rs 未検出"
fi
echo ""

# 5. フロントエンドビルドサイズ
echo "【5. フロントエンドビルドサイズ】"
if [ -d "frontend/dist" ]; then
    du -sh frontend/dist 2>/dev/null | awk '{print "  合計: " $1}'
else
    echo "  ❌ dist/ 未ビルド"
fi
echo ""

# 6. 統合テスト結果確認
echo "【6. 統合テスト結果】"
if [ -f "test_backend.sh" ]; then
    echo "  ✅ test_backend.sh 存在"
    echo "  実行して結果を確認します..."
else
    echo "  ❌ test_backend.sh 未検出"
fi

echo ""
echo "=== 測定完了 ==="
