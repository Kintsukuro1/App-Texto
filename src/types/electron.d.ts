/**
 * Tipos globales expuestos por el preload de Electron vía contextBridge.
 * Solo disponibles cuando la app corre dentro de Electron.
 */
interface ElectronAPI {
  getServerInfo: () => Promise<{
    port: number;
    collabPort: number;
    localIP: string;
    lanURL: string;
  }>;
  isElectron: boolean;
}

interface Window {
  electronAPI?: ElectronAPI;
}
