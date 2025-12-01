#!/bin/bash
# Monitor GitHub Actions build and auto-download when ready

VERSION="v0.1.41"
DOWNLOAD_DIR="/mnt/c/Users/muranaka-tenma/Downloads"

echo "Monitoring build for $VERSION..."
echo "Build status: https://github.com/muranaka-tenma/Cocofile/actions"

while true; do
    sleep 30

    # Check if release exists
    if curl -s "https://api.github.com/repos/muranaka-tenma/Cocofile/releases/tags/$VERSION" | grep -q "CocoFile_0.1.41"; then
        echo ""
        echo "✅ Build complete! Downloading..."

        cd "$DOWNLOAD_DIR"
        wget "https://github.com/muranaka-tenma/Cocofile/releases/download/$VERSION/CocoFile_0.1.41_x64-setup.exe"

        echo ""
        echo "========================================="
        echo "✅ ダウンロード完了！"
        echo "場所: $DOWNLOAD_DIR/CocoFile_0.1.41_x64-setup.exe"
        echo ""
        echo "インストール後、F12でデベロッパーツールを開いて"
        echo "Consoleタブでログを確認してください："
        echo "  - [TauriService] getDatabaseStats called"
        echo "  - [TauriService] get_db_stats result"
        echo "========================================="
        break
    else
        echo -n "."
    fi
done
