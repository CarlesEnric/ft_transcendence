import 'fastify';
import Database from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    initDb: () => void;
  
    googleOAuth2: {
    	getAccessTokenFromAuthorizationCodeFlow(request: any): Promise<{ access_token: string }>;
    };
  }
}
