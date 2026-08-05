import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { workspace } from '../db/schema';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  // GET /api/workspace - List all workspaces
  fastify.get('/', async (request, reply) => {
    let list = await db.select().from(workspace);

    if (list.length === 0) {
      const defaultWs = {
        id: 'default',
        name: 'Mi Espacio',
        ownerId: request.user?.id || null,
        createdAt: new Date(),
      };
      await db.insert(workspace).values(defaultWs);
      list = [defaultWs];
    }

    return reply.send(list);
  });

  // POST /api/workspace - Create new workspace
  fastify.post<{ Body: { name?: string } }>('/', async (request, reply) => {
    const { name } = request.body || {};
    const currentUserId = request.user!.id;

    const newWs = {
      id: crypto.randomUUID(),
      name: name?.trim() || 'Nuevo Espacio',
      ownerId: currentUserId,
      createdAt: new Date(),
    };

    await db.insert(workspace).values(newWs);
    return reply.status(201).send(newWs);
  });

  // PUT /api/workspace/:id - Rename workspace
  fastify.put<{
    Params: { id: string };
    Body: { name?: string };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const { name } = request.body || {};

    if (!name || name.trim() === '') {
      return reply.status(400).send({ error: 'El nombre es obligatorio' });
    }

    const existing = await db.select().from(workspace).where(eq(workspace.id, id));
    if (existing.length === 0) {
      // Si no existe pero es el por defecto
      if (id === 'default') {
        const defaultWs = {
          id: 'default',
          name: name.trim(),
          ownerId: request.user?.id || null,
          createdAt: new Date(),
        };
        await db.insert(workspace).values(defaultWs);
        return reply.send(defaultWs);
      }
      return reply.status(404).send({ error: 'Espacio de trabajo no encontrado' });
    }

    await db
      .update(workspace)
      .set({ name: name.trim() })
      .where(eq(workspace.id, id));

    const updated = await db.select().from(workspace).where(eq(workspace.id, id));
    return reply.send(updated[0]);
  });

  // DELETE /api/workspace/:id - Delete workspace
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    if (id === 'default') {
      return reply.status(400).send({ error: 'No se puede eliminar el espacio por defecto' });
    }
    await db.delete(workspace).where(eq(workspace.id, id));
    return reply.send({ success: true, message: 'Espacio eliminado' });
  });
};
