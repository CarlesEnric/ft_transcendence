import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAuthUser } from '../plugins/auth.js';

const CreateRoomSchema = z.object({
    mode: z.enum(['ladder', 'tournament']),
    tournamentId: z.coerce.number().int().positive().optional(),
    code: z.string().trim().min(4).max(16).optional(),
});
const JoinRoomSchema = z.object({
    code: z.string().trim().min(4).max(16),
});
const ReadySchema = z.object({
    ready: z.boolean(),
});
const FinishSchema = z.object({
    code: z.string().trim().min(4).max(16),
    score1: z.coerce.number().int().min(0),
    score2: z.coerce.number().int().min(0),
});
function genCode(len = 6): string
{
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
}

async function loadRoomByCode(db: any, code: string)
{
    const r = (await db.get(
        `SELECT id, code, mode, status, tournament_id AS tournamentId, started_at AS startedAt, finished_at AS finishedAt FROM rooms WHERE code=?`,
        code
    )) as
        | { id: number; code: string; mode: 'ladder' | 'tournament'; status: string; tournamentId: number | null; startedAt: string | null; finishedAt: string | null }
        | undefined;
    return r ?? null;
}

async function loadPlayers(db: any, roomId: number)
{
    const rows = (await db.all(
        `SELECT user_id AS userId, username, ready, joined_at AS joinedAt FROM room_players WHERE room_id=? ORDER BY joined_at ASC`,
        roomId
    )) as Array<{ userId: number; username: string; ready: 0 | 1; joinedAt: string }>;
    return rows;
}

export async function createRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const parsed = CreateRoomSchema.safeParse(req.body ?? {});
    if (!parsed.success)
    {
        return reply.code(400).send({ error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    const { mode, tournamentId } = parsed.data;
    let { code } = parsed.data;
    if (mode === 'tournament')
    {
        const t = (await req.db.get(`SELECT id FROM tournaments WHERE id=?`, tournamentId)) as { id: number } | undefined;
        if (!t) return reply.code(404).send({ error: 'Torneo no existe' });
    }
    if (!code)
    {
        for (let i = 0; i < 8; i++)
        {
            const cand = genCode(6);
            const exists = (await req.db.get(`SELECT id FROM rooms WHERE code=?`, cand)) as { id: number } | undefined;
            if (!exists) { code = cand; break; }
        }
        if (!code) return reply.code(500).send({ error: 'No se pudo generar código de sala' });
    }
    else
    {
        const exists = (await req.db.get(`SELECT id FROM rooms WHERE code=?`, code)) as { id: number } | undefined;
        if (exists) return reply.code(409).send({ error: 'Código de sala ya existe' });
    }
    const tId = mode === 'tournament' ? (tournamentId ?? null) : null;
    const created = (await req.db.get(
        `INSERT INTO rooms(code, mode, status, tournament_id) VALUES(?, ?, 'waiting', ?) RETURNING id, code, mode, status, tournament_id AS tournamentId`,
        code, mode, tId
    )) as
        | { id: number; code: string; mode: 'ladder' | 'tournament'; status: string; tournamentId: number | null }
        | undefined;
    if (!created) return reply.code(500).send({ error: 'No se pudo crear la sala' });
    return reply.code(201).send(created);
}

export async function joinRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const parsed = JoinRoomSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const { code } = parsed.data;
    const room = await loadRoomByCode(req.db, code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    if (room.status !== 'waiting') return reply.code(409).send({ error: 'La sala no admite uniones' });
    if (room.mode === 'tournament')
    {
        const p = (await req.db.get(
            `SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=?`,
            room.tournamentId, me.id
        )) as { 1: number } | undefined;
        if (!p) return reply.code(403).send({ error: 'No estás inscrito en el torneo' });
    }
    const players = await loadPlayers(req.db, room.id);
    if (players.find((p) => p.userId === me.id))
    {
        return reply.code(200).send({ ok: true, code: room.code });
    }
    if (players.length >= 2) return reply.code(409).send({ error: 'La sala está llena' });
    await req.db.run(
        `INSERT INTO room_players(room_id, user_id, username, ready) VALUES(?, ?, ?, 0)`,
        room.id, me.id, me.username
    );
    return reply.code(200).send({ ok: true, code: room.code });
}

export async function setReady(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = z.object({ code: z.string().min(4).max(16) }).safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const body = ReadySchema.safeParse(req.body ?? {});
    if (!body.success) return reply.code(400).send({ error: 'Body inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    if (room.status !== 'waiting' && room.status !== 'in_progress')
    {
        return reply.code(409).send({ error: 'Estado de sala no válido' });
    }
    const players = await loadPlayers(req.db, room.id);
    if (!players.find((p) => p.userId === me.id)) return reply.code(403).send({ error: 'No estás en la sala' });
    await req.db.run(
        `UPDATE room_players SET ready=? WHERE room_id=? AND user_id=?`,
        body.data.ready ? 1 : 0, room.id, me.id
    );
    const updated = await loadPlayers(req.db, room.id);
    if (updated.length === 2 && updated.every((p) => p.ready === 1) && room.status === 'waiting')
    {
        await req.db.run(`UPDATE rooms SET status='in_progress', started_at=datetime('now') WHERE id=?`, room.id);
    }
    return reply.code(200).send({ ok: true });
}

export async function getRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = z.object({ code: z.string().min(4).max(16) }).safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    const players = await loadPlayers(req.db, room.id);
    return reply.code(200).send({ ...room, players });
}

export async function leaveRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = z.object({ code: z.string().min(4).max(16) }).safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    if (room.status === 'finished' || room.status === 'cancelled') return reply.code(409).send({ error: 'Sala cerrada' });
    await req.db.run(`DELETE FROM room_players WHERE room_id=? AND user_id=?`, room.id, me.id);
    const players = await loadPlayers(req.db, room.id);
    if (players.length === 0)
    {
        await req.db.run(`UPDATE rooms SET status='cancelled', finished_at=datetime('now') WHERE id=?`, room.id);
    }
    else
    {
        if (room.status === 'in_progress')
        {
            await req.db.run(`UPDATE rooms SET status='waiting', started_at=NULL WHERE id=?`, room.id);
            await req.db.run(`UPDATE room_players SET ready=0 WHERE room_id=?`, room.id);
        }
    }
    return reply.code(200).send({ ok: true });
}

export async function cancelRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const params = z.object({ code: z.string().min(4).max(16) }).safeParse(req.params ?? {});
    if (!params.success) return reply.code(400).send({ error: 'Código inválido' });
    const room = await loadRoomByCode(req.db, params.data.code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    const isMember = (await req.db.get(
        `SELECT 1 FROM room_players WHERE room_id=? AND user_id=?`,
        room.id, me.id
    )) as { 1: number } | undefined;
    if (!isMember) return reply.code(403).send({ error: 'No estás en la sala' });
    await req.db.run(`UPDATE rooms SET status='cancelled', finished_at=datetime('now') WHERE id=?`, room.id);
    await req.db.run(`DELETE FROM room_players WHERE room_id=?`, room.id);
    return reply.code(200).send({ ok: true });
}

export async function finishRoom(req: FastifyRequest, reply: FastifyReply)
{
    const me = await getAuthUser(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const parsed = FinishSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos' });
    const { code, score1, score2 } = parsed.data;
    const room = await loadRoomByCode(req.db, code);
    if (!room) return reply.code(404).send({ error: 'Sala no existe' });
    const players = await loadPlayers(req.db, room.id);
    if (players.length !== 2) return reply.code(409).send({ error: 'La sala no tiene 2 jugadores' });
    if (room.status !== 'in_progress') return reply.code(409).send({ error: 'La sala no está en progreso' });
    const p1 = players[0];
    const p2 = players[1];
    const winner = score1 > score2 ? p1.userId : p2.userId;
    const dateIso = new Date().toISOString();
    await req.db.run('BEGIN;');
    try
    {
        await req.db.run(
            `INSERT INTO matches (player1, player2, username1, username2, score1, score2, winner, date, tournament_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            p1.userId, p2.userId, p1.username, p2.username, score1, score2, winner, dateIso, room.tournamentId ?? null
        );
        const d1 = (await req.db.get(`SELECT 1 FROM dashboard WHERE userId=?`, p1.userId)) as { 1: number } | undefined;
        if (!d1)
        {
            await req.db.run(
                `INSERT INTO dashboard(userId, games_played, games_won, games_lost) VALUES (?, 1, ?, ?)`,
                p1.userId, winner === p1.userId ? 1 : 0, winner === p1.userId ? 0 : 1
            );
        }
        else
        {
            await req.db.run(
                `UPDATE dashboard SET games_played = games_played + 1, games_won = games_won + ?, games_lost = games_lost + ? WHERE userId = ?`,
                winner === p1.userId ? 1 : 0, winner === p1.userId ? 0 : 1, p1.userId
            );
        }
        const d2 = (await req.db.get(`SELECT 1 FROM dashboard WHERE userId=?`, p2.userId)) as { 1: number } | undefined;
        if (!d2)
        {
            await req.db.run(
                `INSERT INTO dashboard(userId, games_played, games_won, games_lost) VALUES (?, 1, ?, ?)`,
              p2.userId, winner === p2.userId ? 1 : 0, winner === p2.userId ? 0 : 1
            );
        }
        else
        {
            await req.db.run(
                `UPDATE dashboard SET games_played = games_played + 1, games_won = games_won + ?, games_lost = games_lost + ? WHERE userId = ?`,
                winner === p2.userId ? 1 : 0, winner === p2.userId ? 0 : 1, p2.userId
            );
        }
        await req.db.run(`UPDATE rooms SET status='finished', finished_at=datetime('now') WHERE id=?`, room.id);
        await req.db.run(`DELETE FROM room_players WHERE room_id=?`, room.id);
        await req.db.run('COMMIT;');
    }
    catch (e)
    {
        await req.db.run('ROLLBACK;');
        req.log.error(e);
        return reply.code(500).send({ error: 'No se pudo finalizar la sala' });
    }
    return reply.code(200).send({ ok: true });
}