import fp from 'fastify-plugin';
import { initializeDb } from '../database.setup.js';
import type { FastifyPluginAsync } from 'fastify';
declare module 'fastify' {
  interface FastifyInstance { db: Awaited<ReturnType<typeof initializeDb>>; }
  interface FastifyRequest { db: Awaited<ReturnType<typeof initializeDb>>; }
}
const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const db = await initializeDb();
  fastify.decorate('db', db);
  fastify.addHook('preHandler', (req, _res, next) => { req.db = db; next(); });
};
export default fp(dbPlugin);
