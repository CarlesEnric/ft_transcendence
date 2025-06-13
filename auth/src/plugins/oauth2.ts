import { FastifyInstance } from 'fastify';
import oauth2 from '@fastify/oauth2';

export const oauth2Plugin = async (fastify: FastifyInstance) => {
  fastify.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
        secret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET'
      }
    },
    startRedirectPath: '/auth/login/google',
    callbackUri: process.env.GOOGLE_CALLBACK_URI || 'https://localhost:7001/auth/login/google/callback',
    discovery: {
      issuer: 'https://accounts.google.com'
    }
  });
};