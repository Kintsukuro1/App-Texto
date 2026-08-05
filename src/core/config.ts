const getDynamicApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getDynamicApiUrl();

/**
 * Retorna los headers por defecto para las peticiones API,
 * incluyendo la cabecera Authorization Bearer si se proporciona un token.
 */
export const getAuthHeaders = (sessionToken?: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  return headers;
};
