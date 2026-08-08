const getDynamicApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

    // Si estamos en Vite dev server (puerto 5173):
    if (window.location.port === '5173') {
      return `${protocol}//${hostname}:3001`;
    }

    // Si la app se sirve desde Fastify o detrás de un túnel (Cloudflare, Ngrok):
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getDynamicApiUrl();

/**
 * Retorna los headers por defecto para las peticiones API,
 * incluyendo la cabecera Authorization Bearer si se proporciona un token.
 * Si `hasBody` es falso (ej. peticiones DELETE o GET sin cuerpo), omite 'Content-Type'
 * para evitar errores FST_ERR_CTP_EMPTY_JSON_BODY en Fastify.
 */
export const getAuthHeaders = (
  sessionToken?: string | null,
  hasBody = true
): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  return headers;
};

/**
 * Resuelve URLs de imágenes cargadas (ej. /uploads/...).
 * Si la URL es relativa (/uploads/file.png) o contiene un dominio antiguo de túnel (https://...trycloudflare.com/uploads/file.png),
 * extrae el path relativo /uploads/... y lo antepone con el API_BASE_URL dinámico actual.
 */
export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const uploadsIndex = trimmed.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const relativePath = trimmed.substring(uploadsIndex);
    return `${API_BASE_URL}${relativePath}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return trimmed;
};
