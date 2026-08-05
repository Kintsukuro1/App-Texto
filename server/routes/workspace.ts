import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { workspace } from '../db/schema';
import { requireAuth } from '../auth/hooks';

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect all workspace routes with session authentication
  fastify.addHook('onRequest', requireAuth);

  // GET /api/workspace - Get workspace details
  fastify.get('/', async (_request, reply) => {
    const result = await db.select().from(workspace).where(eq(workspace.id, 'default'));
    if (result.length === 0) {
      // Fallback
      return reply.send({ id: 'default', name: 'Mi Espacio' });
    }
    return reply.send(result[0]);
  });

  // PUT /api/workspace - Update workspace details
  fastify.put<{
    Body: { name?: string };
  }>('/', async (request, reply) => {
    const { name } = request.body || {};

    if (!name || name.trim() === '') {
      return reply.status(400).send({ error: 'El nombre del espacio es requerido' });
    }

    const trimmedName = name.trim();

    const existing = await db.select().from(workspace).where(eq(workspace.id, 'default'));
    if (existing.length === 0) {
      await db.insert(workspace).values({ id: 'default', name: trimmedName });
    } else {
      await db.update(workspace).set({ name: trimmedName }).where(eq(workspace.id, 'default'));
    }

    return reply.send({ id: 'default', name: trimmedName });
  });
};
