import 'dotenv/config';
import fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { initializeDb } from './db.js';
import matchesRoutes from './routes/matches.js';


const sslDir = path.join(process.cwd(), 'ssl');
const httpsOptions = {
  key: fs.readFileSync(path.join(sslDir, 'key.pem')),
  cert: fs.readFileSync(path.join(sslDir, 'cert.pem'))
};


const app = fastify({ logger: true, https: httpsOptions });

// Initialize DB and attach to Fastify instance and requests

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { Database } from 'sqlite';

initializeDb().then((db: Database) => {
  app.decorate('db', db);
  app.addHook('onRequest', (request: FastifyRequest, _reply: FastifyReply, done: (err?: Error) => void) => {
    (request as any).db = db;
    done();
  });
  app.register(matchesRoutes);

  if (!process.env.PORT) {
    app.log.error('🚨 Error: falta configurar PORT en .env');
    process.exit(1);
  }

  const PORT = Number(process.env.PORT);
  app.listen({ port: PORT , host: '0.0.0.0' }, (err: Error | null, address: string) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Match service corriendo en ${address}`);
  });
});





/*
import fastify from 'fastify';
import { readFileSync } from 'fs';

const server = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});

// Health check endpoint
server.get('/health', async (_request, reply) => {
  reply.send({ status: 'ok', service: 'match-service' });
});

// Placeholder endpoints
server.get('/', async (_request, reply) => {
  reply.send({ message: 'Match service placeholder - ready for development' });
});

const start = async () => {
  try {
    await server.listen({ port: 443, host: '0.0.0.0' });
    server.log.info('Match service started on https://0.0.0.0:443');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
*/