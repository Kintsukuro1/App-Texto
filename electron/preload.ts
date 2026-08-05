import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  /** Información del servidor backend (puerto, IP local, URL LAN) */
  getServerInfo: (): Promise<{
    port: number;
    collabPort: number;
    localIP: string;
    lanURL: string;
  }> => ipcRenderer.invoke('get-server-info'),

  /** Saber si la app arranca con Windows */
  getAutoLaunch: (): Promise<boolean> => ipcRenderer.invoke('get-auto-launch'),

  /** Activar/desactivar el arranque automático con Windows */
  setAutoLaunch: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('set-auto-launch', enabled),

  /** Mostrar la ventana principal (útil desde ajustes o notificaciones) */
  showWindow: (): void => ipcRenderer.send('show-window'),

  /** Indica que la app corre dentro de Electron */
  isElectron: true,
});
