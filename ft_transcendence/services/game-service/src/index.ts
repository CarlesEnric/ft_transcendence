import fastify from 'fastify';
import { readFileSync } from 'fs';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

const server = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});

// Register plugins
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}
server.register(fastifyJwt, { secret: process.env.JWT_SECRET });
server.register(fastifyCookie);

// Decorate request with authenticate method

// Health check endpoint
server.get('/health', async (_request, reply) => {
  reply.send({ status: 'ok', service: 'game-service' });
});

// Placeholder endpoints
server.get('/', async (_request, reply) => {
  reply.send({ message: 'Game service placeholder - ready for development' });
});

const start = async () => {
  try {
    await server.listen({ port: 443, host: '0.0.0.0' });
    server.log.info('Game service started on https://0.0.0.0:443');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
