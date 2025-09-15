import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import type { FastifyPluginAsync } from 'fastify';
import { registerMatchDocs } from '../documentation/matchRoutes.js';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Transcendence API Gateway – Match‑service',
        version: '1.0.0',
        description: 'Documentación de rutas del match‑service (JWT requiere)'
      },
      servers: []
    },
    hideUntagged: true
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
    uiConfig: { docExpansion: 'list', deepLinking: true },
    staticCSP: true,
    transformStaticCSP: header => header,
    transformSpecificationClone: true,
    transformSpecification: (spec /*: Readonly<Record<string, unknown>>*/, _req, _reply) => {
      return {
        ...spec,
        servers: [{ url: '/', description: 'same origin' }]
      };
    }
  });

  await registerMatchDocs(fastify);
  await fastify.ready();
  fastify.swagger();
};

export default fp(swaggerPlugin);
