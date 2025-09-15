/**
 * Server factory for creating and configuring the Fastify instance
 * Handles server creation with SSL and logging configuration
 */

import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fs from 'fs';
import path from 'path';
import { AppConfig } from './config/gateway.config.js';
import { FastifyInstance } from 'fastify';
import { handleSpaRoutes } from './middleware/spa.middleware.js';

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

  // Register cookie parser with minimal configuration
  server.register(fastifyCookie, {
    parseOptions: {}
  });
  
  // Add SPA routes middleware
  server.addHook('preHandler', handleSpaRoutes);
  
  // Register JWT plugin with fixed secret
  const jwtSecret = "ft_transcendence_jwt_secret_keep_secure";
  server.log.info(`[DEBUG] Using JWT secret for authentication`);
  server.register(fastifyJwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: '24h'
    }
  });

  // JWT authentication hook
  server.addHook('onRequest', async (request, reply) => {
    // Log the request for debugging
    server.log.info(`[DEBUG] API Gateway request URL: ${request.url}, Method: ${request.method}`);
    
    // Always allow frontend routes
    if (!request.url.startsWith('/api')) {
      return;
    }
    
    // Allow all /api/auth routes without verification
    if (request.url.startsWith('/api/auth')) {
      server.log.info(`[DEBUG] Skipping auth for auth endpoint: ${request.url}`);
      return;
    }
    
    // List of public API routes that don't require authentication
    const publicApiPaths = [
      '/api/v1/auth',
      '/health', 
      '/ws', 
      '/favicon.ico'
    ];
    
    // Skip JWT verification for public paths
    if (publicApiPaths.some(path => request.url.startsWith(path))) {
      return;
    }

    try {
      // Try to verify JWT from Authorization header
      if (request.headers.authorization) {
        await request.jwtVerify();
        return;
      } 
      
      // If no Authorization header, check for JWT cookie
      if (request.cookies && request.cookies.jwt) {
        const token = request.cookies.jwt;
        request.headers.authorization = `Bearer ${token}`;
        try {
          await request.jwtVerify();
          return;
        } catch (cookieError) {
          // Log the error for debugging
          request.log.error(`JWT verification failed for cookie: ${
            cookieError instanceof Error ? cookieError.message : 'Unknown error'
          }`);
          throw cookieError;
        }
      }
      
      // No valid authentication method found
      throw new Error('No authentication token found');
    } catch (err) {
      // Return 401 for API routes
      reply.code(401).send({ 
        success: false, 
        message: 'Authentication required',
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    }
  });

  return server;
};
