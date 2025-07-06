import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyRequest } from 'fastify';
import { IncomingHttpHeaders } from 'http';
import fs from 'fs';

const app = Fastify({
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

const rewriteHeaders = (req: FastifyRequest, headers: IncomingHttpHeaders) => {
  // Copia totes les cookies de la request original
  if (req.headers.cookie) {
    headers.cookie = req.headers.cookie;
  }
  return headers;
};

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://auth-service:7001', // auth-service
  prefix: '/auth',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: true // Disable SSL verification for local development
  },
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://backend-service:7002',  // backend-service
  prefix: '/backend',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: true // Disable SSL verification for local development
  },
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://frontend-service:7003', // frontend-service
  prefix: '/',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: true // Disable SSL verification for local development
  },
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://game-service:7004',  // game-service
  prefix: '/game',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: true // Disable SSL verification for local development
  },
});

const start = async () => {
  try {
    await app.listen({ port: 8000, host: "0.0.0.0" });
    app.log.info("API Gateway running on https://localhost:8000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

/*
import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCors from '@fastify/cors';
import { FastifyRequest } from 'fastify';
import { IncomingHttpHeaders } from 'http';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fs from 'fs';
import crypto from 'crypto';

// -------- CONFIGURACIÓ CENTRALITZADA --------
const config = {
  https: {
    key: fs.readFileSync(process.env.GATEWAY_KEY_PATH || '/app/key.pem'),
    cert: fs.readFileSync(process.env.GATEWAY_CERT_PATH || '/app/cert.pem'),
  },
  services: {
    auth: process.env.AUTH_URL || 'https://auth-service:7001',
    backend: process.env.BACKEND_URL || 'https://backend-service:7002',
    frontend: process.env.FRONTEND_URL || 'https://frontend-service:7003',
    game: process.env.GAME_URL || 'https://game-service:7004',
  },
  rejectUnauthorized: process.env.NODE_ENV === 'production', // true en prod, false en dev
  port: parseInt(process.env.GATEWAY_PORT || '8000'),
};

// -------- INICIALITZACIÓ FASTIFY --------
const app = Fastify({
  https: config.https,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  }
});

// -------- MIDDLEWARES --------

// CORS (només si exposes APIs públiques)
app.register(fastifyCors, {
  origin: true,
  credentials: true
});

// Rate limiting bàsic per protegir contra atacs de força bruta
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Swagger (OpenAPI) per documentació interactiva
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API Gateway',
      description: 'Documentació interactiva de l’API Gateway',
      version: '1.0.0'
    }
  }
});
app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
});


// Assigna un X-Request-ID únic a cada request per traçabilitat
app.addHook('onRequest', async (req, reply) => {
  const id = crypto.randomUUID(); // Genera un UUID
  req.headers['x-request-id'] = id; // El posa al header de la request
  reply.header('x-request-id', id); // El posa al header de la resposta
});

// -------- FUNCIONS AUXILIARS --------

// Copia cookies i headers importants
const rewriteHeaders = (req: FastifyRequest, headers: IncomingHttpHeaders) => {
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  if (req.headers['x-request-id']) headers['x-request-id'] = req.headers['x-request-id'];
  // Afegeix aquí més headers si vols
  return headers;
};

// -------- PROXY PER CADA MICROSERVEI --------

const proxyOptions = (upstream: string, prefix: string) => ({
  upstream,
  prefix,
  http2: false,
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: config.rejectUnauthorized
  },
  replyOptions: {
    rewriteHeaders
  },
  // Gestió d'errors de proxy
  onError: (req: any, reply: any, error: any) => {
    req.log.error({ err: error }, `Proxy error for ${prefix}`);
    reply.status(502).send({ error: `Bad Gateway: ${prefix} unavailable` });
  }
});

// Registra cada proxy
app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, proxyOptions(config.services.auth, '/auth'));
app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, proxyOptions(config.services.backend, '/backend'));
app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, proxyOptions(config.services.frontend, '/'));
app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, proxyOptions(config.services.game, '/game'));

// -------- ENDPOINT DE SALUT --------
app.get('/health', async (req, reply) => {
  reply.send({ status: 'ok', time: new Date().toISOString() });
});

// -------- ARRANCADA --------
const start = async () => {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`API Gateway running on https://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
*/

