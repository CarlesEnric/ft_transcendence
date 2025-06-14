import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';

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

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
});

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.sendFile('index.html');
});

const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info("Frontend running on https://localhost:3000");

    // Start HTTP redirect server
    const redirect = Fastify();
    redirect.all('*', (request, reply) => {
      const host = request.headers.host?.replace(/:\d+$/, ':3000') || '';
      reply.status(301).redirect(`https://${host}${request.url}`);
    });
    await redirect.listen({ port: 3080, host: "0.0.0.0" });
    console.log("HTTP redirect server running on http://localhost:3080");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();