import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fs from 'fs';

// Servidor HTTPS
const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  }
});
fastify.register(websocket);

fastify.get('/pong/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message: unknown) => {
    connection.socket.send('pong: ' + String(message));
  });
});

// HTTP redirect server
const redirect = Fastify();
redirect.all('*', (request, reply) => {
  const host = request.headers.host?.replace(/:\d+$/, ':4000') || '';
  reply.redirect(301, `https://${host}${request.raw.url}`);
});

async function start_listen() {
  try {
    const address = await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('Auth server running on', address);

    const redirectAddress = await redirect.listen({ port: 4080, host: '0.0.0.0' });
    console.log('HTTP redirect server running on', redirectAddress);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }  
}

start_listen();