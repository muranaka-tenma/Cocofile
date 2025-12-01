#!/bin/bash

# CocoFile - バックエンドファイル監視テストスクリプト
# GUIなしでファイル監視機能をテストします

echo "🧪 CocoFile バックエンドファイル監視テスト"
echo "=========================================="
echo ""

# データベースとログのパス
DB_PATH="$HOME/.local/share/com.cocofile.app/cocofile.db"
LOG_PATH="$HOME/.local/share/com.cocofile.app/logs/cocofile.log"
TEST_DIR="/tmp/cocofile-watcher-test"

# テスト用ディレクトリを作成
mkdir -p "$TEST_DIR"
echo "✅ テスト用ディレクトリを作成: $TEST_DIR"
echo ""

# データベースに監視フォルダを追加
echo "📝 データベースに監視フォルダを追加..."
sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO settings (key, value) VALUES ('watched_folders', '[\"$TEST_DIR\"]');"
echo "✅ 監視フォルダを追加しました"
echo ""

echo "📋 テスト手順:"
echo "1. 別のターミナルでログを監視:"
echo "   → tail -f $LOG_PATH"
echo ""
echo "2. CocoFileアプリを起動（バックグラウンド）:"
echo "   → cd ~/CocoFile && npm run tauri:dev &"
echo ""
echo "3. アプリ起動後、このスクリプトでテストファイルを作成:"
echo ""

read -p "アプリを起動しましたか？ (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "アプリを起動してから再度実行してください"
    exit 1
fi

echo ""
echo "🔍 テスト開始前のデータベース状態:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) as file_count FROM file_metadata WHERE file_path LIKE '%cocofile-watcher-test%';" | while read count; do
    echo "   現在の登録ファイル数: $count"
done
echo ""

sleep 2

# テスト1: ファイル作成
echo "📝 テスト1: ファイル作成"
echo "test content 1" > "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を作成しました"
sleep 5

echo "test content 2" > "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を作成しました"
sleep 5

# テスト2: ファイル更新
echo ""
echo "✏️  テスト2: ファイル更新"
echo "updated content" >> "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を更新しました"
sleep 5

# テスト3: 新しいファイル作成
echo ""
echo "📄 テスト3: JSONファイル作成"
echo '{"test": "data", "timestamp": "'$(date +%s)'"}' > "$TEST_DIR/test-data.json"
echo "✅ test-data.json を作成しました"
sleep 5

# テスト4: ファイル削除
echo ""
echo "🗑️  テスト4: ファイル削除"
rm "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を削除しました"
sleep 5

echo ""
echo "🔍 テスト完了後のデータベース状態:"
sqlite3 "$DB_PATH" "SELECT file_name, file_size FROM file_metadata WHERE file_path LIKE '%cocofile-watcher-test%' ORDER BY indexed_at DESC;" | while read line; do
    echo "   $line"
done

echo ""
echo "✅ テスト完了！"
echo ""
echo "📊 確認事項:"
echo "1. ログを確認してファイル検知されているか:"
echo "   → tail -20 $LOG_PATH | grep -i watcher"
echo ""
echo "2. データベースを直接確認:"
echo "   → sqlite3 $DB_PATH \"SELECT file_name, indexed_at FROM file_metadata WHERE file_path LIKE '%cocofile-watcher-test%' ORDER BY indexed_at DESC;\""
echo ""
echo "3. テスト用ディレクトリを削除する場合:"
echo "   → rm -rf $TEST_DIR"
echo ""
