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

  // アプリ起動時に自動でスキャン開始
  useEffect(() => {
    const startAutoScan = async () => {
      try {
        // 少し待ってからスキャン開始（UIが安定してから）
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsScanning(true);
        await invoke('scan_all_drives');
      } catch (error) {
        console.error('Failed to start auto scan:', error);
        setIsScanning(false);
      }
    };

    startAutoScan();

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
