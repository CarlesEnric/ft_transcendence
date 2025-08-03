/**
 * Utility functions for the API Gateway
 * Shared utilities and helper functions
 */

import fs from 'fs';
import path from 'path';
import { AppConfig } from '../config/index.js';
import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorResponse } from '../types/index.js';

/**
 * Get MIME type for a file extension
 */
const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Setup error handlers
 */
export const setupErrorHandlers = (server: FastifyInstance, config: AppConfig): void => {
  // Static file serving and SPA fallback
  server.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;
    
    // If it's an API route, return 404
    if (url.startsWith('/api/') || url.startsWith('/ws/')) {
      const errorResponse: ErrorResponse = {
        code: 404,
        error: 'Not Found',
        message: 'API endpoint not found'
      };
      reply.code(404).send(errorResponse);
      return;
    }
    
    // Try to serve static files first
    const filePath = path.join(config.frontend.staticPath, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const mimeType = getMimeType(filePath);
      reply.type(mimeType).send(fs.readFileSync(filePath));
      return;
    }
    
    // For all other routes (SPA routes), serve index.html
    const indexPath = path.join(config.frontend.staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      reply.type('text/html').send(fs.readFileSync(indexPath));
    } else {
      const errorResponse: ErrorResponse = {
        code: 404,
        error: 'Not Found',
        message: 'Frontend not built or not available'
      };
      reply.code(404).send(errorResponse);
    }
  });

  // Global error handler
  server.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    server.log.error('Unhandled error:', error);
    
    const errorResponse: ErrorResponse = {
      code: 500,
      error: 'Internal Server Error',
      message: config.nodeEnv === 'development' ? error.message : 'Something went wrong',
      date: Date.now()
    };
    
    reply.code(500).send(errorResponse);
  });
};

/**
 * Setup graceful shutdown
 */
export const setupGracefulShutdown = (server: FastifyInstance): void => {
  const gracefulShutdown = async (signal: string): Promise<void> => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
      await server.close();
      server.log.info('Server closed successfully');
      process.exit(0);
    } catch (error) {
      server.log.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

/**
 * Start the server with proper logging
 */
export const startServer = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  try {
    const address = await server.listen({ 
      port: config.port, 
      host: config.host 
    });
    
    server.log.info(`API Gateway started successfully!`);
    server.log.info(`Server listening on ${address}`);
    server.log.info(`SSL ${config.ssl.enabled ? 'enabled' : 'disabled'}`);
    server.log.info(`Environment: ${config.nodeEnv}`);
    server.log.info(`Services: ${Object.keys(config.services).join(', ')}`);
    
    // Log service URLs in development
    if (config.nodeEnv === 'development') {
      server.log.info('Service URLs:');
      Object.entries(config.services).forEach(([name, url]) => {
        server.log.info(`  - ${name}: ${url}`);
      });
    }
    
  } catch (error) {
    server.log.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Start the HTTP redirect server
 */
export const startRedirectServer = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  try {
    const address = await server.listen({ 
      port: 80, 
      host: config.host 
    });
    
    server.log.info(`HTTP Redirect Server started on ${address}`);
    server.log.info(`All HTTP traffic will be redirected to HTTPS`);
    
  } catch (error) {
    server.log.error('Failed to start HTTP redirect server:', error);
    server.log.warn('HTTP to HTTPS redirect will not be available');
  }
};
