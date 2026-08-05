import type { FastifyRequest, FastifyReply } from 'fastify';
import { validateSession, type UserDTO } from './session';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserDTO;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = request.cookies?.session_token;
  if (!token) {
    reply.status(401).send({ error: 'No autorizado' });
    return;
  }

  const user = await validateSession(token);
  if (!user) {
    reply.status(401).send({ error: 'No autorizado' });
    return;
  }

  request.user = user;
}
