/**
 * Auth Service Server Configuration
 * Fastify server setup and configuration
 */

import fastify, { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { config } from './config/index.js';
import { initializeDatabase } from './database/index.js';

/**
 * Create and configure Fastify server instance
 */
export function createServer(): FastifyInstance {
  const server = fastify({ 
    logger: { 
      level: config.logLevel as any
    },
    https: {
      key: readFileSync(config.ssl.keyPath),
      cert: readFileSync(config.ssl.certPath)
    }
  });

  return server;
}

/**
 * Initialize database connection
 */
export function createDatabase(): sqlite3.Database {
  const db = new sqlite3.Database(config.dbPath);
  initializeDatabase(db);
  return db;
}

/**
 * Start the server
 */
export async function startServer(server: FastifyInstance): Promise<void> {
  try {
    const address = await server.listen({
      port: config.port,
      host: config.host
    });
    
    server.log.info(`Auth Service started successfully!`);
    server.log.info(`Server listening on ${address}`);
  } catch (error) {
    server.log.error('Failed to start Auth Service:', error);
    throw error;
  }
}
