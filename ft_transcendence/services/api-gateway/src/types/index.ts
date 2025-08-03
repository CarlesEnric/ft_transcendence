/**
 * Type definitions for the API Gateway
 * Custom types to handle Fastify server variations
 */

// Common request type
export interface AppRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  params?: any;
  query?: any;
  // Added for JWT user injection by Fastify JWT
  user?: { userId: string | number; [key: string]: any };
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
