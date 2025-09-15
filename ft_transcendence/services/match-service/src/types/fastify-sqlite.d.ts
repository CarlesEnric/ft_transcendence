import 'fastify';
import { Database } from 'sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    sqlite: Database & {
      run: (...args: any[]) => Promise<any>;
      all: (...args: any[]) => Promise<any[]>;
      get: (...args: any[]) => Promise<any>;
    };
  }
  interface FastifyRequest {
    sqlite: FastifyInstance['sqlite'];
  }
}