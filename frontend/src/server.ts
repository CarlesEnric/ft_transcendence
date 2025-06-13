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

// HTTP redirect server
const redirect = Fastify();
redirect.all('*', (request, reply) => {
  const host = request.headers.host?.replace(/:\d+$/, ':3000') || '';
  reply.redirect(301, `https://${host}${request.raw.url}`);
});

async function start_listen() {
  try {
    const address = await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Auth server running on', address);

    const redirectAddress = await redirect.listen({ port: 3080, host: '0.0.0.0' });
    console.log('HTTP redirect server running on', redirectAddress);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }  
}

start_listen();