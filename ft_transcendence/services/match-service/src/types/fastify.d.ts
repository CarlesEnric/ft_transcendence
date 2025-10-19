import 'fastify';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

declare module 'fastify'
{
  interface FastifyInstance
  {
    db: Database<sqlite3.Database, sqlite3.Statement>;
  }
  interface FastifyRequest
  {
    db: Database<sqlite3.Database, sqlite3.Statement>;
  }
  interface FastifyRequest
  {
    authUser?: { userId: number; username: string; email?: string };
  }
}