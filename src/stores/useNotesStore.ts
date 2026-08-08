import { create } from 'zustand';
import type { Page } from '@/types/page';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface NotesState {
  pages: Record<string, Page>;
  activePageId: string | null;
  recentPageIds: string[];
  isLoading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  fetchPageById: (id: string) => Promise<Page | null>;
  createPage: (title?: string, content?: string, parentId?: string | null, workspaceId?: string) => Promise<Page | null>;
  createSubPage: (parentId: string, title?: string) => Promise<Page | null>;
  getOrCreateDailyNote: () => Promise<Page | null>;
  updatePage: (id: string, changes: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  setActivePageId: (id: string | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
  clearPages: () => void;
  /** Re-fetch silencioso de una página del servidor para sincronizar metadatos */
  refreshPageMetadata: (id: string) => Promise<void>;
}

const API_BASE = `${API_BASE_URL}/api/pages`;

export const useNotesStore = create<NotesState>((set, get) => ({
  pages: {},
  activePageId: null,
  recentPageIds: [],
  isLoading: true,
  error: null,

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
        console.error('Error HTTP al obtener páginas:', res.status, await res.text());
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Error al obtener páginas:', err);
      set({ isLoading: false });
    }
  },

  fetchPageById: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        const page: Page = await res.json();
        set((state) => ({
          pages: { ...state.pages, [page.id]: page },
        }));
        get().setActivePageId(page.id);
        useUiStore.getState().setHubActive(false);
        return page;
      }
    } catch (err) {
      console.error('Error al obtener la página de invitación:', err);
    }
    return null;
  },

  createPage: async (title = 'Sin título', content = '', parentId: string | null = null, workspaceId?: string) => {
    try {
      const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
      const parentPage = parentId ? get().pages[parentId] : null;
      const targetWorkspaceId = workspaceId || parentPage?.workspaceId || activeWs || 'default';

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ title, content, parentId, workspaceId: targetWorkspaceId, isFavorite: false, isPrivate: true, tags: [] }),
      });

      if (res.ok) {
        const newPage: Page = await res.json();
        set((state) => ({
          pages: { ...state.pages, [newPage.id]: newPage },
        }));
        get().setActivePageId(newPage.id);
        return newPage;
      } else {
        console.error('Error HTTP al crear nota:', res.status, await res.text());
      }
      return null;
    } catch (err) {
      console.error('Error al crear nota:', err);
      return null;
    }
  },

  createSubPage: async (parentId: string, title = 'Sin título') => {
    const parentPage = get().pages[parentId];
    const wsId = parentPage?.workspaceId || useWorkspaceStore.getState().activeWorkspaceId;
    return get().createPage(title, '', parentId, wsId);
  },

  getOrCreateDailyNote: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyTitle = `📅 ${todayStr}`;
    const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
    const allPages = Object.values(get().pages);

    // Buscar si ya existe una nota para la fecha de hoy
    const existing = allPages.find(
      (p) => p.title && p.title.trim() === dailyTitle && (!p.workspaceId || p.workspaceId === activeWs)
    );
    if (existing) {
      get().setActivePageId(existing.id);
      return existing;
    }

    // Plantilla inicial para nota diaria
    const initialContent = JSON.stringify([
      {
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '🎯 Objetivos del día' }],
      },
      {
        type: 'checkListItem',
        content: [{ type: 'text', text: 'Planificar prioridades del día' }],
      },
      {
        type: 'checkListItem',
        content: [{ type: 'text', text: 'Revisar notas pendientes' }],
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '📝 Diario & Reflexiones' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
    ]);

    return get().createPage(dailyTitle, initialContent, null, activeWs);
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
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify(changes),
      });

      if (!res.ok) {
        console.error('Error HTTP al guardar página:', res.status, await res.text());
      }
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
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken, false),
        credentials: 'include',
      });
      if (!res.ok) {
        console.error('Error HTTP al eliminar página:', res.status, await res.text());
        await get().fetchPages();
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      await get().fetchPages();
    }
  },

  clearPages: () => {
    set({ pages: {}, activePageId: null, recentPageIds: [] });
  },

  refreshPageMetadata: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        const page: Page = await res.json();
        const existing = get().pages[id];
        if (existing) {
          // Solo actualizar metadatos, no el contenido (el contenido se sincroniza vía Yjs)
          set((state) => ({
            pages: {
              ...state.pages,
              [id]: {
                ...state.pages[id],
                title: page.title,
                icon: page.icon,
                coverImage: page.coverImage,
                tags: page.tags,
                isFavorite: page.isFavorite,
                isPrivate: page.isPrivate,
                updatedAt: page.updatedAt,
              },
            },
          }));
        }
      }
    } catch {
      // Silencioso: es solo un refresh de fondo
    }
  },
}));
