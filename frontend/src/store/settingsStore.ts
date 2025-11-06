// CocoFile - Settings Store (Zustand)
// State management for Settings Screen
// Phase 4: Real API integrated

import { create } from 'zustand';
import type { AppSettings, ScanTimingType } from '@/types';
import { TauriService, type TauriAppSettings } from '@/services/TauriService';

/**
 * Tauri型（snake_case）からフロントエンド型（camelCase）に変換
 */
function convertFromTauri(tauri: TauriAppSettings): AppSettings {
  return {
    watchedFolders: tauri.watched_folders,
    excludedFolders: tauri.excluded_folders,
    excludedExtensions: tauri.excluded_extensions,
    scanTiming: tauri.scan_timing as ScanTimingType,
    hotkey: tauri.hotkey,
    windowPosition: tauri.window_position,
    autoHide: tauri.auto_hide,
    theme: (tauri.theme as 'light' | 'dark') || 'light',
    defaultTags: tauri.default_tags,
    tagColors: {},
    lastUpdatedAt: new Date(),
  };
}

/**
 * フロントエンド型（camelCase）からTauri型（snake_case）に変換
 */
function convertToTauri(settings: AppSettings): TauriAppSettings {
  return {
    watched_folders: settings.watchedFolders,
    excluded_folders: settings.excludedFolders,
    excluded_extensions: settings.excludedExtensions,
    scan_timing: settings.scanTiming,
    hotkey: settings.hotkey,
    window_position: settings.windowPosition,
    auto_hide: settings.autoHide,
    theme: settings.theme,
    default_tags: settings.defaultTags,
  };
}

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateScanTiming: (timing: ScanTimingType) => Promise<void>;
  updateAutoHide: (autoHide: boolean) => Promise<void>;
  addWatchedFolder: (folderPath: string) => Promise<void>;
  removeWatchedFolder: (folderPath: string) => Promise<void>;
  addExcludedFolder: (folderPath: string) => Promise<void>;
  removeExcludedFolder: (folderPath: string) => Promise<void>;
  addExcludedExtension: (extension: string) => Promise<void>;
  removeExcludedExtension: (extension: string) => Promise<void>;
  addDefaultTag: (tagName: string) => Promise<void>;
  removeDefaultTag: (tagName: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const tauriSettings = await TauriService.getSettings();
      const settings = convertFromTauri(tauriSettings);
      set({ settings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateScanTiming: async (timing: ScanTimingType) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = { ...currentSettings, scanTiming: timing };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateAutoHide: async (autoHide: boolean) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = { ...currentSettings, autoHide };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addWatchedFolder: async (folderPath: string) => {
    try {
      await TauriService.addWatchedFolder(folderPath);
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            watchedFolders: [...currentSettings.watchedFolders, folderPath],
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeWatchedFolder: async (folderPath: string) => {
    try {
      await TauriService.removeWatchedFolder(folderPath);
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            watchedFolders: currentSettings.watchedFolders.filter(
              (f) => f !== folderPath
            ),
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addExcludedFolder: async (folderPath: string) => {
    try {
      await TauriService.addExcludedFolder(folderPath);
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            excludedFolders: [...currentSettings.excludedFolders, folderPath],
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeExcludedFolder: async (folderPath: string) => {
    try {
      await TauriService.removeExcludedFolder(folderPath);
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            excludedFolders: currentSettings.excludedFolders.filter(
              (f) => f !== folderPath
            ),
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addExcludedExtension: async (extension: string) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          excludedExtensions: [
            ...currentSettings.excludedExtensions,
            extension,
          ],
        };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeExcludedExtension: async (extension: string) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          excludedExtensions: currentSettings.excludedExtensions.filter(
            (e) => e !== extension
          ),
        };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addDefaultTag: async (tagName: string) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          defaultTags: [...currentSettings.defaultTags, tagName],
        };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeDefaultTag: async (tagName: string) => {
    try {
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          defaultTags: currentSettings.defaultTags.filter((t) => t !== tagName),
        };
        await TauriService.saveSettings(convertToTauri(updatedSettings));
        set({ settings: updatedSettings });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
