/**
 * Auth Service Server Configuration
 * Fastify server setup and configuration
 */

import fastify, { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { config } from './config/auth.config.js';
import { initializeDatabase } from './database/database.connection.js';

/**
 * Create and configure Fastify server instance
 */
export function createServer(): any {
  const serverOptions: any = { 
    logger: { 
      level: config.logLevel as any
    }
  };

  // Only add HTTPS configuration if SSL is enabled
  if (config.ssl.enabled) {
    serverOptions.https = {
      key: readFileSync(config.ssl.keyPath),
      cert: readFileSync(config.ssl.certPath)
    };
  }

  const server = fastify(serverOptions);

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
    server.log.error(`Failed to start Auth Service: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
