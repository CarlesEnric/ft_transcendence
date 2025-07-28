/**
 * Health check and system routes
 * Provides health monitoring and system information
 */

import { AppConfig } from '../config/index.js';
import { ServerInstance, AppRequest, AppReply } from '../types/index.js';

/**
 * Setup health check routes
 */
export const setupHealthRoutes = (server: ServerInstance, config: AppConfig): void => {
  // Health check endpoint
  server.get('/health', async (request: AppRequest, reply: AppReply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      ssl: config.ssl.enabled,
      services: Object.keys(config.services)
    };
  });

  // API information endpoint
  server.get('/api', async (request: AppRequest, reply: AppReply) => {
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
