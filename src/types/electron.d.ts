/**
 * Tipos globales expuestos por el preload de Electron vía contextBridge.
 * Solo disponibles cuando la app corre dentro de Electron.
 */
interface ElectronAPI {
  /** Información del servidor backend que corre en el main process */
  getServerInfo: () => Promise<{
    port: number;
    collabPort: number;
    localIP: string;
    lanURL: string;
  }>;

  /** Saber si la app arranca automáticamente con Windows */
  getAutoLaunch: () => Promise<boolean>;

  /** Activar o desactivar el arranque automático con Windows */
  setAutoLaunch: (enabled: boolean) => Promise<boolean>;

  /** Mostrar la ventana principal desde el renderer */
  showWindow: () => void;

  /** True cuando la app corre dentro de Electron */
  isElectron: boolean;
}

interface Window {
  electronAPI?: ElectronAPI;
}
