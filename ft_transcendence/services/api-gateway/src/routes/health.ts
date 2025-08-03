/**
 * Health check and system routes
 * Provides health monitoring and system information
 */

import { AppConfig } from '../config/index.js';
import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Setup health check routes
 */
export const setupHealthRoutes = (server: FastifyInstance, config: AppConfig): void => {
  // Health check endpoint
  server.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      ssl: config.ssl.enabled,
      services: Object.keys(config.services)
    };
  });

  // API information endpoint
  server.get('/api', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      name: 'FT_TRANSCENDENCE API Gateway',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth/*',
        users: '/api/users/*',
        games: '/api/games/*',
        matches: '/api/matches/*',
        websockets: {
          game: '/ws/game'
        }
      }
    };
  });
};
