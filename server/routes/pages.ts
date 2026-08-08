import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pages, pageVersions, blockComments } from '../db/schema';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export const pagesRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect all page routes with session authentication
  fastify.addHook('onRequest', requireAuth);

  // GET /api/pages - List pages for authenticated user
  fastify.get('/', async (request, reply) => {
    const currentUserId = request.user!.id;
    const allPages = await db.select().from(pages);

    // Si existen páginas antiguas sin userId o sin workspaceId, asignárselas para evitar huérfanos
    for (const p of allPages) {
      if (!p.userId) {
        await db.update(pages).set({ userId: currentUserId }).where(eq(pages.id, p.id));
        p.userId = currentUserId;
      }
      if (!p.workspaceId) {
        await db.update(pages).set({ workspaceId: 'default' }).where(eq(pages.id, p.id));
        p.workspaceId = 'default';
      }
    }

    // Filtrar páginas: pertenecientes al usuario actual O públicas en el workspace (no privadas)
    const userPages = allPages.filter(
      (p) => p.userId === currentUserId || !p.isPrivate
    );

    const formatted = userPages.map((p) => ({
      ...p,
      isPrivate: Boolean(p.isPrivate),
      workspaceId: p.workspaceId || 'default',
      tags: typeof p.tags === 'string' ? (JSON.parse(p.tags || '[]') as string[]) : [],
    }));
    return reply.send(formatted);
  });

  // GET /api/pages/:id - Get page by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const currentUserId = request.user!.id;
    const result = await db.select().from(pages).where(eq(pages.id, id));

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Página no encontrada' });
    }

    const pageData = result[0];
    // Verificar si la página es privada y no pertenece al usuario actual
    if (pageData.isPrivate && pageData.userId !== currentUserId) {
      return reply.status(403).send({ error: 'Esta nota es privada' });
    }

    return reply.send({
      ...pageData,
      isPrivate: Boolean(pageData.isPrivate),
      workspaceId: pageData.workspaceId || 'default',
      tags: typeof pageData.tags === 'string' ? (JSON.parse(pageData.tags || '[]') as string[]) : [],
    });
  });

  // POST /api/pages - Create new page
  fastify.post<{
    Body: { title?: string; icon?: string; coverImage?: string; content?: string; isFavorite?: boolean; isPrivate?: boolean; parentId?: string | null; workspaceId?: string; tags?: string[] };
  }>('/', async (request, reply) => {
    const { title, icon, coverImage, content, isFavorite, isPrivate, parentId, workspaceId, tags: tagsList } = request.body || {};
    const currentUserId = request.user!.id;

    const newPage = {
      id: crypto.randomUUID(),
      userId: currentUserId,
      workspaceId: workspaceId || 'default',
      title: title ?? 'Sin título',
      icon: icon ?? null,
      coverImage: coverImage ?? null,
      content: content ?? '',
      parentId: parentId ?? null,
      tags: JSON.stringify(tagsList || []),
      isFavorite: isFavorite ?? false,
      isPrivate: isPrivate ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(pages).values(newPage);
    return reply.status(201).send({
      ...newPage,
      isPrivate: Boolean(newPage.isPrivate),
      workspaceId: newPage.workspaceId,
      tags: tagsList || [],
    });
  });

  // PUT /api/pages/:id - Update page
  fastify.put<{
    Params: { id: string };
    Body: { title?: string; icon?: string | null; coverImage?: string | null; content?: string; isFavorite?: boolean; isPrivate?: boolean; parentId?: string | null; workspaceId?: string; tags?: string[] };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, icon, coverImage, content, isFavorite, isPrivate, parentId, workspaceId, tags: tagsList } = request.body || {};

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
    if (isPrivate !== undefined) updatedData.isPrivate = isPrivate;
    if (parentId !== undefined) updatedData.parentId = parentId;
    if (workspaceId !== undefined) updatedData.workspaceId = workspaceId;
    if (tagsList !== undefined) updatedData.tags = JSON.stringify(tagsList);

    await db.update(pages).set(updatedData).where(eq(pages.id, id));

    const updated = await db.select().from(pages).where(eq(pages.id, id));
    const p = updated[0];
    return reply.send({
      ...p,
      isPrivate: Boolean(p.isPrivate),
      workspaceId: p.workspaceId || 'default',
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

    // 1. Eliminar versiones de historial asociadas
    await db.delete(pageVersions).where(eq(pageVersions.pageId, id));

    // 2. Eliminar comentarios asociados
    await db.delete(blockComments).where(eq(blockComments.pageId, id));

    // 3. Promover sub-páginas a nivel raíz para no dejarlas huérfanas
    await db.update(pages).set({ parentId: null }).where(eq(pages.parentId, id));

    // 4. Eliminar la página
    await db.delete(pages).where(eq(pages.id, id));
    return reply.send({ success: true, message: 'Página eliminada' });
  });
};
