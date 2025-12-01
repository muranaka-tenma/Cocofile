#!/bin/bash

# CocoFile - ファイル監視機能テストスクリプト

echo "🧪 CocoFile ファイル監視機能テスト"
echo "=================================="
echo ""

# テスト用ディレクトリを作成
TEST_DIR="/tmp/cocofile-watcher-test"
mkdir -p "$TEST_DIR"
echo "✅ テスト用ディレクトリを作成: $TEST_DIR"
echo ""

echo "📋 テスト手順:"
echo "1. CocoFile アプリを起動します"
echo "2. 設定画面に移動します"
echo "3. 監視フォルダに以下を追加します:"
echo "   → $TEST_DIR"
echo "4. ファイル監視を開始します"
echo "5. このスクリプトが自動的にテストファイルを作成/更新/削除します"
echo ""

read -p "準備ができたら Enter キーを押してください..."
echo ""

# テスト1: ファイル作成
echo "📝 テスト1: ファイル作成"
echo "test content" > "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を作成しました"
sleep 3

echo "test content 2" > "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を作成しました"
sleep 3

# テスト2: ファイル更新
echo "✏️  テスト2: ファイル更新"
echo "updated content" >> "$TEST_DIR/test-file-1.txt"
echo "✅ test-file-1.txt を更新しました"
sleep 3

# テスト3: 新しいファイル作成（別の拡張子）
echo "📄 テスト3: 異なる拡張子のファイル作成"
echo '{"test": "data"}' > "$TEST_DIR/test-data.json"
echo "✅ test-data.json を作成しました"
sleep 3

# テスト4: ファイル削除
echo "🗑️  テスト4: ファイル削除"
rm "$TEST_DIR/test-file-2.txt"
echo "✅ test-file-2.txt を削除しました"
sleep 3

echo ""
echo "✅ テスト完了！"
echo ""
echo "📊 確認事項:"
echo "1. ログを確認してファイル検知されているか"
echo "   → tail -f ~/.local/share/com.cocofile.app/logs/python-bridge-debug.log"
echo "2. データベースを確認"
echo "   → sqlite3 ~/.local/share/com.cocofile.app/cocofile.db \"SELECT file_name FROM file_metadata WHERE file_path LIKE '%cocofile-watcher-test%'\""
echo "3. アプリの検索画面で「test」で検索してファイルが見つかるか"
echo ""
echo "テスト用ディレクトリを削除する場合: rm -rf $TEST_DIR"
