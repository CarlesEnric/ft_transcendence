/**
 * Middleware Configuration
 * Security, logging, and OAuth2 setup
 */

import { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

/**
 * Register all middleware
 */
export async function registerAllMiddleware(server: FastifyInstance): Promise<void> {
  // Register JWT authentication
  await server.register(import('@fastify/jwt'), {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn
    }
  });

  // Register OAuth2 plugin for Google
  await server.register(import('@fastify/oauth2'), {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: config.oauth.google.clientId,
        secret: config.oauth.google.clientSecret
      },
      auth: {
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenHost: 'https://www.googleapis.com',
        tokenPath: '/oauth2/v4/token'
      }
    },
    startRedirectPath: '/auth/google',
    callbackUri: config.oauth.google.redirectUri,
    scope: ['profile', 'email']
  });

  console.log('Middleware registered successfully');
}
