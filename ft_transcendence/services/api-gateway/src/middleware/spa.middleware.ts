/**
 * Simple SPA middleware to handle client-side routes
 * Aquest middleware serveix l'index.html per totes les rutes que no són API
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

// Path to frontend directory in Docker environment
const FRONTEND_PATH = '/app/frontend';

/**
 * Middleware to handle SPA routing
 * Serves the index.html for all non-API routes that don't match a static file
 */
export const handleSpaRoutes = async (request: FastifyRequest, reply: FastifyReply) => {
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Don't handle API requests
  if (request.url.startsWith('/api/')) return;
  
  // Don't handle specific routes that should be handled by the API
  const excludedRoutes = ['/health', '/api', '/ws'];
  if (excludedRoutes.some(route => request.url.startsWith(route))) return;
  
  // Path to frontend directory - using the Docker path
  const frontendDir = FRONTEND_PATH;
  
  // Check if request is for a static file
  const requestedPath = path.join(frontendDir, request.url);
  
  // Only intercept if the file doesn't exist
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) return;
  
  // Log request for debugging
  request.log.info(`[SPA] Serving index.html for: ${request.url}`);
  
  // Verify index.html exists before trying to read it
  const indexPath = path.join(frontendDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    request.log.error(`[SPA] index.html not found at ${indexPath}`);
    reply.status(500).send({ error: 'SPA index.html not found' });
    return reply;
  }
  
  // Serve index.html instead
  try {
    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    reply.type('text/html').send(indexHtml);
  } catch (err) {
    const error = err as Error;
    request.log.error(`[SPA] Failed to read index.html: ${error.message}`);
    reply.status(500).send({ error: 'Failed to read SPA index.html' });
  }
  
  return reply;
};
