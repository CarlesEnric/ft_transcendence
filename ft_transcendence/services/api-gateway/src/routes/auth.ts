// api-gateway/src/plugins/auth.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      const token = request.cookies?.jwt;
      if (!token) return;
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = Number(payload.userId);
      const username = String(payload.username || '');
      const email = payload.email ? String(payload.email) : undefined;
      request.user = { userId, username, email };
    } catch {
    }
  });
};

export default fp(authPlugin);