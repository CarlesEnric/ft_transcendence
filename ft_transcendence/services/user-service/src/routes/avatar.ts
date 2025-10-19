
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import upload from '../utils/avatarUpload.js';
import sqlite3 from 'sqlite3';


export function setupAvatarRoutes(server: FastifyInstance, db: sqlite3.Database): void {
  server.post('/avatar', { preHandler: upload.single('avatar') }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request.user || {}) as { userId?: number };
      if (!user.userId) return reply.code(401).send({ error: 'Unauthorized' });
      const file = (request as any).file;
      if (!file || !file.filename) return reply.code(400).send({ error: 'No file uploaded' });
      const avatarUrl = `/uploads/${file.filename}`;
      await new Promise<void>((resolve, reject) => {
        db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, user.userId], function (err: any) {
          if (err) return reject(err);
          resolve();
        });
      });
      return reply.send({ success: true, avatar_url: avatarUrl });
    } catch (err) {
      if (!reply.sent) reply.code(500).send({ error: 'Unexpected server error', details: String(err) });
    }
  });

  server.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    if (request.routeOptions && request.routeOptions.url === '/avatar' && error && error.name === 'MulterError') {
      return reply.code(415).send({ error: error.message || 'Unsupported Media Type' });
    }
    if (request.routeOptions && request.routeOptions.url === '/avatar' && error && error.message && error.message.includes('imatge')) {
      return reply.code(415).send({ error: error.message });
    }
    if (!reply.sent) reply.code(500).send({ error: 'Unexpected server error', details: String(error) });
  });
}



