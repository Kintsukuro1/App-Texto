import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { pagesRoutes } from './routes/pages';
import { authRoutes } from './routes/auth';
import { workspaceRoutes } from './routes/workspace';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

/**
 * Crea y configura el servidor Fastify.
 * Puede ser invocado desde Electron main process o desde CLI con `tsx watch`.
 */
export async function startFastify(port: number = PORT): Promise<void> {
  const server = Fastify({ logger: true });

  // Register Cookie plugin
  await server.register(cookie);

  // Register CORS — acepta localhost (dev/Electron renderer) y null origin (Electron file://)
  await server.register(cors, {
    origin: (origin, cb) => {
      const allowed = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
      ];
      if (!origin || allowed.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, true); // En red LAN aceptamos cualquier origen (todos en la misma red privada)
      }
    },
    credentials: true,
  });

  // Health check endpoint
  server.get('/api/health', async () => {
    return { status: 'ok' };
  });

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(pagesRoutes, { prefix: '/api/pages' });
  await server.register(workspaceRoutes, { prefix: '/api/workspace' });

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor Fastify corriendo en http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    throw err;
  }
}

// Punto de entrada directo (para `tsx watch server/index.ts`)
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  startFastify().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
