import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  isHubActive: boolean;
  isProfileOpen: boolean;
  theme: 'dark' | 'light';
  fontPreset: 'default' | 'mono';
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setHubActive: (active: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontPreset: (preset: 'default' | 'mono') => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isSearchOpen: false,
      isHubActive: true,
      isProfileOpen: false,
      theme: 'dark',
      fontPreset: 'default',
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setHubActive: (active) => set({ isHubActive: active }),
      setProfileOpen: (open) => set({ isProfileOpen: open }),
      setTheme: (theme) => set({ theme }),
      setFontPreset: (preset) => set({ fontPreset: preset }),
    }),
    {
      name: 'notion-local-ui',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
        fontPreset: state.fontPreset,
      }),
    }
  )
);
