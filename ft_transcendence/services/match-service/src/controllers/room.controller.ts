import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getAuthUser } from '../plugins/auth.js';
import { sseBus } from '../utils/sseBus.js';
import {
    loadRoomByCode,
    loadPlayers,
    getRoomSnapshotByCode,
    type RoomPlayerRow,
} from './room.model.js';
import { makeUsersClient } from '../clients/users.client.js';

const JoinSchema = z.object({
    code: z.string().min(4).max(16),
});
const ReadySchema = z.object({
    ready: z.boolean(),
});
const CodeParamSchema = z.object({
    code: z.string().min(4).max(16),
});

function randomCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

export async function createRoom(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    return reply.code(201).send({});
}

export async function joinRoom(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const body = JoinSchema.safeParse(req.body ?? {});
    if (!body.success) return reply.code(400).send({ error: 'Body inválido' });
    const room = await loadRoomByCode(req.db, body.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    if (room.status === 'finished' || room.status === 'cancelled') {
        return reply.code(409).send({ error: 'Sala cerrada' });
    }
    const players = await loadPlayers(req.db, room.id);
    const already = players.find((p: RoomPlayerRow) => p.user_id === me.id);
    if (!already) {
        const count = players.length;
        if (count >= 2) return reply.code(409).send({ error: 'Sala llena' });
        await req.db.run(
            `INSERT INTO room_players (room_id, user_id, username, ready) VALUES (?, ?, ?, 0)`,
            room.id, me.id, me.username
        );
    }
    sseBus.emitRoom(room.code, {
        type: 'joined',
        code: room.code,
        userId: me.id,
        username: me.username,
    });
    sseBus.emitUser(me.id, { type: 'room_update', code: room.code });
    return reply.code(200).send({ ok: true, code: room.code });
}

export async function setReady(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = CodeParamSchema.safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const body = ReadySchema.safeParse(req.body ?? {});
    if (!body.success) return reply.code(400).send({ error: 'Body inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    if (room.status !== 'waiting' && room.status !== 'in_progress') {
        return reply.code(409).send({ error: 'Estado de sala no válido' });
    }
    const players = await loadPlayers(req.db, room.id);
    if (!players.find((p: RoomPlayerRow) => p.user_id === me.id)) {
        return reply.code(403).send({ error: 'No estás en la sala' });
    }
    await req.db.run(
        `UPDATE room_players SET ready=? WHERE room_id=? AND user_id=?`,
        body.data.ready ? 1 : 0,
        room.id,
        me.id
    );
    sseBus.emitRoom(room.code, {
        type: 'ready',
        code: room.code,
        userId: me.id,
        ready: body.data.ready,
    });
    const updated = await loadPlayers(req.db, room.id);
    if (updated.length === 2 && updated.every((p: RoomPlayerRow) => p.ready === 1) && room.status === 'waiting') {
        await req.db.run(
            `UPDATE rooms SET status='in_progress', started_at=datetime('now') WHERE id=?`,
            room.id
        );
        sseBus.emitRoom(room.code, {
            type: 'status',
            code: room.code,
            status: 'in_progress',
        });
    }
    return reply.code(200).send({ ok: true });
}

export async function getRoom(req: FastifyRequest, reply: FastifyReply) {
    try {
        const parsed = z.object({ code: z.string().min(4).max(16) }).safeParse(req.params ?? {});
        if (!parsed.success) return reply.code(400).send({ error: 'Código inválido' });
        const db: any = (req as any).db;
        if (!db) {
            req.log.error('[getRoom] req.db está vacío');
            return reply.code(500).send({ error: 'DB no inicializada' });
        }
        const snapshot = await getRoomSnapshotByCode(db, parsed.data.code);
        if (!snapshot) return reply.code(404).send({ error: 'Sala no existe' });
        const ids = snapshot.players.map((p) => p.userId);
        const usersClient = makeUsersClient(process.env.USER_SERVICE_URL ?? 'https://user:3002');
        const jwt = (req as any)?.cookies?.jwt as string | undefined;
        let usersMap: Record<number, { id: number; username: string }> = {};
        try {
            if (ids.length) {
                usersMap = await usersClient.fetchUsersMap(ids, jwt);
            }
        }
        catch (e) {
            req.log.warn({ err: e }, '[getRoom] fetchUsersMap falló; usando usernames locales');
        }
        return reply.code(200).send({
            code: snapshot.code,
            status: snapshot.status,
            players: snapshot.players.map((p) => ({
                userId: p.userId,
                username: usersMap[p.userId]?.username ?? p.username ?? null,
                ready: p.ready,
            })),
        });
    }
    catch (err) {
        req.log.error({ err }, '[getRoom] excepción no controlada');
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

// src/controllers/room.controller.ts

export async function finishRoom(req: FastifyRequest, reply: FastifyReply) {
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });

  const body = (req.body ?? {}) as any;
  const code = String(body.code ?? '');
  if (!code) return reply.code(400).send({ error: 'Código requerido' });

  const score1 = Number(body.score1);
  const score2 = Number(body.score2);
  const winnerUserId = Number(body.winnerUserId);

  if (!Number.isFinite(score1) || !Number.isFinite(score2)) {
    return reply.code(400).send({ error: 'Marcador inválido' });
  }
  if (!Number.isFinite(winnerUserId)) {
    return reply.code(400).send({ error: 'winnerUserId inválido' });
  }

  const room = await loadRoomByCode(req.db, code);
  if (!room) return reply.code(404).send({ error: 'Sala no existe' });

  // Cargamos players en orden de llegada: player1 es el que entró primero
  const players = await req.db.all<RoomPlayerRow[]>(
    `SELECT user_id, username FROM room_players WHERE room_id = ? ORDER BY joined_at ASC LIMIT 2`,
    room.id
  );

  if (!players || players.length < 2) {
    return reply.code(409).send({ error: 'Sala sin dos jugadores' });
  }

  const p1 = players[0];
  const p2 = players[1];

  // Normalizamos ganador en función del ID que llega
  const winner =
    winnerUserId === p1.user_id ? p1.user_id :
    winnerUserId === p2.user_id ? p2.user_id :
    // fallback: por marcador
    (score1 >= score2 ? p1.user_id : p2.user_id);

  await req.db.exec('BEGIN IMMEDIATE TRANSACTION');
  try {
    // Cerrar sala
    await req.db.run(
      `UPDATE rooms SET status='finished', finished_at=datetime('now') WHERE id=?`,
      room.id
    );

    // Persistir match histórico
    await req.db.run(
      `INSERT INTO matches (player1, player2, username1, username2, score1, score2, winner, date, tournament_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
      p1.user_id, p2.user_id, p1.username, p2.username, score1, score2, winner, room.tournament_id ?? null
    );

    // Si es match de torneo, actualizamos su fila
    if (room.tournament_id) {
      await req.db.run(
        `UPDATE tournament_matches
           SET status='finished', score1=?, score2=?, winner_id=?, winner_username=?,
               finished_at=datetime('now')
         WHERE room_code = ?`,
        score1, score2, winner,
        winner === p1.user_id ? p1.username : p2.username,
        room.code
      );
      // (Opcional) aquí podrías encadenar propagación de bracket.
    }

    // Actualizar dashboard básico
    // Asegura existencia
    await req.db.run(
      `INSERT INTO dashboard (userId, games_played, games_won, games_lost)
       VALUES (?, 0, 0, 0) ON CONFLICT(userId) DO NOTHING`,
      p1.user_id
    );
    await req.db.run(
      `INSERT INTO dashboard (userId, games_played, games_won, games_lost)
       VALUES (?, 0, 0, 0) ON CONFLICT(userId) DO NOTHING`,
      p2.user_id
    );
    // +1 played a ambos
    await req.db.run(
      `UPDATE dashboard SET games_played = games_played + 1 WHERE userId IN (?, ?)`,
      p1.user_id, p2.user_id
    );
    // +1 win/loss
    await req.db.run(
      `UPDATE dashboard SET games_won = games_won + 1 WHERE userId = ?`,
      winner
    );
    const loser = winner === p1.user_id ? p2.user_id : p1.user_id;
    await req.db.run(
      `UPDATE dashboard SET games_lost = games_lost + 1 WHERE userId = ?`,
      loser
    );

    await req.db.exec('COMMIT');
  } catch (e) {
    try { await req.db.exec('ROLLBACK'); } catch {}
    req.log.error({ err: e }, '[finishRoom] TX failed');
    return reply.code(500).send({ error: 'Persist error' });
  }

  // SSE a la sala (para UI en vivo)
  sseBus.emitRoom(room.code, { type: 'status', code: room.code, status: 'finished' });
  sseBus.emitRoom(room.code, {
    type: 'finished',
    code: room.code,
    score1,
    score2,
    winnerUserId: winner,
  });

  // SSE por-usuario para refrescar tarjetas (ambos jugadores)
  sseBus.emitUser(p1.user_id, { type: 'match_finished', code: room.code });
  sseBus.emitUser(p2.user_id, { type: 'match_finished', code: room.code });

  // Y mantenemos el existente 'room_update' por compatibilidad
  sseBus.emitUser(p1.user_id, { type: 'room_update', code: room.code });
  sseBus.emitUser(p2.user_id, { type: 'room_update', code: room.code });

  return reply.code(200).send({ ok: true });
}

export async function leaveRoom(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = CodeParamSchema.safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    await req.db.run(
        `DELETE FROM room_players WHERE room_id=? AND user_id=?`,
        room.id, me.id
    );
    sseBus.emitRoom(room.code, { type: 'left', code: room.code, userId: me.id });
    const players = await loadPlayers(req.db, room.id);
    if (players.length === 0 && room.status !== 'cancelled' && room.status !== 'finished') {
        await req.db.run(`UPDATE rooms SET status='cancelled' WHERE id=?`, room.id);
        sseBus.emitRoom(room.code, { type: 'status', code: room.code, status: 'cancelled' });
    }
    return reply.code(200).send({ ok: true });
}

export async function cancelRoom(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = CodeParamSchema.safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    await req.db.run(`UPDATE rooms SET status='cancelled' WHERE id=?`, room.id);
    sseBus.emitRoom(room.code, { type: 'status', code: room.code, status: 'cancelled' });
    return reply.code(200).send({ ok: true });
}

export async function quickMatch(req: FastifyRequest, reply: FastifyReply) {
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const userId = Number(me.id);
    await req.db.exec('BEGIN IMMEDIATE TRANSACTION');
    try {
        const candidate = await req.db.get<{ id: number; code: string }>(
            `SELECT r.id, r.code FROM rooms r WHERE r.status='waiting' AND (SELECT COUNT(*) FROM room_players rp WHERE rp.room_id = r.id) = 1
              AND NOT EXISTS (SELECT 1 FROM room_players rp2 WHERE rp2.room_id = r.id AND rp2.user_id = ?)ORDER BY r.created_at ASC LIMIT 1`,
            userId
        );
        if (candidate) {
            await req.db.run(
                `INSERT INTO room_players (room_id, user_id, username, ready)
                 VALUES (?, ?, ?, 0)`,
                candidate.id, userId, me.username
            );
            sseBus.emitRoom(candidate.code,
                {
                    type: 'joined',
                    code: candidate.code,
                    userId,
                    username: me.username,
                });
            sseBus.emitUser(userId, { type: 'room_update', code: candidate.code });
            await req.db.exec('COMMIT');
            return reply.code(200).send({ ok: true, code: candidate.code, role: 'guest' as const });
        }
        let code = randomCode(6);
        for (let i = 0; i < 5; i++) {
            const exists = await loadRoomByCode(req.db, code);
            if (!exists) break;
            code = randomCode(6);
        }
        await req.db.run(
            `INSERT INTO rooms (code, status, created_at) VALUES (?, 'waiting', datetime('now'))`,
            code
        );
        const newRoom = await loadRoomByCode(req.db, code);
        if (!newRoom) {
            await req.db.exec('ROLLBACK');
            return reply.code(500).send({ error: 'No se pudo crear la sala' });
        }
        await req.db.run(
            `INSERT INTO room_players (room_id, user_id, username, ready) VALUES (?, ?, ?, 0)`,
            newRoom.id, userId, me.username
        );
        sseBus.emitRoom(newRoom.code, { type: 'joined', code: newRoom.code, userId, username: me.username });
        sseBus.emitUser(userId, { type: 'room_update', code: newRoom.code });
        await req.db.exec('COMMIT');
        return reply.code(200).send({ ok: true, code: newRoom.code, role: 'host' as const });
    }
    catch (err) {
        try { await req.db.exec('ROLLBACK'); } catch { }
        req.log.error({ err }, 'quickMatch failed');
        return reply.code(500).send({ error: 'Quickmatch error' });
    }
}