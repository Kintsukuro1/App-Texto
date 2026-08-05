import { create } from 'zustand';
import { API_BASE_URL } from '@/core/config';

export interface User {
  id: string;
  username: string;
  color: string;
}

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, color: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (changes: { username?: string; color?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

const AUTH_API = `${API_BASE_URL}/api/auth`;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionToken: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    try {
      const res = await fetch(`${AUTH_API}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        // Fetch the raw session token for WebSocket auth
        const tokenRes = await fetch(`${AUTH_API}/token`, { credentials: 'include' });
        const tokenData = tokenRes.ok ? await tokenRes.json() : { token: null };
        set({ user: data.user, sessionToken: tokenData.token, isLoading: false, error: null });
      } else {
        set({ user: null, sessionToken: null, isLoading: false });
      }
    } catch {
      set({ user: null, sessionToken: null, isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ error: null });
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Error al iniciar sesión' });
        return false;
      }

      // Fetch the raw session token for WebSocket auth
      const tokenRes = await fetch(`${AUTH_API}/token`, { credentials: 'include' });
      const tokenData = tokenRes.ok ? await tokenRes.json() : { token: null };
      set({ user: data.user, sessionToken: tokenData.token, error: null });
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },

  register: async (username, password, color) => {
    set({ error: null });
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, color }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Error al crear la cuenta' });
        return false;
      }

      // Fetch the raw session token for WebSocket auth
      const tokenRes = await fetch(`${AUTH_API}/token`, { credentials: 'include' });
      const tokenData = tokenRes.ok ? await tokenRes.json() : { token: null };
      set({ user: data.user, sessionToken: tokenData.token, error: null });
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },

  updateProfile: async (changes) => {
    set({ error: null });
    try {
      const res = await fetch(`${AUTH_API}/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(changes),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Error al actualizar el perfil' });
        return false;
      }

      set({ user: data.user, error: null });
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ error: null });
    try {
      const res = await fetch(`${AUTH_API}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Error al cambiar la contraseña' });
        return false;
      }

      set({ error: null });
      return true;
    } catch {
      set({ error: 'No se pudo conectar con el servidor' });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      set({ user: null, sessionToken: null, error: null });
    }
  },
}));
