import Fastify from 'fastify';
import * as fastifyHttpProxy from '@fastify/http-proxy';
import fs from 'fs';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  }
});

// Proxy /auth → auth microservice
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'http://auth:7001',
  prefix: '/auth',
  rewritePrefix: '/auth',
  http2: false
});

// Proxy /api → backend microservice
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'http://backend:7000',
  prefix: '/api',
  rewritePrefix: '/api',
  http2: false
});

// Proxy /pong → pong microservice (WebSocket not supported by http-proxy, només HTTP)
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'http://pong:4000',
  prefix: '/pong',
  rewritePrefix: '/pong',
  http2: false
});

// Proxy everything else → frontend
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'http://frontend:3000',
  prefix: '/',
  rewritePrefix: '/',
  http2: false
});

async function start_listen() {
  try {
    const address = await fastify.listen({ port: 8000, host: '0.0.0.0' });
    console.log('API Gateway running on', address);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start_listen();