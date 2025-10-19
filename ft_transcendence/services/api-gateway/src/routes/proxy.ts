// Node.js global setTimeout declaration for TypeScript compatibility
declare var setTimeout: (handler: (...args: any[]) => void, timeout: number) => number;
/**
 * Proxy routes for microservices
 * Handles routing requests to appropriate services
 */

import { AppConfig } from '../config/gateway.config.js';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { ErrorResponse } from '../types/gateway.types.js';
import globalSseRoute from './globalSse.js';

/**
 * Setup proxy route for a specific service
 */
export const setupProxyRoute = (server: FastifyInstance, prefix: string, target: string): void => {
  server.register(async (fastify: any) => {
    await fastify.register(import('@fastify/http-proxy'), {
      upstream: target,
      prefix: '/uploads/' === prefix ? '/uploads/' : prefix,
      rewritePrefix: prefix === '/api/users' ? '/users' : (prefix === '/api/avatar' ? '/avatar' : (prefix === '/uploads/' ? '/uploads/' : '')),
      http2: false,
      undici: { rejectUnauthorized: false },

      // >>> AQUI inyectamos SIEMPRE cabeceras de identidad verificadas
      rewriteRequestHeaders: (req: FastifyRequest, headers: Record<string, string>) => {
        const h: Record<string, string> = {
          ...headers,
          'x-forwarded-for': req.ip || '',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': req.headers.host ?? 'localhost',
        };

        // Cookies / Authorization se mantienen si existen
        if (req.headers.cookie) h['cookie'] = String(req.headers.cookie);
        if (req.headers.authorization) h['authorization'] = String(req.headers.authorization);

        // Identidad verificada por el gateway:
        const u = (req as any).user as { userId?: number; username?: string; email?: string } | undefined;

        // ⚠️ SIEMPRE sobreescribe lo que venga del cliente:
        h['x-user-id'] = u?.userId ? String(u.userId) : '';
        h['x-username'] = u?.username ?? '';
        if (u?.email) h['x-email'] = u.email;

        return h;
      },

      replyOptions: {
        onError: (reply: FastifyReply, error: Error) => {
          server.log.error(`Proxy error for ${target}: ${error.message}`);
          const errorResponse: ErrorResponse = {
            code: 502,
            error: 'Bad Gateway',
            message: 'Service temporarily unavailable',
            service: prefix
          };
          reply.code(502).send(errorResponse);
          return;
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
  setupProxyRoute(server, '/api/avatar', config.services.user); // direct avatar proxy
  setupProxyRoute(server, '/api/users', config.services.user);
  setupProxyRoute(server, '/api/game', config.services.game);
  setupProxyRoute(server, '/api/matches', config.services.match);
  setupProxyRoute(server, '/uploads/', config.services.user); // proxy static avatar files
};
