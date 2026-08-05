import { useAuthStore } from '@/features/auth/store/useAuthStore';

const getDynamicApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    if (window.location.port === '3001') {
      return '';
    }
    return `${window.location.protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getDynamicApiUrl();

/**
 * Retorna los headers por defecto para las peticiones API,
 * incluyendo el token de autorización Bearer si está disponible.
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().sessionToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
