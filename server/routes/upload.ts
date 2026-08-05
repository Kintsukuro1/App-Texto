import type { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../auth/hooks';

export const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No se envió ningún archivo' });
      }

      // Validar que sea una imagen o GIF
      if (!data.mimetype.startsWith('image/')) {
        return reply
          .status(400)
          .send({ error: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP, SVG)' });
      }

      const dataDir = process.env.DATA_DIR
        ? path.resolve(process.env.DATA_DIR)
        : path.resolve(process.cwd(), 'data');

      const uploadsDir = path.join(dataDir, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(data.filename) || '.png';
      const uniqueFilename = `${crypto.randomUUID()}${ext.toLowerCase()}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Guardar el archivo en disco
      await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        data.file.pipe(writeStream);
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
      });

      const fileUrl = `/uploads/${uniqueFilename}`;
      return reply.send({ url: fileUrl });
    }
  );
};
