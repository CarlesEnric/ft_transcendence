import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { dbPlugin } from './plugins/db.js';
import { oauth2Plugin } from './plugins/oauth2.js';
import { authRoutes } from './controllers/authControllers.js';
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

fastify.register(cookie);
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
fastify.register(dbPlugin);
fastify.register(oauth2Plugin);
fastify.register(authRoutes);

const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 7001, host: "0.0.0.0" });
    fastify.log.info("Auth running on https://localhost:7001");

    // Start HTTP redirect server
    const redirect = Fastify();
    redirect.all('*', (request, reply) => {
      const host = request.headers.host?.replace(/:\d+$/, ':7001') || '';
      reply.status(301).redirect(`https://${host}${request.url}`);
    });
    await redirect.listen({ port: 7081, host: "0.0.0.0" });
    console.log("HTTP redirect server running on http://localhost:7081");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();