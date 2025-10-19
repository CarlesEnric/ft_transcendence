import { FastifyInstance } from 'fastify';
import type { ServerResponse } from 'http';

// Simple in-memory event emitter for demo purposes
const listeners: ServerResponse[] = [];

export default async function globalSseRoute(server: FastifyInstance) {
  server.get('/api/sse/global', { 
    // Disable JWT for SSE endpoint (public for now)
    preHandler: (req, reply, done) => done()
  }, async (request, reply) => {
    const res = reply.raw as ServerResponse;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Add to listeners
    listeners.push(res);
    res.write(`event: connected\ndata: "SSE global connected"\n\n`);

    // Remove listener on close
    request.raw.on('close', () => {
      const idx = listeners.indexOf(res);
      if (idx !== -1) listeners.splice(idx, 1);
    });
  });
}

// Helper to broadcast events to all listeners
export function broadcastGlobalSseEvent(event: string, data: any) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  listeners.forEach(res => {
    try {
      res.write(`event: ${event}\ndata: ${payload}\n\n`);
    } catch (e) {
      // Socket might be closed
    }
  });
}