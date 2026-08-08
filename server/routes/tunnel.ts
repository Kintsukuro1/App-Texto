import type { FastifyPluginAsync } from 'fastify';
import { spawn, type ChildProcess } from 'child_process';
import { requireAuth } from '../auth/hooks';

let tunnelProcess: ChildProcess | null = null;
let tunnelUrl: string | null = null;
let tunnelStatus: 'idle' | 'starting' | 'active' | 'error' = 'idle';
let tunnelError: string | null = null;

export const startCloudflareTunnel = (port: number = 3001): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (tunnelProcess && tunnelStatus === 'active' && tunnelUrl) {
      return resolve(tunnelUrl);
    }

    // Limpiar estado previo
    if (tunnelProcess) {
      try {
        tunnelProcess.kill();
      } catch {
        // Ignorar
      }
      tunnelProcess = null;
    }

    tunnelStatus = 'starting';
    tunnelError = null;
    tunnelUrl = null;

    const child = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://localhost:${port}`], {
      shell: true,
      windowsHide: true,
    });

    tunnelProcess = child;
    let isResolved = false;

    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        tunnelStatus = 'error';
        tunnelError = 'Tiempo de espera agotado al solicitar túnel de Cloudflare';
        reject(new Error(tunnelError));
      }
    }, 45000);

    const onData = (data: Buffer | string) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        tunnelUrl = match[0];
        tunnelStatus = 'active';
        resolve(tunnelUrl);
      }
    };

    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);

    child.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        tunnelStatus = 'error';
        tunnelError = err.message;
        reject(err);
      }
    });

    child.on('exit', (code) => {
      tunnelProcess = null;
      if (tunnelStatus !== 'idle') {
        tunnelStatus = 'idle';
        tunnelUrl = null;
      }
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        tunnelError = `Proceso de túnel finalizado con código ${code}`;
        reject(new Error(tunnelError));
      }
    });
  });
};

export const stopCloudflareTunnel = async (): Promise<void> => {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill();
    } catch {
      // Ignorar
    }
    tunnelProcess = null;
  }
  tunnelStatus = 'idle';
  tunnelUrl = null;
  tunnelError = null;
};

export const getCloudflareTunnelStatus = () => {
  return {
    isRunning: tunnelStatus === 'active',
    status: tunnelStatus,
    url: tunnelUrl,
    error: tunnelError,
  };
};

export const tunnelRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  // GET /api/tunnel/status
  fastify.get('/status', async (_request, reply) => {
    return reply.send(getCloudflareTunnelStatus());
  });

  // POST /api/tunnel/start
  fastify.post('/start', async (_request, reply) => {
    try {
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
      const url = await startCloudflareTunnel(port);
      return reply.send({ success: true, url });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el túnel';
      return reply.status(500).send({ error: msg });
    }
  });

  // POST /api/tunnel/stop
  fastify.post('/stop', async (_request, reply) => {
    await stopCloudflareTunnel();
    return reply.send({ success: true, message: 'Túnel detenido' });
  });
};
