const getDynamicApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    // Si la app es servida directamente por Fastify (puerto 3001 o sin puerto explícito)
    if (window.location.port === '3001') {
      return '';
    }
    // Si se accede desde Vite dev server (puerto 5173), conectar al backend en la misma IP/host en el puerto 3001
    return `${window.location.protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getDynamicApiUrl();
