import fastify, { FastifyInstance } from 'fastify';
import oauth2 from '@fastify/oauth2';

export const oauth2Plugin = async (fastifyInstance: FastifyInstance) => {
  await fastifyInstance.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['openid', 'profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || '',
        secret: process.env.GOOGLE_CLIENT_SECRET || ''
      },
      auth: {
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenHost: 'https://oauth2.googleapis.com',
        tokenPath: '/token'
      },
    },
    startRedirectPath: '/login/google',
    callbackUri: 'https://localhost:8000/auth/login/google/callback',
    callbackUriParams: {
      successRedirect: '/login/success',
      failureRedirect: '/login/failure'
    }
  });
};