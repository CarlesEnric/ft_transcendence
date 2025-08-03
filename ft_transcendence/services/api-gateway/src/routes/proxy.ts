/**
 * Proxy routes for microservices
 * Handles routing requests to appropriate services
 */

import { AppConfig } from '../config/index.js';
import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorResponse } from '../types/index.js';

/**
 * Setup proxy route for a specific service
 */
export const setupProxyRoute = (server: FastifyInstance, prefix: string, target: string): void => {
  server.register(async (fastify: any) => {
    await fastify.register(import('@fastify/http-proxy'), {
      upstream: target,
      prefix: prefix,
      rewritePrefix: '',
      http2: false,
      undici: {
        rejectUnauthorized: false  // Accept self-signed certificates for internal services
      },
      preHandler: async (request: FastifyRequest, _reply: FastifyReply) => {
        // Add forwarded headers
        request.headers['x-forwarded-for'] = request.ip;
        request.headers['x-forwarded-proto'] = 'https';
        request.headers['x-forwarded-host'] = request.headers.host || 'localhost';
        // Forward user identity if authenticated
        if (
          request.user &&
          typeof request.user === 'object' &&
          !Buffer.isBuffer(request.user)
        ) {
          const user = request.user as { userId?: string | number; username?: string; email?: string };
          if (user.userId) request.headers['x-user-id'] = String(user.userId);
          if (user.username) request.headers['x-username'] = String(user.username);
          if (user.email) request.headers['x-email'] = String(user.email);
        }
      },
      replyOptions: {
        onError: (reply: FastifyReply, error: Error) => {
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
export const setupAllProxyRoutes = (server: FastifyInstance, config: AppConfig): void => {
  setupProxyRoute(server, '/api/auth', config.services.auth);
  setupProxyRoute(server, '/api/users', config.services.user);
  setupProxyRoute(server, '/api/games', config.services.game);
  setupProxyRoute(server, '/api/matches', config.services.match);
};
