// CocoFile - Main Application Entry
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { MainSearchScreen } from './screens/MainSearchScreen';
import { ScanIndexScreen } from './screens/ScanIndexScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TagManagementScreen } from './screens/TagManagementScreen';
import FileOrganizationScreen from './screens/FileOrganizationScreen';
import { DevNavigation } from './components/DevNavigation';
import { useNavigationStore } from './store/navigationStore';
import './App.css';

interface ScanProgress {
  current_drive: string;
  current_folder: string;
  total_files: number;
  processed_files: number;
  status: string;
}

function App() {
  const { currentScreen } = useNavigationStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [showFirstRunDialog, setShowFirstRunDialog] = useState(false);

  // 初回起動チェックと自動スキャン
  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        const firstRun = await invoke<boolean>('is_first_run');
        if (firstRun) {
          setShowFirstRunDialog(true);
        }
      } catch (error) {
        console.error('Failed to check first run:', error);
      }
    };

    checkFirstRun();

    // スキャン進捗イベントをリッスン
    const unlisten = listen<ScanProgress>('scan-progress', (event) => {
      setScanProgress(event.payload);
      if (event.payload.status === 'completed') {
        setIsScanning(false);
        setTimeout(() => setScanProgress(null), 3000);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // 全ドライブスキャンを開始
  const startFullScan = async () => {
    try {
      setShowFirstRunDialog(false);
      setIsScanning(true);
      await invoke('scan_all_drives');
    } catch (error) {
      console.error('Failed to start scan:', error);
      setIsScanning(false);
    }
  };

  // Simple screen router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'main-search':
        return <MainSearchScreen />;
      case 'scan-index':
        return <ScanIndexScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'tag-management':
        return <TagManagementScreen />;
      case 'file-organization':
        return <FileOrganizationScreen />;
      default:
        return <MainSearchScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      {/* Dev navigation - remove in production */}
      {import.meta.env.DEV && <DevNavigation />}

      {/* 初回起動ダイアログ */}
      {showFirstRunDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">CocoFileへようこそ！</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              PC内のファイルをスキャンして、すぐに検索できるようにします。
              初回スキャンには時間がかかる場合があります。
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ※ システムフォルダ（Windows、Program Files等）は自動的に除外されます
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowFirstRunDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                後で
              </button>
              <button
                onClick={startFullScan}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                スキャン開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* スキャン進捗表示 */}
      {(isScanning || scanProgress) && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg z-40 w-80 border border-gray-200">
          <div className="flex items-start gap-3">
            {isScanning && scanProgress?.status !== 'completed' && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent flex-shrink-0 mt-0.5"></div>
            )}
            {scanProgress?.status === 'completed' && (
              <div className="text-green-500 flex-shrink-0">✓</div>
            )}
            <div className="flex-1 min-w-0">
              {scanProgress?.status === 'completed' ? (
                <>
                  <p className="text-green-600 font-medium">スキャン完了！</p>
                  <p className="text-sm text-gray-600">
                    {scanProgress.processed_files.toLocaleString()} ファイルをインデックス化しました
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">
                    PC全体をスキャン中...
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    ドライブ: {scanProgress?.current_drive || '検出中...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate" title={scanProgress?.current_folder}>
                    {scanProgress?.current_folder ? `📁 ${scanProgress.current_folder.split('\\').slice(-2).join('\\')}` : '準備中...'}
                  </p>
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    {scanProgress?.processed_files?.toLocaleString() || 0} ファイル処理済み
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
