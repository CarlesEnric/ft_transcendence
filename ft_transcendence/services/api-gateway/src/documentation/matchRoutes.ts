import type { FastifyInstance } from 'fastify';
import * as http from 'http';

export async function registerMatchDocs(fastify: FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>) {
  // GET /api/matches
  fastify.route({
    method: 'GET',
    url: '/api/matches',
    schema: {
      tags: ['Matches'],
      summary: 'Obtener partidas del usuario autenticado',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              player1: { type: 'string', format: 'uuid' },
              player2: { type: 'string', format: 'uuid' },
              score1: { type: 'integer' },
              score2: { type: 'integer' },
              winner: { type: 'string', format: 'uuid' },
              date: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: {
          description: 'No autorizado',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (req, reply) => {
      return reply.send([]);
    }
  });

  // GET /api/matches/dashboard
  fastify.route({
    method: 'GET',
    url: '/api/matches/dashboard',
    schema: {
      tags: ['Matches'],
      summary: 'Obtener resumen de partidas para el dashboard',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            totalMatches: { type: 'number' },
            averageScore: { type: 'number' },
            lastMatchDate: { type: 'string', format: 'date-time' }
          }
        },
        401: {
          description: 'No autorizado',
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    },
    handler: async (req, reply) => {
      return reply.send({});
    }
  });

  // POST /api/matches
  fastify.route({
    method: 'POST',
    url: '/api/matches',
    schema: {
      tags: ['Matches'],
      summary: 'Crear una nueva partida',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['player1', 'player2', 'score1', 'score2', 'winner'],
        properties: {
          player1: { type: 'string', format: 'uuid' },
          player2: { type: 'string', format: 'uuid' },
          score1: { type: 'integer' },
          score2: { type: 'integer' },
          winner: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        201: {
          description: 'Partida creada',
          type: 'object',
          properties: {
            id: { type: 'integer' },
            player1: { type: 'string' },
            player2: { type: 'string' },
            score1: { type: 'integer' },
            score2: { type: 'integer' },
            winner: { type: 'string' },
            date: { type: 'string', format: 'date-time' }
          }
        },
        400: {
          description: 'Datos inválidos',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        401: {
          description: 'No autorizado',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (req, reply) => {
      return reply.status(201).send({});
    }
  });
}
