/**
 * Server factory for creating and configuring the Fastify instance
 * Handles server creation with SSL and logging configuration
 */

import fastify from 'fastify';
import fs from 'fs';
import { AppConfig } from './config/index.js';
import { ServerInstance } from './types/index.js';

/**
 * Create a Fastify server instance with proper configuration
 */
export const createServer = (config: AppConfig): ServerInstance => {
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

  // Add request logging hook
  server.addHook('onRequest', async (request: any, reply: any) => {
    server.log.info(`${request.method} ${request.url} - ${request.headers['user-agent'] || 'Unknown'}`);
  });

  return server;
};

/**
 * Create a simple HTTP server that redirects all traffic to HTTPS
 */
export const createRedirectServer = (config: AppConfig): ServerInstance => {
  const redirectServer = fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  }) as any;

  // Add a catch-all route that redirects all HTTP traffic to HTTPS
  redirectServer.route({
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    url: '*',
    handler: async (request: any, reply: any) => {
      const host = request.headers.host || 'localhost';
      const httpsUrl = `https://${host}${request.url}`;
      
      redirectServer.log.info(`HTTP -> HTTPS redirect: ${request.method} ${request.url} -> ${httpsUrl}`);
      return reply.redirect(httpsUrl, 301);
    }
  });

  return redirectServer;
};
