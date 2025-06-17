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
    rejectUnauthorized: false // Disable SSL verification for local development
  },
  // replyOptions: {
  //   rewriteHeaders: rewriteHeaders
  // }
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://frontend-service:7002', // frontend-service
  prefix: '/',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  },
  // replyOptions: {
  //   rewriteHeaders: rewriteHeaders
  // }
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://backend-service:7003',  // backend-service
  prefix: '/backend',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  },
  // replyOptions: {
  //   rewriteHeaders: rewriteHeaders
  // }
});

app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://game-service:7004',  // game-service
  prefix: '/game',
  http2: false,
  httpOnly: true,
  secure: true, // només si tot és HTTPS
  sameSite: 'lax',
  undici: {
    rejectUnauthorized: false // Disable SSL verification for local development
  },
  // replyOptions: {
  //   rewriteHeaders: rewriteHeaders
  // }
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