/**
 * Middleware configuration for API Gateway
 * Handles security, CORS, rate limiting, and static file serving
 */

import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import websocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fs from 'fs';
import path from 'path';
import { AppConfig } from '../config/gateway.config.js';
import { FastifyInstance } from 'fastify';
import { CORSCallback, RateLimitContext, ErrorResponse } from '../types/gateway.types.js';

/**
 * Register security middleware (Helmet)
 */
export const registerSecurity = async (server: FastifyInstance): Promise<void> => {
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
         //connectSrc: ["'self'", "https://bcn-transcendence.duckdns.org:3000"],
         //connectSrc: ["'self'", "https://bcn42.duckdns.org:3000"],
        // connectSrc: ["'self'", "https://bcn-project.duckdns.org:3000"],
         connectSrc: ["'self'", "https://corb-project.duckdns.org:3000"],
        // connectSrc: ["'self'", "https://domain42.duckdns.org:3000"],
        // connectSrc: ["'self'", "https://localhost:3000"],
        // connectSrc: ["'self'", "https://*", "wss://*"], // Permet qualsevol domini per a WebSocket (només per a desenvolupament)
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  });
};

/**
 * Register CORS middleware
 */
export const registerCORS = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  await server.register(cors, {
    origin: (origin: string | undefined, callback: CORSCallback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins if CORS_ORIGIN is *
      if (config.nodeEnv === 'development' && config.cors.origin === '*') {
        return callback(null, true);
      }
      
      // In production, only allow specific origins
      // const DOMAIN = 'bcn42.duckdns.org:3000';
      // const DOMAIN = 'bcn-project.duckdns.org:3000';
      // const DOMAIN = 'domain42.duckdns.org:3000';
      const DOMAIN = 'corb-project.duckdns.org:3000';
      // const DOMAIN = 'localhost:3000';
      // const DOMAIN = 'bcn-transcendence.duckdns.org:3000';
      // const DOMAIN = 'bcn-transcendence.duckdns.org:3000';
      const allowedOrigins = [
        `https://${DOMAIN}`,
        `https://${DOMAIN}:443`,
        `https://${DOMAIN}:3000`,
        config.frontend.url,
        'https://127.0.0.1',
        'https://127.0.0.1:443'
      ];

      // Permet també subdominis i qualsevol port del domini principal
      const domainRegex = new RegExp(`^https://(.*\.)?${DOMAIN}(:\d+)?$`);
      if (allowedOrigins.includes(origin) || domainRegex.test(origin || '')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
};

/**
 * Register rate limiting middleware
 */
export const registerRateLimit = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  await server.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    errorResponseBuilder: (_request, context: any) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.ttl}ms`,
      date: Date.now(),
      expiresIn: context.ttl
    }),
  });
};

/**
 * Register static file serving
 */
export const registerStaticFiles = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  // Don't register fastify-static as it conflicts with our custom not found handler
  // Static file serving will be handled in the not found handler
};

/**
 * Register WebSocket support
 */
export const registerWebSocket = async (server: FastifyInstance): Promise<void> => {
  await server.register(websocket);
};

/**
 * Register all middleware
 */
export const registerAllMiddleware = async (server: FastifyInstance, config: AppConfig): Promise<void> => {
  // await server.register(fastifyCookie); // Registered in server.ts
  await registerWebSocket(server);
  await registerSecurity(server);
  await registerCORS(server, config);
  await registerRateLimit(server, config);
  await registerStaticFiles(server, config);
};
