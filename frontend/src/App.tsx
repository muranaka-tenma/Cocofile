// CocoFile - Main Application Entry
import { useEffect, useState } from "react";
// import { invoke } from '@tauri-apps/api/core'; // Temporarily disabled with auto-scan
import { listen } from "@tauri-apps/api/event";
import { MainSearchScreen } from "./screens/MainSearchScreen";
import { ScanIndexScreen } from "./screens/ScanIndexScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TagManagementScreen } from "./screens/TagManagementScreen";
import FileOrganizationScreen from "./screens/FileOrganizationScreen";
import { DevNavigation } from "./components/DevNavigation";
import { useNavigationStore } from "./store/navigationStore";
import { useSettingsStore } from "./store/settingsStore";
import { useTheme } from "./hooks/useTheme";
import { useToastStore } from "./store/toastStore";
import { ToastContainer } from "./components/ui/toast";
import "./App.css";

interface ScanProgress {
  current_drive: string;
  current_folder: string;
  total_files: number;
  processed_files: number;
  status: string;
}

function App() {
  const { currentScreen } = useNavigationStore();
  const { loadSettings, startFileWatcher, settings } = useSettingsStore();
  const { toasts, removeToast } = useToastStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  // テーマを初期化
  useTheme();

  // 設定を読み込んでファイル監視を自動開始
  useEffect(() => {
    const initializeFileWatcher = async () => {
      await loadSettings();
    };

    initializeFileWatcher();
  }, [loadSettings]);

  // 設定が読み込まれたらファイル監視を開始
  useEffect(() => {
    if (settings && settings.watchedFolders.length > 0) {
      console.log("[App] Auto-starting file watcher...");
      startFileWatcher().catch((error) => {
        console.error("[App] Failed to start file watcher:", error);
      });
    }
  }, [settings, startFileWatcher]);

  // ファイル監視イベントをリッスン
  useEffect(() => {
    const unlisten = listen<{
      indexed: number;
      deleted: number;
      errors: number;
      timestamp: string;
    }>("file-watcher-update", (event) => {
      console.log("[FileWatcher] Update received:", event.payload);
      const { indexed, deleted, errors } = event.payload;

      // 通知を表示（オプション）
      if (indexed > 0 || deleted > 0) {
        console.log(
          `[FileWatcher] ${indexed} files indexed, ${deleted} files deleted${errors > 0 ? `, ${errors} errors` : ""}`,
        );
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 初回起動時のみ自動でPC全体をスキャン
  useEffect(() => {
    const startAutoScanOnFirstRun = async () => {
      try {
        // Tauri環境でない場合はスキップ
        if (typeof window === "undefined" || !("__TAURI__" in window)) {
          console.log("[App] Not in Tauri environment, skipping auto-scan");
          return;
        }

        const { invoke } = await import("@tauri-apps/api/core");

        // 初回起動かチェック
        const isFirstRun = await invoke<boolean>("is_first_run");

        if (isFirstRun) {
          console.log("[App] First run detected! Starting full system scan...");
          // UIが安定してから少し待つ
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setIsScanning(true);
          await invoke("scan_all_drives");
          console.log("[App] Full system scan initiated");
        } else {
          console.log("[App] Not first run, skipping auto-scan");
        }
      } catch (error) {
        console.error(
          "[App] Failed to check first run or start auto scan:",
          error,
        );
        setIsScanning(false);
      }
    };

    startAutoScanOnFirstRun();

    // スキャン進捗イベントをリッスン
    const unlisten = listen<ScanProgress>("scan-progress", (event) => {
      setScanProgress(event.payload);
      if (event.payload.status === "completed") {
        setIsScanning(false);
        setTimeout(() => setScanProgress(null), 3000);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Simple screen router
  const renderScreen = () => {
    switch (currentScreen) {
      case "main-search":
        return <MainSearchScreen />;
      case "scan-index":
        return <ScanIndexScreen />;
      case "settings":
        return <SettingsScreen />;
      case "tag-management":
        return <TagManagementScreen />;
      case "file-organization":
        return <FileOrganizationScreen />;
      default:
        return <MainSearchScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      {/* Navigation menu */}
      <DevNavigation />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* スキャン進捗表示 */}
      {(isScanning || scanProgress) && (
        <div className="fixed bottom-4 right-4 bg-card rounded-lg p-4 shadow-lg z-40 w-80 border border-border">
          <div className="flex items-start gap-3">
            {isScanning && scanProgress?.status !== "completed" && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent flex-shrink-0 mt-0.5"></div>
            )}
            {scanProgress?.status === "completed" && (
              <div className="text-green-500 flex-shrink-0">✓</div>
            )}
            <div className="flex-1 min-w-0">
              {scanProgress?.status === "completed" ? (
                <>
                  <p className="text-green-600 font-medium">スキャン完了！</p>
                  <p className="text-sm text-muted-foreground">
                    {scanProgress.processed_files.toLocaleString()}{" "}
                    ファイルをインデックス化しました
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">
                    PC全体をスキャン中...
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    ドライブ: {scanProgress?.current_drive || "検出中..."}
                  </p>
                  <p
                    className="text-xs text-muted-foreground truncate"
                    title={scanProgress?.current_folder}
                  >
                    {scanProgress?.current_folder
                      ? `📁 ${scanProgress.current_folder.split("\\").slice(-2).join("\\")}`
                      : "準備中..."}
                  </p>
                  <p className="text-sm font-medium text-primary mt-2">
                    {scanProgress?.processed_files?.toLocaleString() || 0}{" "}
                    ファイル処理済み
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
