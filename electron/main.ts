import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as os from 'os';

// --------------------------------------------------------------------------
// Constantes y configuración
// --------------------------------------------------------------------------
const isDev = !app.isPackaged;
const FASTIFY_PORT = 3001;
const COLLAB_PORT = 1234;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// --------------------------------------------------------------------------
// Obtener IP local de la red LAN
// --------------------------------------------------------------------------
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// --------------------------------------------------------------------------
// Rutas de datos: AppData en producción, ./data en desarrollo
// --------------------------------------------------------------------------
function getDataDir(): string {
  if (isDev) {
    return path.join(process.cwd(), 'data');
  }
  return path.join(app.getPath('userData'), 'data');
}

// --------------------------------------------------------------------------
// Arrancar servidores backend
// --------------------------------------------------------------------------
async function startServers(dataDir: string): Promise<void> {
  process.env.DATA_DIR = dataDir;
  process.env.PORT = String(FASTIFY_PORT);
  process.env.COLLAB_PORT = String(COLLAB_PORT);

  const { startFastify } = await import('../server/index.js');
  const { startCollab } = await import('../server/collab/index.js');

  await Promise.all([
    startFastify(FASTIFY_PORT),
    startCollab(COLLAB_PORT, dataDir),
  ]);
}

// --------------------------------------------------------------------------
// System Tray
// --------------------------------------------------------------------------
function createTray(): void {
  // Crear icono de tray — usar PNG nativo si existe, si no usar un ícono vacío
  const iconPath = isDev
    ? path.join(process.cwd(), 'public', 'tray-icon.png')
    : path.join(__dirname, '..', 'public', 'tray-icon.png');

  let trayIcon = nativeImage.createEmpty();
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Fallback: crear un ícono de 16x16 negro programáticamente
      trayIcon = nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABeSURBVDiNY2AYBUMPMBITVFZWpjExMf1nYGD4z0BEgImBgYGBkZGRkZGJiYmBkYmJiYGJiYmBkYmJiYGJiYmBkYmJiYGJiYmBkYmJiYGRiYmRgYmRkQEAAAD//wMABRYCxVJxHEIAAAAASUVORK5CYII='
      );
    }
  } catch {
    // Si falla, el tray funcionará sin ícono visible
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Notion Local');

  updateTrayMenu();

  // Click en el ícono del tray → mostrar/enfocar la ventana
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const localIP = getLocalIP();
  const lanURL = `http://${localIP}:${FASTIFY_PORT}`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Notion Local',
      enabled: false,
      icon: undefined,
    },
    { type: 'separator' },
    {
      label: '📂 Abrir Notion Local',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: `🌐 Dirección LAN: ${localIP}`,
      enabled: false,
    },
    {
      label: '📋 Copiar URL de red',
      click: () => {
        const { clipboard } = require('electron');
        clipboard.writeText(lanURL);
      },
    },
    {
      label: '🌍 Abrir en navegador',
      click: () => {
        shell.openExternal(lanURL);
      },
    },
    { type: 'separator' },
    {
      label: '❌ Salir',
      role: 'quit',
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// --------------------------------------------------------------------------
// Crear ventana principal
// --------------------------------------------------------------------------
function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#1a1d23',
    icon: path.join(__dirname, '../public/favicon.svg'),
  });

  win.once('ready-to-show', () => win.show());

  // Al cerrar la ventana → minimizar al tray en lugar de salir
  win.on('close', (event) => {
    if (tray && !app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `http://localhost:${FASTIFY_PORT}`;

  win.loadURL(url);

  win.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
    shell.openExternal(externalUrl);
    return { action: 'deny' };
  });

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

// --------------------------------------------------------------------------
// IPC Handlers
// --------------------------------------------------------------------------
function setupIPC(): void {
  ipcMain.handle('get-server-info', () => ({
    port: FASTIFY_PORT,
    collabPort: COLLAB_PORT,
    localIP: getLocalIP(),
    lanURL: `http://${getLocalIP()}:${FASTIFY_PORT}`,
  }));

  // Controlar el arranque automático con Windows
  ipcMain.handle('get-auto-launch', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('set-auto-launch', (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe'),
    });
    return true;
  });

  // Mostrar ventana desde el renderer (ej. botón en settings)
  ipcMain.on('show-window', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// --------------------------------------------------------------------------
// Ciclo de vida de Electron
// --------------------------------------------------------------------------
app.whenReady().then(async () => {
  const dataDir = getDataDir();

  try {
    await startServers(dataDir);
  } catch (err) {
    console.error('Error al iniciar servidores:', err);
    app.quit();
    return;
  }

  setupIPC();
  mainWindow = createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

// Marcar que la app está saliendo de verdad (no por cerrar ventana)
app.on('before-quit', () => {
  (app as typeof app & { isQuitting: boolean }).isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // No hacer nada — la app sigue en el tray
  }
});
