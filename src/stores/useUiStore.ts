import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'indigo' | 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber';
export type EditorWidth = 'narrow' | 'normal' | 'full';
export type FontSizePreset = 'sm' | 'md' | 'lg';
export type LineHeightPreset = 'compact' | 'normal' | 'spacious';
export type AutoSaveInterval = 400 | 1000 | 2000;
export type TrashRetentionDays = 7 | 30 | 90 | 0;

interface UiState {
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  isHubActive: boolean;
  isProfileOpen: boolean;
  isZenMode: boolean;
  theme: 'dark' | 'light';
  fontPreset: 'default' | 'mono';
  
  // Apariencia & Editor
  accentColor: AccentColor;
  editorWidth: EditorWidth;
  fontSize: FontSizePreset;
  lineHeight: LineHeightPreset;
  enableAnimations: boolean;
  
  // Productividad
  spellCheck: boolean;
  autoSaveInterval: AutoSaveInterval;
  notificationsEnabled: boolean;
  notificationSound: boolean;
  
  // Sistema & Datos
  trashRetentionDays: TrashRetentionDays;
  autoStartWindows: boolean;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setHubActive: (active: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  setZenMode: (zen: boolean) => void;
  toggleZenMode: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontPreset: (preset: 'default' | 'mono') => void;
  setAccentColor: (accent: AccentColor) => void;
  setEditorWidth: (width: EditorWidth) => void;
  setFontSize: (size: FontSizePreset) => void;
  setLineHeight: (lh: LineHeightPreset) => void;
  setEnableAnimations: (enable: boolean) => void;
  setSpellCheck: (check: boolean) => void;
  setAutoSaveInterval: (interval: AutoSaveInterval) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationSound: (sound: boolean) => void;
  setTrashRetentionDays: (days: TrashRetentionDays) => void;
  setAutoStartWindows: (autoStart: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isSearchOpen: false,
      isHubActive: true,
      isProfileOpen: false,
      isZenMode: false,
      theme: 'dark',
      fontPreset: 'default',
      
      accentColor: 'indigo',
      editorWidth: 'normal',
      fontSize: 'md',
      lineHeight: 'normal',
      enableAnimations: true,
      spellCheck: true,
      autoSaveInterval: 400,
      notificationsEnabled: true,
      notificationSound: true,
      trashRetentionDays: 30,
      autoStartWindows: false,

      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setHubActive: (active) => set({ isHubActive: active }),
      setProfileOpen: (open) => set({ isProfileOpen: open }),
      setZenMode: (zen) => set({ isZenMode: zen }),
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      setTheme: (theme) => set({ theme }),
      setFontPreset: (preset) => set({ fontPreset: preset }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setEditorWidth: (editorWidth) => set({ editorWidth }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setEnableAnimations: (enableAnimations) => set({ enableAnimations }),
      setSpellCheck: (spellCheck) => set({ spellCheck }),
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setNotificationSound: (notificationSound) => set({ notificationSound }),
      setTrashRetentionDays: (trashRetentionDays) => set({ trashRetentionDays }),
      setAutoStartWindows: (autoStartWindows) => {
        set({ autoStartWindows });
        if (typeof window !== 'undefined' && window.electronAPI?.setAutoLaunch) {
          window.electronAPI.setAutoLaunch(autoStartWindows).catch(console.error);
        }
      },
    }),
    {
      name: 'notion-local-ui',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
        fontPreset: state.fontPreset,
        accentColor: state.accentColor,
        editorWidth: state.editorWidth,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        enableAnimations: state.enableAnimations,
        spellCheck: state.spellCheck,
        autoSaveInterval: state.autoSaveInterval,
        notificationsEnabled: state.notificationsEnabled,
        notificationSound: state.notificationSound,
        trashRetentionDays: state.trashRetentionDays,
        autoStartWindows: state.autoStartWindows,
      }),
    }
  )
);
