// CocoFile - Main Application Entry
import { MainSearchScreen } from './screens/MainSearchScreen';
import { ScanIndexScreen } from './screens/ScanIndexScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TagManagementScreen } from './screens/TagManagementScreen';
import FileOrganizationScreen from './screens/FileOrganizationScreen';
import { DevNavigation } from './components/DevNavigation';
import { useNavigationStore } from './store/navigationStore';
import './App.css';

function App() {
  const { currentScreen } = useNavigationStore();

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
    </>
  );
}

export default App;
