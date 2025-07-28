/**
 * Health Check Routes
 * Service health monitoring endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Setup health check routes
 */
export function setupHealthRoutes(server: FastifyInstance): void {
  // Health Check Endpoint
  server.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({ 
      status: 'healthy', 
      service: 'auth-service',
      timestamp: new Date().toISOString()
    });
  });
}
