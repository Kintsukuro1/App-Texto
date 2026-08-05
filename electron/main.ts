import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as os from 'os';

// --------------------------------------------------------------------------
// Constantes y configuración
// --------------------------------------------------------------------------
const isDev = !app.isPackaged;
const FASTIFY_PORT = 3001;
const COLLAB_PORT = 1234;

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
  // Inyectar DATA_DIR para que server/db/index.ts use la ruta correcta
  process.env.DATA_DIR = dataDir;
  process.env.PORT = String(FASTIFY_PORT);
  process.env.COLLAB_PORT = String(COLLAB_PORT);

  // Importar dinámicamente para que el env esté seteado antes
  const { startFastify } = await import('../server/index.js');
  const { startCollab } = await import('../server/collab/index.js');

  await Promise.all([
    startFastify(FASTIFY_PORT),
    startCollab(COLLAB_PORT, dataDir),
  ]);
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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Se muestra cuando esté lista (evita flash blanco)
    backgroundColor: '#1a1d23',
    icon: path.join(__dirname, '../public/favicon.ico'),
  });

  win.once('ready-to-show', () => win.show());

  // En dev cargamos el servidor de Vite; en prod, servimos desde Fastify
  const url = isDev
    ? 'http://localhost:5173'
    : `http://localhost:${FASTIFY_PORT}`;

  win.loadURL(url);

  // Abrir links externos en el navegador del sistema, no en Electron
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
// IPC Handlers — información del servidor para el Renderer
// --------------------------------------------------------------------------
function setupIPC(): void {
  ipcMain.handle('get-server-info', () => ({
    port: FASTIFY_PORT,
    collabPort: COLLAB_PORT,
    localIP: getLocalIP(),
    lanURL: `http://${getLocalIP()}:${FASTIFY_PORT}`,
  }));
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
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
