/**
 * Proxy routes for microservices
 * Handles routing requests to appropriate services
 */

import { AppConfig } from '../config/index.js';
import { ServerInstance, AppRequest, AppReply, ErrorResponse } from '../types/index.js';

/**
 * Setup proxy route for a specific service
 */
export const setupProxyRoute = (server: ServerInstance, prefix: string, target: string): void => {
  server.register(async (fastify: any) => {
    await fastify.register(import('@fastify/http-proxy'), {
      upstream: target,
      prefix: prefix,
      rewritePrefix: '',
      http2: false,
      undici: {
        rejectUnauthorized: false  // Accept self-signed certificates for internal services
      },
      preHandler: async (request: AppRequest, _reply: AppReply) => {
        // Add forwarded headers
        request.headers['x-forwarded-for'] = request.ip;
        request.headers['x-forwarded-proto'] = 'https';
        request.headers['x-forwarded-host'] = request.headers.host || 'localhost';
      },
      replyOptions: {
        onError: (reply: AppReply, error: Error) => {
          server.log.error(`Proxy error for ${target}:`, error);
          const errorResponse: ErrorResponse = {
            code: 502,
            error: 'Bad Gateway',
            message: 'Service temporarily unavailable',
            service: prefix
          };
          reply.code(502).send(errorResponse);
        }
      }
    });
  });
};

/**
 * Setup all proxy routes for microservices
 */
export const setupAllProxyRoutes = (server: ServerInstance, config: AppConfig): void => {
  setupProxyRoute(server, '/api/auth', config.services.auth);
  setupProxyRoute(server, '/api/users', config.services.user);
  setupProxyRoute(server, '/api/games', config.services.game);
  setupProxyRoute(server, '/api/matches', config.services.match);
};
