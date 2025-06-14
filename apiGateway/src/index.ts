import Fastify from 'fastify';
import * as fastifyHttpProxy from '@fastify/http-proxy';
import fs from 'fs';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// Proxy /auth → auth microservice
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://auth:7001',
  prefix: '/auth',
  rewritePrefix: '/auth',
  http2: false,
  unidici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  }
});

// Proxy /api → backend microservice
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://backend:7000',
  prefix: '/api',
  rewritePrefix: '/api',
  http2: false,
  unidici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  }
});

// Proxy /pong → pong microservice (WebSocket not supported by http-proxy, només HTTP)
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://pong:4000',
  prefix: '/pong',
  rewritePrefix: '/pong',
  http2: false,
  unidici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  }
});

// Proxy everything else → frontend
fastify.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://frontend:3000',
  prefix: '/',
  rewritePrefix: '/',
  http2: false,
  unidici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  }
});


const start = async () => {
  try {
    await fastify.listen({ port: 8000, host: "0.0.0.0" });
    fastify.log.info("API Gateway running on https://localhost:8000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();