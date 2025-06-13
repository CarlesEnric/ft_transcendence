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
  }
});

fastify.register(cookie);
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });
fastify.register(dbPlugin);
fastify.register(oauth2Plugin);
fastify.register(authRoutes);

fastify.listen({ port: 7001, host: '0.0.0.0' }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Auth running on port 7001');
});

// HTTP redirect server
const redirect = Fastify();
redirect.all('*', (request, reply) => {
  const host = request.headers.host?.replace(/:\d+$/, ':7001') || '';
  reply.redirect(301, `https://${host}${request.raw.url}`);
});
redirect.listen({ port: 7080, host: '0.0.0.0' }, (err: Error | null, address: string) => {
  if (err) throw err;
  console.log('HTTP redirect server running on port 7080');
}
);