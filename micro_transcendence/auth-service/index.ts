import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fs from 'fs';

import { dbPlugin } from './plugins/db.js';
import { oauth2Plugin } from './plugins/oauth2.js';
import { authRoutes } from './controllers/authController.js';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});

// Registra el plugin de cookies primer
fastify.register(fastifyCookie, {
  secret: 'unsecretsegur', // només si cal
  parseOptions: {
    httpOnly: true,
    secure: false, // posa-ho a false per local amb self-signed i true en producció
    sameSite: 'lax' // 'lax' és segura per a la majoria de casos, ex: autenticació amb OAuth2
  }
});

fastify.register(jwt, { secret: 'supersecret' });

// Registra plugins i rutes d’autenticació
fastify.register(async (instance) => {
  await dbPlugin(instance);
  instance.initDb(); // Inicialitza la base de dades si cal
  await oauth2Plugin(instance);
  await authRoutes(instance);
});

// Escolta a port 7001
const start = async () => {
  try {
    await fastify.listen({ port: 7001, host: "0.0.0.0" });
    fastify.log.info("Auth-service running on https://auth-service:7001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
