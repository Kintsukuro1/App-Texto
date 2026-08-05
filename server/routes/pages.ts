import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pages } from '../db/schema';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';

export const pagesRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect all page routes with session authentication
  fastify.addHook('onRequest', requireAuth);

  // GET /api/pages - List all pages
  fastify.get('/', async (_request, reply) => {
    const allPages = await db.select().from(pages);
    // Parse tags from JSON string to Array for client
    const formatted = allPages.map((p) => ({
      ...p,
      tags: typeof p.tags === 'string' ? (JSON.parse(p.tags || '[]') as string[]) : [],
    }));
    return reply.send(formatted);
  });

  // GET /api/pages/:id - Get page by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await db.select().from(pages).where(eq(pages.id, id));

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Página no encontrada' });
    }

    const pageData = result[0];
    return reply.send({
      ...pageData,
      tags: typeof pageData.tags === 'string' ? (JSON.parse(pageData.tags || '[]') as string[]) : [],
    });
  });

  // POST /api/pages - Create new page
  fastify.post<{
    Body: { title?: string; icon?: string; coverImage?: string; content?: string; isFavorite?: boolean; parentId?: string | null; tags?: string[] };
  }>('/', async (request, reply) => {
    const { title, icon, coverImage, content, isFavorite, parentId, tags: tagsList } = request.body || {};
    const newPage = {
      id: crypto.randomUUID(),
      title: title ?? 'Sin título',
      icon: icon ?? null,
      coverImage: coverImage ?? null,
      content: content ?? '',
      parentId: parentId ?? null,
      tags: JSON.stringify(tagsList || []),
      isFavorite: isFavorite ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(pages).values(newPage);
    return reply.status(201).send({
      ...newPage,
      tags: tagsList || [],
    });
  });

  // PUT /api/pages/:id - Update page
  fastify.put<{
    Params: { id: string };
    Body: { title?: string; icon?: string | null; coverImage?: string | null; content?: string; isFavorite?: boolean; parentId?: string | null; tags?: string[] };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, icon, coverImage, content, isFavorite, parentId, tags: tagsList } = request.body || {};

    const existing = await db.select().from(pages).where(eq(pages.id, id));
    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Página no encontrada' });
    }

    const updatedData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updatedData.title = title;
    if (icon !== undefined) updatedData.icon = icon;
    if (coverImage !== undefined) updatedData.coverImage = coverImage;
    if (content !== undefined) updatedData.content = content;
    if (isFavorite !== undefined) updatedData.isFavorite = isFavorite;
    if (parentId !== undefined) updatedData.parentId = parentId;
    if (tagsList !== undefined) updatedData.tags = JSON.stringify(tagsList);

    await db.update(pages).set(updatedData).where(eq(pages.id, id));

    const updated = await db.select().from(pages).where(eq(pages.id, id));
    const p = updated[0];
    return reply.send({
      ...p,
      tags: typeof p.tags === 'string' ? (JSON.parse(p.tags || '[]') as string[]) : [],
    });
  });

  // DELETE /api/pages/:id - Delete page
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const existing = await db.select().from(pages).where(eq(pages.id, id));

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Página no encontrada' });
    }

    // Promover sub-páginas a nivel raíz para no huérfanas
    await db.update(pages).set({ parentId: null }).where(eq(pages.parentId, id));

    await db.delete(pages).where(eq(pages.id, id));
    return reply.send({ success: true, message: 'Página eliminada' });
  });
};
