/**
 * Main entry point for the Fastify server application.
 *
 * - Registers core plugins: WebSocket, JWT authentication, OAuth2, and SQLite database.
 * - Sets up authentication routes and static file serving.
 * - Serves the main HTML file at the root endpoint.
 * - Listens on port 7000 for incoming HTTP requests.
 *
 * @fileoverview Initializes and configures the Fastify server with authentication, static file serving, and database connectivity.
 */
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import path from 'path';
import { dbPlugin } from './plugins/db.js';
import { oauth2Plugin } from './plugins/oauth2.js';
import { authRoutes } from './controllers/authController.js';
import fastifyStatic from '@fastify/static';
import fs from 'fs';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  }
});

fastify.register(websocket);
fastify.register(jwt, { secret: 'supersecret' });

// Register all plugins in the same encapsulation context
fastify.register(async (instance) => {
  await dbPlugin(instance);
  await oauth2Plugin(instance);
  await authRoutes(instance);
});

// Servei d'arxius estàtics (HTML, CSS, JS)
// Use (globalThis as any).process.cwd() for ESM compatibility
fastify.register(fastifyStatic, {
  root: path.resolve((globalThis as any).process.cwd(), 'src/public'),
  prefix: '/public/', // Serveix arxius des de /public/
});

fastify.get('/', (request: any, reply: any) => {
  reply.sendFile('index.html'); // Serveix el fitxer index.html
});

// Serveix index.html per a totes les rutes GET que no siguin API ni fitxers estàtics (SPA fallback)
fastify.setNotFoundHandler((request, reply) => {
  if (
    request.raw.method === 'GET' &&
    request.headers.accept &&
    request.headers.accept.includes('text/html')
  ) {
    reply.sendFile('index.html');
  } else {
    reply.status(404).send({ error: 'Not Found' });
  }
});

fastify.listen({ port: 7000, host: '0.0.0.0' }, (err: Error | null) => {
  if (err) throw err;
  console.log('Server listening on https://127.0.0.1:7000');
});

// Print all registered routes for debugging
fastify.ready().then(() => {
  console.log(fastify.printRoutes());
});