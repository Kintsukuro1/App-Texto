import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { pagesRoutes } from './routes/pages';
import { versionsRoutes } from './routes/versions';
import { commentsRoutes } from './routes/comments';
import { authRoutes } from './routes/auth';
import { workspaceRoutes } from './routes/workspace';
import { uploadRoutes } from './routes/upload';
import { backupRoutes } from './routes/backup';
import { tunnelRoutes } from './routes/tunnel';
import { attachCollabToHttpServer } from './collab/index';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

/**
 * Crea y configura el servidor Fastify.
 * Puede ser invocado desde Electron main process o desde CLI con `tsx watch`.
 */
export async function startFastify(port: number = PORT): Promise<void> {
  const server = Fastify({ logger: true });

  // Register Cookie plugin
  await server.register(cookie);

  // Register Multipart plugin for file uploads (hasta 15MB por archivo)
  await server.register(multipart, {
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  });

  // Register CORS — acepta localhost y red LAN
  await server.register(cors, {
    origin: (origin, cb) => {
      cb(null, true); // En red local aceptamos cualquier origen
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    credentials: true,
  });

  // Asegurar directorio de uploads
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(process.cwd(), 'data');
  const uploadsDir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Servir archivos estáticos subidos (/uploads/*)
  await server.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Servir app frontend desde /dist si existe (para producción y acceso LAN en navegador)
  const distDir = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'));

  if (hasDist) {
    await server.register(fastifyStatic, {
      root: distDir,
      prefix: '/',
    });

    // Fallback SPA: Cualquier ruta que no sea de la API o un archivo estático devuelve index.html
    server.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api') || request.url.startsWith('/uploads')) {
        reply.status(404).send({ error: 'Ruta no encontrada', statusCode: 404 });
      } else {
        reply.sendFile('index.html', distDir);
      }
    });
  } else {
    // Si no hay dist (por ejemplo en dev sin build), mostrar mensaje explicativo en lugar de 404 crudo
    server.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api') || request.url.startsWith('/uploads')) {
        reply.status(404).send({ error: 'Ruta no encontrada', statusCode: 404 });
      } else {
        reply.status(404).type('text/html').send(`
          <!DOCTYPE html>
          <html>
            <head><title>Notion Local - Servidor Dev</title></head>
            <body style="font-family: sans-serif; background: #1a1d23; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <div style="text-align: center; max-width: 500px; padding: 2rem; background: #232730; border-radius: 1rem; border: 1px solid #333;">
                <h1 style="color: #6366f1; margin-top: 0;">Notion Local Backend</h1>
                <p>El servidor API y WebSockets están activos en el puerto ${port}.</p>
                <p style="color: #a0aec0; font-size: 0.9rem;">Para acceder a la app desde el navegador en modo desarrollo, usa <a href="http://localhost:5173" style="color: #818cf8;">http://localhost:5173</a> o ejecuta <code>npm run build</code> para servir la versión cliente desde este puerto.</p>
              </div>
            </body>
          </html>
        `);
      }
    });
  }

  // Health check endpoint
  server.get('/api/health', async () => {
    return { status: 'ok' };
  });

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(pagesRoutes, { prefix: '/api/pages' });
  await server.register(versionsRoutes, { prefix: '/api/pages' });
  await server.register(commentsRoutes, { prefix: '/api/pages' });
  await server.register(workspaceRoutes, { prefix: '/api/workspace' });
  await server.register(uploadRoutes, { prefix: '/api/upload' });
  await server.register(backupRoutes, { prefix: '/api/backup' });
  await server.register(tunnelRoutes, { prefix: '/api/tunnel' });

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor Fastify corriendo en http://localhost:${port}`);

    // Conectar Hocuspocus al servidor HTTP de Fastify DESPUÉS de que esté escuchando.
    // Esto permite que las conexiones WebSocket de /collab lleguen a la misma instancia
    // de Hocuspocus que atiende las conexiones directas en el puerto 1234.
    const httpServer = server.server;
    if (httpServer) {
      attachCollabToHttpServer(httpServer);
    }
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
