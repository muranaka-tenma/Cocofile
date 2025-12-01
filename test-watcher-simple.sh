#!/bin/bash

# CocoFile - 簡易ファイル監視テスト（sqlite3不要）

echo "🧪 CocoFile ファイル監視テスト（簡易版）"
echo "========================================"
echo ""

TEST_DIR="/tmp/cocofile-watcher-test"
LOG_PATH="$HOME/.local/share/com.cocofile.app/logs/cocofile.log"

# テスト用ディレクトリを作成
mkdir -p "$TEST_DIR"
echo "✅ テスト用ディレクトリを作成: $TEST_DIR"
echo ""

echo "📋 このテストでは："
echo "  1. テストファイルを作成/更新/削除します"
echo "  2. ログでファイル検知を確認します"
echo ""
echo "⚠️  注意: アプリが起動していることを確認してください"
echo ""

read -p "準備ができたら Enter キーを押してください..."
echo ""

# ログ監視を開始（バックグラウンド）
echo "📝 ログ監視を開始します..."
tail -f "$LOG_PATH" | grep -i "watcher\|file.*test" &
LOG_PID=$!
echo "   (Ctrl+C でログ監視を停止)"
echo ""

sleep 2

# テスト1: ファイル作成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 テスト1: ファイル作成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "test content 1" > "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を作成"
sleep 5

echo "test content 2" > "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を作成"
sleep 5

# テスト2: ファイル更新
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✏️  テスト2: ファイル更新"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "updated content" >> "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を更新"
sleep 5

# テスト3: JSONファイル作成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 テスト3: JSONファイル作成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo '{"test": "data", "timestamp": "'$(date +%s)'"}' > "$TEST_DIR/test-data.json"
echo "✅ test-data.json を作成"
sleep 5

# テスト4: ファイル削除
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  テスト4: ファイル削除"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を削除"
sleep 5

# ログ監視を停止
echo ""
kill $LOG_PID 2>/dev/null
echo ""

echo "✅ テスト完了！"
echo ""
echo "📊 確認事項:"
echo "1. 上記のログ出力でファイル検知メッセージが表示されているか"
echo ""
echo "2. 手動でログを確認:"
echo "   → tail -20 $LOG_PATH | grep -i watcher"
echo ""
echo "3. テスト用ディレクトリの内容を確認:"
echo "   → ls -la $TEST_DIR"
echo ""
echo "4. テスト用ディレクトリを削除する場合:"
echo "   → rm -rf $TEST_DIR"
echo ""
