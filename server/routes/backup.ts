import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../auth/hooks';
import path from 'path';
import fs from 'fs';

export const backupRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  // GET /api/backup/export - Descargar backup de la base de datos SQLite
  fastify.get('/export', async (request, reply) => {
    const dataDir = process.env.DATA_DIR
      ? path.resolve(process.env.DATA_DIR)
      : path.resolve(process.cwd(), 'data');

    const dbPath = path.join(dataDir, 'notion-local.db');

    if (!fs.existsSync(dbPath)) {
      return reply.status(404).send({ error: 'Base de datos no encontrada' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `notion-local-backup-${todayStr}.db`;

    const stream = fs.createReadStream(dbPath);
    return reply
      .header('Content-Type', 'application/octet-stream')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(stream);
  });
};
