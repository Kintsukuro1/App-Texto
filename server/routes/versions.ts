import type { FastifyPluginAsync } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { pages, pageVersions, users } from '../db/schema';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';

export const versionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  // GET /api/pages/:pageId/versions - List versions for a page
  fastify.get<{ Params: { pageId: string } }>('/:pageId/versions', async (request, reply) => {
    const { pageId } = request.params;

    const list = await db
      .select({
        id: pageVersions.id,
        pageId: pageVersions.pageId,
        userId: pageVersions.userId,
        title: pageVersions.title,
        content: pageVersions.content,
        createdAt: pageVersions.createdAt,
        username: users.username,
        userColor: users.color,
      })
      .from(pageVersions)
      .leftJoin(users, eq(pageVersions.userId, users.id))
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.createdAt));

    return reply.send(list);
  });

  // POST /api/pages/:pageId/versions - Create a version snapshot
  fastify.post<{ Params: { pageId: string } }>('/:pageId/versions', async (request, reply) => {
    const { pageId } = request.params;
    const currentUserId = request.user!.id;

    // Obtener estado actual de la página
    const existing = await db.select().from(pages).where(eq(pages.id, pageId));
    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Página no encontrada' });
    }

    const page = existing[0];
    const newVersion = {
      id: crypto.randomUUID(),
      pageId,
      userId: currentUserId,
      title: page.title || 'Sin título',
      content: page.content || '',
      createdAt: new Date(),
    };

    await db.insert(pageVersions).values(newVersion);
    return reply.status(201).send(newVersion);
  });

  // POST /api/pages/:pageId/versions/:versionId/restore - Restore a version
  fastify.post<{
    Params: { pageId: string; versionId: string };
  }>('/:pageId/versions/:versionId/restore', async (request, reply) => {
    const { pageId, versionId } = request.params;

    const versionResult = await db.select().from(pageVersions).where(eq(pageVersions.id, versionId));
    if (versionResult.length === 0) {
      return reply.status(404).send({ error: 'Versión no encontrada' });
    }

    const targetVersion = versionResult[0];

    // Actualizar página con título y contenido de la versión restaurada
    await db
      .update(pages)
      .set({
        title: targetVersion.title,
        content: targetVersion.content,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, pageId));

    const updated = await db.select().from(pages).where(eq(pages.id, pageId));
    return reply.send(updated[0]);
  });
};
