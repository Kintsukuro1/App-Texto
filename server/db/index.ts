import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'notion-local.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

// Seed default workspace row if not exists
try {
  const existing = sqlite.prepare('SELECT id FROM workspace WHERE id = ?').get('default');
  if (!existing) {
    sqlite.prepare('INSERT INTO workspace (id, name) VALUES (?, ?)').run('default', 'Mi Espacio');
  }
} catch {
  // Table created by migrations
}
