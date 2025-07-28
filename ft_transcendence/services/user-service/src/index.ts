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
  reply.send({ status: 'ok', service: 'user-service' });
});

// Placeholder endpoints
server.get('/', async (_request, reply) => {
  reply.send({ message: 'User service placeholder - ready for development' });
});

const start = async () => {
  try {
    await server.listen({ port: 443, host: '0.0.0.0' });
    server.log.info('User service started on https://0.0.0.0:443');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
