import { Server as HocuspocusServer } from '@hocuspocus/server';
import { Database as HocuspocusDatabase } from '@hocuspocus/extension-database';
import Database from 'better-sqlite3';
import { validateSession } from '../auth/session';
import path from 'path';
import fs from 'fs';
import type { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';

const COLLAB_PORT = Number(process.env.COLLAB_PORT) || 1234;

let hocuspocusInstance: HocuspocusServer | null = null;

/**
 * Crea la instancia de Hocuspocus (sin ponerla a escuchar en ningún puerto).
 * Reutilizable tanto para modo standalone como para modo compartido.
 */
function getOrCreateHocuspocus(dataDir: string): HocuspocusServer {
  if (hocuspocusInstance) return hocuspocusInstance;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'yjs-docs.db');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS "documents" (
      "name" varchar(255) NOT NULL,
      "data" blob NOT NULL,
      PRIMARY KEY ("name")
    );
  `);

  const selectStmt = db.prepare('SELECT data FROM "documents" WHERE name = ?');
  const upsertStmt = db.prepare(`
    INSERT INTO "documents" ("name", "data") VALUES (?, ?)
    ON CONFLICT(name) DO UPDATE SET data = excluded.data
  `);

  const server = new HocuspocusServer({
    extensions: [
      new HocuspocusDatabase({
        async fetch(data) {
          const row = selectStmt.get(data.documentName) as { data: Buffer } | undefined;
          return row ? new Uint8Array(row.data) : null;
        },
        async store(data) {
          upsertStmt.run(data.documentName, Buffer.from(data.state));
        },
      }),
    ],

    async onAuthenticate(data) {
      let token = data.token || null;

      if (!token) {
        const cookieHeader = data.requestHeaders.cookie || '';
        const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }

      if (!token) {
        throw new Error('Unauthorized: Session token missing');
      }

      const user = await validateSession(token);

      if (!user) {
        throw new Error('Unauthorized: Invalid or expired session');
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          color: user.color,
        },
      };
    },
  });

  hocuspocusInstance = server;
  return server;
}

/**
 * Arranca el servidor de colaboración Hocuspocus en su propio puerto (modo standalone).
 * Se usa para conexiones directas por LAN (ws://IP:1234).
 */
export async function startCollab(
  port: number = COLLAB_PORT,
  dataDir?: string
): Promise<void> {
  const resolvedDataDir =
    dataDir ??
    (process.env.DATA_DIR
      ? path.resolve(process.env.DATA_DIR)
      : path.join(process.cwd(), 'data'));

  const server = getOrCreateHocuspocus(resolvedDataDir);
  await server.listen(port);
  console.log(`🚀 Servidor de colaboración Hocuspocus corriendo en ws://localhost:${port}`);
}

/**
 * Conecta Hocuspocus al servidor HTTP de Fastify para que los WebSockets
 * de colaboración funcionen a través del mismo puerto (3001) y del túnel Cloudflare.
 *
 * Debe llamarse DESPUÉS de startCollab (para que la instancia exista)
 * y DESPUÉS de server.ready() (para que server.server exista).
 */
export function attachCollabToHttpServer(httpServer: HttpServer): void {
  if (!hocuspocusInstance) {
    console.error('[collab] No hay instancia de Hocuspocus. ¿Se llamó startCollab primero?');
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    // Solo manejar rutas de colaboración
    if (!request.url || (!request.url.startsWith('/collab') && !request.url.startsWith('/ws'))) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      hocuspocusInstance?.handleConnection(ws, request);
      console.log('[collab] WebSocket upgrade exitoso para:', request.url);
    });
  });

  console.log('🔗 Hocuspocus conectado al servidor HTTP de Fastify (puerto compartido)');
}

// Punto de entrada directo (para `tsx watch server/collab/index.ts`)
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  startCollab().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
