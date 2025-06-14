import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fs from 'fs';

// Servidor HTTPS
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
fastify.register(websocket);

fastify.get('/pong/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message: unknown) => {
    connection.socket.send('pong: ' + String(message));
  });
});

// const start = async () => {
//   try {

//     createUsersTable();
//     createGameHistoryTable();

//     await fastify.listen({ port: 4000, host: "0.0.0.0" });
//     fastify.log.info("Server running on http://localhost:4000");
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// start();

const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 4000, host: "0.0.0.0" });
    fastify.log.info("Auth running on https://localhost:4000");

    // Start HTTP redirect server
    const redirect = Fastify();
    redirect.all('*', (request, reply) => {
      const host = request.headers.host?.replace(/:\d+$/, ':4000') || '';
      reply.status(301).redirect(`https://${host}${request.url}`);
    });
    await redirect.listen({ port: 4080, host: "0.0.0.0" });
    console.log("HTTP redirect server running on http://localhost:4080");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();