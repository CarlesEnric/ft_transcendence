import Fastify from 'fastify';
import fs from 'fs';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});

const start = async () => {
  try {
    await fastify.listen({ port: 7002, host: "0.0.0.0" });
    fastify.log.info("Backend-service running on https://backend-service:7002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
