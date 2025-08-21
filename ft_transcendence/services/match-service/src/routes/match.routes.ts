import type { FastifyPluginAsync } from 'fastify';
import { createMatch, listMatches, getDashboard } from '../controllers/match.controller.js';


const matchesRoutes: FastifyPluginAsync = async (fastify: import('fastify').FastifyInstance) => {
  // fastify.addHook('preHandler', fastify.authenticate);
  
  fastify.post('/', createMatch);
  fastify.get('/', listMatches);
  fastify.get('/dashboard', getDashboard);
};

export default matchesRoutes;
