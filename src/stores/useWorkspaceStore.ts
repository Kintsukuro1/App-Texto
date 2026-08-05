import { create } from 'zustand';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface WorkspaceState {
  name: string;
  isLoading: boolean;
  error: string | null;
  fetchWorkspace: () => Promise<void>;
  updateWorkspace: (name: string) => Promise<boolean>;
}

const WORKSPACE_API = `${API_BASE_URL}/api/workspace`;

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  name: 'Mi Espacio',
  isLoading: false,
  error: null,

  fetchWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(WORKSPACE_API, {
        method: 'GET',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        set({ name: data.name || 'Mi Espacio', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateWorkspace: async (name: string) => {
    set({ error: null });
    try {
      const res = await fetch(WORKSPACE_API, {
        method: 'PUT',
        headers: getAuthHeaders(useAuthStore.getState().sessionToken),
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error || 'Error al actualizar el espacio de trabajo' });
        return false;
      }

      set({ name: data.name, error: null });
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },
}));
