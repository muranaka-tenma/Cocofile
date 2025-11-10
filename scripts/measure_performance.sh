#!/bin/bash

# CocoFile パフォーマンス測定スクリプト
# Usage: ./scripts/measure_performance.sh

set -e

echo "========================================="
echo "CocoFile Performance Measurement"
echo "========================================="
echo ""

# プロセス名
PROCESS_NAME="cocofile"

# CocoFileが起動しているか確認
if ! pgrep -x "$PROCESS_NAME" > /dev/null; then
    echo "❌ CocoFileが起動していません。"
    echo "   CocoFileを起動してから再度実行してください。"
    exit 1
fi

echo "✅ CocoFileが起動していることを確認しました。"
echo ""

# PIDを取得
PID=$(pgrep -x "$PROCESS_NAME")
echo "PID: $PID"
echo ""

# メモリ使用量を測定（5回、2秒間隔）
echo "📊 メモリ使用量を測定中..."
echo "   （5回測定、2秒間隔）"
echo ""

TOTAL_MEM=0
COUNT=0

for i in {1..5}; do
    # Linux
    if command -v ps &> /dev/null; then
        MEM=$(ps -p $PID -o rss= | tr -d ' ')
        MEM_MB=$(echo "scale=2; $MEM / 1024" | bc)
        echo "   測定 $i: ${MEM_MB} MB"
        TOTAL_MEM=$(echo "$TOTAL_MEM + $MEM_MB" | bc)
        COUNT=$((COUNT + 1))
    fi
    
    if [ $i -lt 5 ]; then
        sleep 2
    fi
done

echo ""

# 平均を計算
if [ $COUNT -gt 0 ]; then
    AVG_MEM=$(echo "scale=2; $TOTAL_MEM / $COUNT" | bc)
    echo "✅ 平均メモリ使用量: ${AVG_MEM} MB"
else
    echo "❌ メモリ使用量の測定に失敗しました。"
fi

echo ""

# CPU使用率を測定（top コマンド）
echo "📊 CPU使用率を測定中..."
echo "   （5秒間測定）"
echo ""

if command -v top &> /dev/null; then
    # Linux
    CPU=$(top -b -n 2 -d 1 -p $PID | tail -1 | awk '{print $9}')
    echo "✅ CPU使用率: ${CPU}%"
else
    echo "❌ CPU使用率の測定に失敗しました（topコマンドが見つかりません）。"
fi

echo ""
echo "========================================="
echo "測定完了"
echo "========================================="
echo ""
echo "📝 結果をGitHub Issueに報告する際は、以下の情報を含めてください："
echo ""
echo "- OS: $(uname -s) $(uname -r)"
echo "- メモリ使用量: ${AVG_MEM:-N/A} MB"
echo "- CPU使用率: ${CPU:-N/A}%"
echo "- 測定時の状態: （アイドル/スキャン中/検索中）"
echo ""
