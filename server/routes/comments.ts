import type { FastifyPluginAsync } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { blockComments, users } from '../db/schema';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';

export const commentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  // GET /api/pages/:pageId/comments - List comments for a page
  fastify.get<{ Params: { pageId: string } }>('/:pageId/comments', async (request, reply) => {
    const { pageId } = request.params;

    const list = await db
      .select({
        id: blockComments.id,
        pageId: blockComments.pageId,
        blockId: blockComments.blockId,
        userId: blockComments.userId,
        content: blockComments.content,
        resolved: blockComments.resolved,
        createdAt: blockComments.createdAt,
        username: users.username,
        userColor: users.color,
      })
      .from(blockComments)
      .leftJoin(users, eq(blockComments.userId, users.id))
      .where(eq(blockComments.pageId, pageId))
      .orderBy(desc(blockComments.createdAt));

    return reply.send(list);
  });

  // POST /api/pages/:pageId/comments - Add a new comment
  fastify.post<{
    Params: { pageId: string };
    Body: { content?: string; blockId?: string };
  }>('/:pageId/comments', async (request, reply) => {
    const { pageId } = request.params;
    const { content, blockId } = request.body || {};
    const currentUserId = request.user!.id;

    if (!content || content.trim() === '') {
      return reply.status(400).send({ error: 'El contenido del comentario es requerido' });
    }

    const newComment = {
      id: crypto.randomUUID(),
      pageId,
      blockId: blockId || null,
      userId: currentUserId,
      content: content.trim(),
      resolved: false,
      createdAt: new Date(),
    };

    await db.insert(blockComments).values(newComment);

    return reply.status(201).send({
      ...newComment,
      username: request.user!.username,
      userColor: request.user!.color,
    });
  });

  // PUT /api/comments/:commentId/resolve - Toggle comment resolved state
  fastify.put<{
    Params: { commentId: string };
    Body: { resolved?: boolean };
  }>('/comments/:commentId/resolve', async (request, reply) => {
    const { commentId } = request.params;
    const { resolved } = request.body || {};

    const existing = await db.select().from(blockComments).where(eq(blockComments.id, commentId));
    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Comentario no encontrado' });
    }

    const newResolvedState = resolved !== undefined ? resolved : !existing[0].resolved;
    await db
      .update(blockComments)
      .set({ resolved: newResolvedState })
      .where(eq(blockComments.id, commentId));

    return reply.send({ id: commentId, resolved: newResolvedState });
  });

  // DELETE /api/comments/:commentId - Delete a comment
  fastify.delete<{ Params: { commentId: string } }>('/comments/:commentId', async (request, reply) => {
    const { commentId } = request.params;
    await db.delete(blockComments).where(eq(blockComments.id, commentId));
    return reply.send({ success: true, message: 'Comentario eliminado' });
  });
};
