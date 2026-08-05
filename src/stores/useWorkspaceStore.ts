import { create } from 'zustand';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface WorkspaceItem {
  id: string;
  name: string;
  ownerId?: string | null;
}

interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  name: string;
  isLoading: boolean;
  error: string | null;
  fetchWorkspace: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Promise<boolean>;
  updateWorkspace: (name: string) => Promise<boolean>;
}

const WORKSPACE_API = `${API_BASE_URL}/api/workspace`;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [{ id: 'default', name: 'Mi Espacio' }],
  activeWorkspaceId: 'default',
  name: 'Mi Espacio',
  isLoading: false,
  error: null,

  fetchWorkspace: async () => {
    await get().fetchWorkspaces();
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(WORKSPACE_API, {
        method: 'GET',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });

      if (res.ok) {
        const data: WorkspaceItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const activeId = get().activeWorkspaceId;
          const current = data.find((w) => w.id === activeId) || data[0];
          set({
            workspaces: data,
            activeWorkspaceId: current.id,
            name: current.name,
            isLoading: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveWorkspace: (id: string) => {
    const target = get().workspaces.find((w) => w.id === id);
    if (target) {
      set({ activeWorkspaceId: target.id, name: target.name });
    }
  },

  createWorkspace: async (name: string) => {
    set({ error: null });
    try {
      const res = await fetch(WORKSPACE_API, {
        method: 'POST',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const newWs: WorkspaceItem = await res.json();
        set((state) => ({
          workspaces: [...state.workspaces, newWs],
          activeWorkspaceId: newWs.id,
          name: newWs.name,
        }));
        return true;
      }
    } catch (err) {
      console.error('Error al crear espacio de trabajo:', err);
    }
    return false;
  },

  updateWorkspace: async (name: string) => {
    set({ error: null });
    const currentId = get().activeWorkspaceId;
    try {
      const res = await fetch(`${WORKSPACE_API}/${currentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error || 'Error al actualizar espacio' });
        return false;
      }

      set((state) => ({
        name: data.name,
        workspaces: state.workspaces.map((w) => (w.id === currentId ? { ...w, name: data.name } : w)),
        error: null,
      }));
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },
}));
