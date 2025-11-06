// CocoFile - Navigation Store
// Simple state-based navigation for Tauri desktop app

import { create } from 'zustand';

export type Screen = 'main-search' | 'settings' | 'scan-index' | 'tag-management' | 'file-organization';

interface NavigationState {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentScreen: 'main-search',
  navigateTo: (screen: Screen) => set({ currentScreen: screen }),
}));
