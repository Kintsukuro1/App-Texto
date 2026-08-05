import { create } from 'zustand';
import type { Page } from '@/types/page';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface NotesState {
  pages: Record<string, Page>;
  activePageId: string | null;
  recentPageIds: string[];
  isLoading: boolean;
  fetchPages: () => Promise<void>;
  createPage: (title?: string, parentId?: string | null) => Promise<Page | null>;
  createSubPage: (parentId: string, title?: string) => Promise<Page | null>;
  updatePage: (id: string, changes: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  setActivePageId: (id: string | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
}

const API_BASE = `${API_BASE_URL}/api/pages`;

export const useNotesStore = create<NotesState>((set, get) => ({
  pages: {},
  activePageId: null,
  recentPageIds: [],
  isLoading: true,

  setActivePageId: (id) =>
    set((state) => {
      if (!id) {
        return { activePageId: null };
      }
      useUiStore.getState().setHubActive(false);
      const filtered = state.recentPageIds.filter((rId) => rId !== id);
      const nextRecent = [id, ...filtered].slice(0, 8);
      return {
        activePageId: id,
        recentPageIds: nextRecent,
      };
    }),

  fetchPages: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(API_BASE, {
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        const list: Page[] = await res.json();
        const pagesMap: Record<string, Page> = {};
        list.forEach((p) => {
          pagesMap[p.id] = p;
        });

        const currentActive = get().activePageId;
        const newActive =
          currentActive && pagesMap[currentActive]
            ? currentActive
            : list.length > 0
            ? list[0].id
            : null;

        set({ pages: pagesMap, isLoading: false });
        if (newActive) {
          get().setActivePageId(newActive);
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createPage: async (title = 'Sin título', parentId: string | null = null) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ title, content: '', parentId, isFavorite: false, tags: [] }),
      });

      if (res.ok) {
        const newPage: Page = await res.json();
        set((state) => ({
          pages: { ...state.pages, [newPage.id]: newPage },
        }));
        get().setActivePageId(newPage.id);
        return newPage;
      }
      return null;
    } catch {
      return null;
    }
  },

  createSubPage: async (parentId: string, title = 'Sin título') => {
    return get().createPage(title, parentId);
  },

  toggleFavorite: async (id: string) => {
    const existing = get().pages[id];
    if (!existing) return;

    const newFavoriteState = !existing.isFavorite;
    const updated = {
      ...existing,
      isFavorite: newFavoriteState,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    set((state) => ({
      pages: { ...state.pages, [id]: updated },
    }));

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ isFavorite: newFavoriteState }),
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Rollback on error
      set((state) => ({
        pages: { ...state.pages, [id]: existing },
      }));
    }
  },

  updatePage: async (id, changes) => {
    const existing = get().pages[id];
    if (!existing) return;

    const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() };

    // Optimistic update
    set((state) => ({
      pages: { ...state.pages, [id]: updated },
    }));

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify(changes),
      });
    } catch (err) {
      console.error('Error updating page:', err);
    }
  },

  deletePage: async (id) => {
    set((state) => {
      const nextPages = { ...state.pages };
      delete nextPages[id];

      const nextRecent = state.recentPageIds.filter((rId) => rId !== id);
      const remainingIds = Object.keys(nextPages);
      const nextActiveId =
        state.activePageId === id
          ? remainingIds.length > 0
            ? remainingIds[0]
            : null
          : state.activePageId;

      return { pages: nextPages, activePageId: nextActiveId, recentPageIds: nextRecent };
    });

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error deleting page:', err);
    }
  },
}));
