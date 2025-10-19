import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getAuthUser } from '../plugins/auth.js';
import { sseBus, type RoomEvent, type UserEvent } from '../utils/sseBus.js';

function setupSseHeaders(reply: FastifyReply) {
  reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.flushHeaders?.();
}

function sendEvent<T extends RoomEvent | UserEvent>(reply: FastifyReply, ev: T) {
  reply.raw.write(`event: message\n`);
  reply.raw.write(`data: ${JSON.stringify(ev)}\n\n`);
}

export default async function sseRoutes(f: FastifyInstance) {
  f.get('/sse/rooms/:code', async (req: FastifyRequest, reply: FastifyReply) => {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const code = (req.params as any)?.code as string;
    if (!code) return reply.code(400).send({ error: 'Código requerido' });
    setupSseHeaders(reply);
    const emitter = sseBus.room(code);
    const listener = (ev: RoomEvent) => sendEvent(reply, ev);
    emitter.on('event', listener);
    const ka = setInterval(() => {
      try { reply.raw.write(`event: ping\ndata: {}\n\n`); } catch {}
    }, 20000);
    req.raw.on('close', () => {
      clearInterval(ka);
      emitter.off('event', listener);
      try { reply.raw.end(); } catch {}
    });
  });

  f.get('/sse/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    setupSseHeaders(reply);
    const emitter = sseBus.user(me.id);
    const listener = (ev: UserEvent) => sendEvent(reply, ev);
    emitter.on('event', listener);
    const ka = setInterval(() => {
      try { reply.raw.write(`event: ping\ndata: {}\n\n`); } catch {}
    }, 20000);
    req.raw.on('close', () => {
      clearInterval(ka);
      emitter.off('event', listener);
      try { reply.raw.end(); } catch {}
    });
  });

  f.get('/tournaments/:id/events', async (req: FastifyRequest, reply: FastifyReply) => {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });

    const idParam = (req.params as any)?.id;
    const tournamentId = Number(idParam);
    if (!Number.isFinite(tournamentId) || tournamentId <= 0) {
      return reply.code(400).send({ error: 'ID de torneo inválido' });
    }
    setupSseHeaders(reply);
    const emitter = sseBus.user(me.id);
    const listener = (ev: UserEvent) => {
      if (
        (ev.type === 'tournament_status' && (ev as any).id === tournamentId) ||
        (ev.type === 'tournament_joined' && (ev as any).id === tournamentId) ||
        (ev.type === 'tournament_left' && (ev as any).id === tournamentId) ||
        (ev.type === 'tournament_bracket_update' && (ev as any).id === tournamentId)
      ) {
        sendEvent(reply, ev);
      }
    };
    emitter.on('event', listener);
    const ka = setInterval(() => {
      try { reply.raw.write(`event: ping\ndata: {}\n\n`); } catch {}
    }, 20000);
    req.raw.on('close', () => {
      clearInterval(ka);
      emitter.off('event', listener);
      try { reply.raw.end(); } catch {}
    });
  });
}