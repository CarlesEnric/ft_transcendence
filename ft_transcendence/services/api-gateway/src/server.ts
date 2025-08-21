/**
 * Server factory for creating and configuring the Fastify instance
 * Handles server creation with SSL and logging configuration
 */

import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fs from 'fs';
import { AppConfig } from './config/gateway.config.js';
import { FastifyInstance } from 'fastify';

/**
 * Create a Fastify server instance with proper configuration
 */
export const createServer = (config: AppConfig): FastifyInstance => {
  const serverOptions: any = {
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  };

  // Add HTTPS configuration if SSL is enabled
  if (config.ssl.enabled && 
      fs.existsSync(config.ssl.keyPath) && 
      fs.existsSync(config.ssl.certPath)) {
    serverOptions.https = {
      key: fs.readFileSync(config.ssl.keyPath),
      cert: fs.readFileSync(config.ssl.certPath)
    };
  }

  const server = fastify(serverOptions) as any;

  // Register cookie parser BEFORE JWT
  server.register(fastifyCookie);
  // Register JWT plugin
  // Log només el secret a l'arrencada
  server.log.info(`[DEBUG] JWT_SECRET a l'arrencada: ${process.env.JWT_SECRET}`);
  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    cookie: { cookieName: 'jwt', signed: false }
  });

  // Decorate authenticate method
  server.decorate('authenticate', async (request: any, reply: any) => {
    server.log.info('AUTHENTICATE CALLED for', request.url);
    server.log.info('[DEBUG] Incoming cookies:', request.cookies);
    server.log.info('[DEBUG] Incoming headers:', request.headers);
    server.log.info('[DEBUG] Raw request.headers.cookie:', request.headers.cookie);
    server.log.info('[DEBUG] request.rawHeaders:', request.raw && request.raw.rawHeaders ? request.raw.rawHeaders : 'no rawHeaders');
    server.log.info('[DEBUG] request.hostname:', request.hostname);
    server.log.info('[DEBUG] request.protocol:', request.protocol);
    server.log.info('[DEBUG] request.ip:', request.ip);
    server.log.info('[DEBUG] request.ips:', request.ips);
    server.log.info('[DEBUG] request.url:', request.url);
    server.log.info('[DEBUG] request.method:', request.method);
    server.log.info('[DEBUG] request.headers.host:', request.headers.host);
    server.log.info('[DEBUG] request.headers["cookie"]:', request.headers["cookie"]);
    try {
      // fastify-jwt ja busca el token a Authorization header o cookie automàticament
      await request.jwtVerify();
      server.log.info('[DEBUG] JWT verification successful');
      // Opcional: log del payload decodificat
      try {
        const token = request.cookies && request.cookies.jwt ? request.cookies.jwt : (request.headers['authorization'] && request.headers['authorization'].startsWith('Bearer ') ? request.headers['authorization'].substring(7) : undefined);
        if (token) {
          const base64Payload = token.split('.')[1];
          const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
          server.log.info('[DEBUG] Decoded JWT payload:', payload);
        }
      } catch (e) {
        server.log.error('[DEBUG] Failed to decode JWT payload:', e);
      }
    } catch (err) {
      server.log.error('JWT ERROR CAUGHT!');
      server.log.error('Authorization header:', request.headers['authorization']);
      server.log.error('Cookies:', request.cookies);
      server.log.error('JWT ERROR:', err);
      server.log.error('[JWT validation error]:', err && (err as any).message);
      server.log.error('Request headers:', request.headers);
      server.log.error('Request URL:', request.url);
      server.log.error('Request method:', request.method);
      server.log.error('Request hostname:', request.hostname);
      server.log.error('Request protocol:', request.protocol);
      reply.code(401).send({ error: 'Invalid token', debug: {
        cookies: request.cookies,
        headers: request.headers,
        url: request.url,
        method: request.method,
        hostname: request.hostname,
        protocol: request.protocol,
        jwtError: err && (err as any).message
      }});
    }
  });

  // HTTP->HTTPS redirect server is fully disabled for debugging HTTP cookie handling
  server.addHook('onRequest', async (request: any, reply: any) => {
    server.log.info(`${request.method} ${request.url} - ${request.headers['user-agent'] || 'Unknown'}`);
  });

  // Add JWT validation for all /api/* routes
  server.addHook('preHandler', async (request: any, reply: any) => {
    server.log.info('preHandler for', request.url);
    if (
      request.url.startsWith('/api/') &&
      !request.url.startsWith('/api/auth/') && // auth endpoints are public
      !request.url.startsWith('/api/ws/') && // websocket endpoints are public for now
      !request.url.includes('/health') // health endpoints are public (matches /health anywhere in path)
    ) {
      await server.authenticate(request, reply);
    }
  });

  return server;

/**
 * Create a simple HTTP server that redirects all traffic to HTTPS
 */
// export const createRedirectServer = (config: AppConfig): FastifyInstance => {
//   const redirectServer = fastify({
//     logger: {
//       level: config.nodeEnv === 'production' ? 'info' : 'debug'
//     }
//   }) as any;

//   // Add a catch-all route that redirects all HTTP traffic to HTTPS
//   redirectServer.route({
//     method: ['GET', 'POST', 'PUT', 'DELETE'],
//     url: '*',
//     handler: async (request: any, reply: any) => {
//       const host = request.headers.host || 'localhost';
//       const httpsUrl = `https://${host}${request.url}`;
      
//       redirectServer.log.info(`HTTP -> HTTPS redirect: ${request.method} ${request.url} -> ${httpsUrl}`);
//       return reply.redirect(httpsUrl, 301);
//     }
//   });

//   return redirectServer;
}

