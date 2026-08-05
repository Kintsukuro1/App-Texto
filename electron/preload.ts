import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expone APIs seguras al proceso renderer (la app React).
 * Únicamente lo que está definido aquí es accesible desde window.electronAPI.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Retorna información del servidor backend que corre en el main process.
   * Útil para mostrar el URL de LAN en la UI y configurar la URL base de la API.
   */
  getServerInfo: (): Promise<{
    port: number;
    collabPort: number;
    localIP: string;
    lanURL: string;
  }> => ipcRenderer.invoke('get-server-info'),

  /** Indica si la app está corriendo dentro de Electron */
  isElectron: true,
});
