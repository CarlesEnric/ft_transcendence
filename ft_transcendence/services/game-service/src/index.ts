import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { readFileSync } from 'fs';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

declare const process: any;

// Create HTTP server for internal Docker communication
const httpServer = fastify({
  logger: { level: 'info' }
});

// Create HTTPS server for external communication
const httpsServer = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});

// Register plugins for both servers
const registerPlugins = (server: any) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  server.register(fastifyJwt, { secret: process.env.JWT_SECRET });
  server.register(fastifyCookie);
  server.register(websocket);
};

registerPlugins(httpServer);
registerPlugins(httpsServer);

// Register WebSocket handlers for both servers
import { setupWebSocketServer } from './wsHandler.js';

const setupWebSocketRoutes = (server: any) => {
  server.register(async function (fastify: any) {
    fastify.get('/ws/game', { websocket: true }, (socket: any, req: any) => {
      
      if (typeof socket.send === 'function' && typeof socket.on === 'function') {
        setupWebSocketServer(socket, req);
      } else {
      }
    });
  });
};

setupWebSocketRoutes(httpServer);
setupWebSocketRoutes(httpsServer);


// Test the WebSocket registration
httpServer.ready((err: any) => {
  if (err) {
    console.error('[ERROR] HTTP server failed to start:', err);
  } else {
  }
});

httpsServer.ready((err: any) => {
  if (err) {
    console.error('[ERROR] HTTPS server failed to start:', err);
  } else {
  }
});

// Configuration flag - set to true to enforce JWT authentication for WebSocket connections
const ENFORCE_JWT_AUTH = process.env.ENFORCE_JWT_AUTH === 'true' || false;

// Setup health and root endpoints for both servers
const setupEndpoints = (server: any) => {
  server.get('/health', async (_req: any, reply: any) => {
    reply.send({ status: 'ok', service: 'game-service' });
  });

  server.get('/', async (_req: any, reply: any) => {
    reply.send({ message: 'Game service - ready for development' });
  });
};

setupEndpoints(httpServer);
setupEndpoints(httpsServer);

// Start both HTTP and HTTPS servers
const start = async () => {
  try {
    // Start HTTP server for internal Docker communication on port 3003
    await httpServer.listen({ port: 3003, host: '0.0.0.0' });
    httpServer.log.info('Game service HTTP started on http://0.0.0.0:3003 (internal)');
    
    // Start HTTPS server for external communication on port 3005
    await httpsServer.listen({ port: 3005, host: '0.0.0.0' });
    httpsServer.log.info('Game service HTTPS started on https://0.0.0.0:3005 (external)');
  } catch (err) {
    httpServer.log.error(err);
    process.exit(1);
  }
};

start();
