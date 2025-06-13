import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  }
});

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
});

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.sendFile('index.html');
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Frontend running on port 3000');
});

  // HTTP redirect server
const redirect = Fastify();
redirect.all('*', (request, reply) => {
  const host = request.headers.host?.replace(/:\d+$/, ':3000') || '';
  reply.redirect(301, `https://${host}${request.raw.url}`);
});
redirect.listen({ port: 3080, host: '0.0.0.0' }, (err: Error | null, address: string) => {
  if (err) throw err;
  console.log('HTTP redirect server running on port 3080');
});