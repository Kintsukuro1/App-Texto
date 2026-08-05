import type { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { createSession, deleteSession } from '../auth/session';
import { requireAuth } from '../auth/hooks';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/register
  fastify.post<{
    Body: { username?: string; password?: string; color?: string };
  }>('/register', async (request, reply) => {
    const { username, password, color } = request.body || {};

    if (!username || !password || !color) {
      return reply
        .status(400)
        .send({ error: 'Username, password y color son requeridos' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, normalizedUsername));

    if (existing.length > 0) {
      return reply
        .status(400)
        .send({ error: 'El nombre de usuario ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const newUser = {
      id: userId,
      username: normalizedUsername,
      passwordHash,
      color,
      createdAt: new Date(),
    };

    await db.insert(users).values(newUser);

    const token = await createSession(userId);

    reply.setCookie('session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return reply.status(201).send({
      user: {
        id: newUser.id,
        username: newUser.username,
        color: newUser.color,
      },
    });
  });

  // POST /api/auth/login
  fastify.post<{
    Body: { username?: string; password?: string };
  }>('/login', async (request, reply) => {
    const { username, password } = request.body || {};

    if (!username || !password) {
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, normalizedUsername));

    if (userResult.length === 0) {
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    const user = userResult[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Credenciales inválidas' });
    }

    const token = await createSession(user.id);

    reply.setCookie('session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
    });

    return reply.send({
      user: {
        id: user.id,
        username: user.username,
        color: user.color,
      },
    });
  });

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    const token = request.cookies?.session_token;
    if (token) {
      await deleteSession(token);
    }

    reply.clearCookie('session_token', { path: '/' });
    return reply.send({ success: true });
  });

  // GET /api/auth/me
  fastify.get(
    '/me',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user!;
      return reply.send({
        user: {
          id: user.id,
          username: user.username,
          color: user.color,
        },
      });
    }
  );

  // GET /api/auth/token — devuelve el session token para pasarlo al WebSocket (Hocuspocus)
  fastify.get(
    '/token',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const token = request.cookies?.session_token;
      return reply.send({ token });
    }
  );

  // PUT /api/auth/me - Update profile (username, color)
  fastify.put<{
    Body: { username?: string; color?: string };
  }>(
    '/me',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user!;
      const { username, color } = request.body || {};

      const updates: Record<string, unknown> = {};

      if (username !== undefined && username.trim() !== '') {
        const normalizedUsername = username.trim().toLowerCase();
        if (normalizedUsername !== user.username) {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.username, normalizedUsername));

          if (existing.length > 0) {
            return reply
              .status(400)
              .send({ error: 'El nombre de usuario ya está registrado' });
          }
          updates.username = normalizedUsername;
        }
      }

      if (color !== undefined && color.trim() !== '') {
        updates.color = color;
      }

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
      }

      const updatedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      return reply.send({
        user: {
          id: updatedUser[0].id,
          username: updatedUser[0].username,
          color: updatedUser[0].color,
        },
      });
    }
  );

  // POST /api/auth/change-password - Change password
  fastify.post<{
    Body: { currentPassword?: string; newPassword?: string };
  }>(
    '/change-password',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user!;
      const { currentPassword, newPassword } = request.body || {};

      if (!currentPassword || !newPassword) {
        return reply
          .status(400)
          .send({ error: 'Ambas contraseñas son requeridas' });
      }

      const userDb = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      if (userDb.length === 0) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userDb[0].passwordHash
      );

      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id));

      return reply.send({ success: true, message: 'Contraseña actualizada' });
    }
  );
};
