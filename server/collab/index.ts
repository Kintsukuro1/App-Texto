import { Server } from '@hocuspocus/server';
import { Database as HocuspocusDatabase } from '@hocuspocus/extension-database';
import Database from 'better-sqlite3';
import { validateSession } from '../auth/session';
import path from 'path';
import fs from 'fs';

const COLLAB_PORT = Number(process.env.COLLAB_PORT) || 1234;

/**
 * Arranca el servidor de colaboración Hocuspocus.
 * Puede ser invocado desde Electron main process o desde CLI con `tsx watch`.
 */
export async function startCollab(
  port: number = COLLAB_PORT,
  dataDir?: string
): Promise<void> {
  // Directorio de datos: parámetro > env var > cwd/data
  const resolvedDataDir =
    dataDir ??
    (process.env.DATA_DIR
      ? path.resolve(process.env.DATA_DIR)
      : path.join(process.cwd(), 'data'));

  if (!fs.existsSync(resolvedDataDir)) {
    fs.mkdirSync(resolvedDataDir, { recursive: true });
  }

  const dbPath = path.join(resolvedDataDir, 'yjs-docs.db');
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

  const server = new Server({
    port,
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
      const cookieHeader = data.requestHeaders.cookie || '';
      const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;

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

  await server.listen(port);
  console.log(`🚀 Servidor de colaboración Hocuspocus corriendo en ws://localhost:${port}`);
}

// Punto de entrada directo (para `tsx watch server/collab/index.ts`)
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  startCollab().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
