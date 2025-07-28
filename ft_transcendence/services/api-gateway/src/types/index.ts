/**
 * Type definitions for the API Gateway
 * Custom types to handle Fastify server variations
 */

// Generic server instance type to avoid fastify import issues
// Using any for register to avoid complex Fastify type conflicts
export interface ServerInstance {
  register: any;
  listen: (options: { port: number; host: string }) => Promise<string>;
  close: () => Promise<void>;
  get: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  post: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  put: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  delete: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  setNotFoundHandler: (handler: any) => void;
  setErrorHandler: (handler: any) => void;
  log: {
    info: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
  };
}

// Common request type
export interface AppRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  params?: any;
  query?: any;
}

// Common reply type
export interface AppReply {
  code: (statusCode: number) => AppReply;
  send: (payload: any) => void;
  type: (contentType: string) => AppReply;
  header: (name: string, value: string) => AppReply;
}

// WebSocket connection type
export interface WebSocketConnection {
  on: (event: string, handler: (data?: any) => void) => void;
  send: (data: any) => void;
  close: () => void;
}

// WebSocket request type
export interface WebSocketRequest {
  headers: Record<string, string | string[]>;
  url: string;
  ip: string;
}

// Generic request/reply types for middleware
export interface GenericRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
}

export interface GenericReply {
  code: (statusCode: number) => GenericReply;
  send: (payload: any) => void;
}

// Error response type
export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  date?: number;
  expiresIn?: number;
  service?: string;
}

// Rate limit context
export interface RateLimitContext {
  ttl: number;
  totalHits: number;
  remainingHits: number;
}

// CORS callback type
export type CORSCallback = (error: Error | null, success: boolean) => void;

// Proxy options type
export interface ProxyOptions {
  upstream: string;
  prefix: string;
  rewritePrefix: string;
  http2: boolean;
  preHandler?: (request: AppRequest, reply: AppReply) => Promise<void>;
  replyOptions?: {
    onError?: (reply: AppReply, error: Error) => void;
  };
}
