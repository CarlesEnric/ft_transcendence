import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Database } from 'sqlite';
import { z } from 'zod';
import { PostTournament, JoinTournament } from '../schemas/tournaments.schema.js';
import { createBracket, resolveParticipants, wirePrevPointers } from '../services/bracket.service.js';

function getMe(req: FastifyRequest)
{
    const xid = req.headers['x-user-id'];
    const xname = req.headers['x-username'];
    const id = typeof xid === 'string' ? Number(xid) : Array.isArray(xid) ? Number(xid[0]) : NaN;
    const username = typeof xname === 'string' ? xname : Array.isArray(xname) ? xname[0] : undefined;
    return (Number.isFinite(id) && id > 0 && username) ? { id, username } : null;
}

const ListTournamentsQuery = z.object({
    status: z.enum(['planned', 'open', 'in_progress', 'finished']).optional(),
    size: z.union([z.literal(4), z.literal(8)]).optional(),
    search: z.string().trim().min(1).max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// POST /tournaments
export async function createTournament(req: FastifyRequest, reply: FastifyReply)
{
    const me = getMe(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const parsed = PostTournament.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Datos inválidos', details: parsed.error.issues });
    const { name, size } = parsed.data;
    const row = await req.db.get<{ id: number }>(
        `INSERT INTO tournaments(name, size, status, creator_id) VALUES (?, ?, 'planned', ?) RETURNING id`,
        name, size, me.id
    );
    return reply.code(201).send({ id: row!.id, name, size, status: 'planned' });
}

// POST /tournaments/:id/join
export async function joinTournament(req: FastifyRequest, reply: FastifyReply) {
    const me = getMe(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const id = Number((req.params as any)?.id);
    if (!id) return reply.code(400).send({ error: 'TournamentId inválido' });
    const body = JoinTournament.safeParse(req.body ?? {});
    const userId = body.success ? body.data.userId : me.id;
    const t = await req.db.get<any>(
        `SELECT id, size, status FROM tournaments WHERE id=?`, id
    );
    if (!t) return reply.code(404).send({ error: 'Torneo no existe' });
    if (t.status !== 'planned' && t.status !== 'open')
    {
        return reply.code(400).send({ error: 'Torneo no admite inscripciones' });
    }
    const exists = await req.db.get<any>(
        `SELECT 1 FROM tournament_participants WHERE tournament_id=? AND user_id=?`,
        id, userId
    );
    if (exists) return reply.code(200).send({ ok: true });
    const username = (userId === me.id) ? me.username : `user#${userId}`;
    await req.db.run(
        `INSERT INTO tournament_participants(tournament_id, user_id, username) VALUES (?,?,?)`,
        id, userId, username
    );
    // si aún estaba "planned", lo pasamos a "open"
    if (t.status === 'planned')
    {
        await req.db.run(`UPDATE tournaments SET status='open' WHERE id=?`, id);
    }
    return reply.code(200).send({ ok: true });
}

// POST /tournaments/:id/start
// Requiere: status='open' y nº de participantes == size
export async function startTournament(req: FastifyRequest, reply: FastifyReply)
{
    const me = getMe(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const id = Number((req.params as any)?.id);
    if (!id) return reply.code(400).send({ error: 'TournamentId inválido' });
    const t = await req.db.get<any>(
        `SELECT id, size, status, creator_id FROM tournaments WHERE id=?`, id
    );
    if (!t) return reply.code(404).send({ error: 'Torneo no existe' });
    if (t.status !== 'open') return reply.code(400).send({ error: 'El torneo no está abierto para arrancar' });
    const ps = await req.db.all<any[]>(
        `SELECT user_id, username FROM tournament_participants WHERE tournament_id=? ORDER BY joined_at ASC`,
        id
    );
    if (ps.length !== t.size)
    {
        return reply.code(400).send({ error: `Se requieren ${t.size} participantes (hay ${ps.length})` });
    }
    await req.db.run('BEGIN');
    try
    {
        // crea seeds aleatorios y árbol (usa tu servicio)
        await createBracket(req.db, id, t.size, ps);
        await wirePrevPointers(req.db, id);
        await req.db.run(
            `UPDATE tournaments SET status='in_progress', started_at=datetime('now') WHERE id=?`,
            id
        );
        await req.db.run('COMMIT');
    }
    catch (e)
    {
        await req.db.run('ROLLBACK');
        req.log.error(e);
        return reply.code(500).send({ error: 'No se pudo crear el cuadro' });
    }
    return reply.code(200).send({ ok: true });
}

// GET /tournaments/:id/bracket
export async function getBracket(req: FastifyRequest, reply: FastifyReply)
{
    const id = Number((req.params as any)?.id);
    if (!id) return reply.code(400).send({ error: 'TournamentId inválido' });
    const t = await req.db.get<any>(
        `SELECT id, name, size, status, winner_id, winner_username FROM tournaments WHERE id=?`,
        id
    );
    if (!t) return reply.code(404).send({ error: 'Torneo no existe' });
    const seeds = await req.db.all<any[]>(
        `SELECT seat, user_id, username
     FROM tournament_seeds
     WHERE tournament_id=?
     ORDER BY seat ASC`,
        id
    );
    const matches = await req.db.all<any[]>(
        `SELECT id, round, slot, status, player1_seat, player2_seat, winner_id, winner_username,
        score1, score2, prev_p1_id, prev_p2_id, next_match_id, next_is_p1 FROM tournament_matches WHERE tournament_id=?
        ORDER BY round ASC, slot ASC`,
        id
    );
    return reply.code(200).send({ tournament: t, seeds, matches });
}

// POST /tournaments/:id/matches/:matchId/report
export async function reportTournamentMatch(req: FastifyRequest, reply: FastifyReply)
{
    const me = getMe(req);
    if (!me) return reply.code(401).send({ error: 'No autorizado' });
    const id = Number((req.params as any)?.id);
    const matchId = Number((req.params as any)?.matchId);
    if (!id || !matchId) return reply.code(400).send({ error: 'Ids inválidos' });
    const { score1, score2 } = (req.body ?? {}) as { score1?: number; score2?: number };
    if (typeof score1 !== 'number' || typeof score2 !== 'number' || score1 < 0 || score2 < 0)
    {
        return reply.code(400).send({ error: 'Marcadores inválidos' });
    }
    if (score1 === score2)
    {
        return reply.code(400).send({ error: 'No puede haber empate' });
    }
    const m = await req.db.get<any>(
        `SELECT id, tournament_id, round, slot, status, next_match_id, next_is_p1 FROM tournament_matches WHERE id=? AND tournament_id=?`,
        matchId, id
    );
    if (!m) return reply.code(404).send({ error: 'Partido no existe' });
    if (m.status !== 'pending') return reply.code(400).send({ error: 'Partido ya resuelto' });
    const { p1, p2 } = await resolveParticipants(req.db, matchId);
    if (!p1 || !p2) return reply.code(409).send({ error: 'Participantes no resueltos aún' });
    const winner = (score1 > score2) ? p1 : p2;
    const loser = (score1 > score2) ? p2 : p1;
    await req.db.run('BEGIN');
    try
    {
        // cerrar el match con ganador
        await req.db.run(
            `UPDATE tournament_matches SET status='finished', score1=?, score2=?, winner_id=?, winner_username=?, finished_at=datetime('now') WHERE id=?`,
            score1, score2, winner.user_id, winner.username, matchId
        );
        // avanzar al siguiente partido si existe
        if (m.next_match_id)
        {
            if (m.next_is_p1 === 1)
            {
                await req.db.run(
                    `UPDATE tournament_matches SET prev_p1_id=? WHERE id=?`,
                    matchId, m.next_match_id
                );
            }
            else
            {
                await req.db.run(
                    `UPDATE tournament_matches SET prev_p2_id=? WHERE id=?`,
                    matchId, m.next_match_id
                );
            }
        }
        else
        {
            // si no hay siguiente, era la final: cerramos torneo
            await req.db.run(
                `UPDATE tournaments SET status='finished', finished_at=datetime('now'), winner_id=?, winner_username=? WHERE id=?`,
                winner.user_id, winner.username, id
            );
        }
        // actualizar dashboard global
        await bumpDashboard(req.db, winner.user_id, loser.user_id);
        await req.db.run('COMMIT');
    }
    catch (e)
    {
        await req.db.run('ROLLBACK');
        req.log.error(e);
        return reply.code(500).send({ error: 'No se pudo reportar' });
    }
    return reply.code(200).send({ ok: true, winner: winner.username });
}
// GET /tournaments
export async function listTournaments(req: FastifyRequest, reply: FastifyReply)
{
    const parsed = ListTournamentsQuery.safeParse((req as any).query);
    if (!parsed.success) return reply.code(400).send({ error: 'Query inválida', details: parsed.error.issues });
    const { status, size, search, limit, offset } = parsed.data;
    const conds: string[] = [];
    const params: any[] = [];
    if (status) { conds.push('t.status = ?'); params.push(status); }
    if (size) { conds.push('t.size = ?'); params.push(size); }
    if (search)
    {
        // LIKE parametrizado
        conds.push(`t.name LIKE '%' || ? || '%'`);
        params.push(search);
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const rows = await req.db.all(
        `SELECT t.id, t.name, t.status, t.size, t.created_at, COUNT(tp.user_id) AS participants, (t.size - COUNT(tp.user_id)) 
        AS seats_left FROM tournaments t LEFT JOIN tournament_participants tp ON tp.tournament_id = t.id 
        ${where} GROUP BY t.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?;`,
        ...params, limit, offset
    );
    return reply.send({
        items: rows,
        pagination: { limit, offset, count: rows.length }
    });
}

//GET /tournaments/:id
export async function getTournamentById(req: FastifyRequest, reply: FastifyReply)
{
    const id = Number((req.params as any)?.id);
    if (!id) return reply.code(400).send({ error: 'id inválido' });
    const t = await req.db.get(
        `SELECT id, name, status, size, creator_id, created_at, started_at, finished_at, winner_id, winner_username
     FROM tournaments WHERE id = ?`,
        id
    );
    if (!t) return reply.code(404).send({ error: 'Torneo no existe' });
    const participants = await req.db.all(
        `SELECT user_id AS userId, username, joined_at FROM tournament_participants WHERE tournament_id = ? ORDER BY joined_at ASC`,
        id
    );
    return reply.send({ ...t, participants });
}
async function bumpDashboard(db: Database, winnerId: number, loserId: number)
{
    // winner
    const d1 = await db.get(`SELECT 1 FROM dashboard WHERE userId=?`, winnerId);
    if (!d1)
    {
        await db.run(
            `INSERT INTO dashboard(userId, games_played, games_won, games_lost) VALUES (?,?,?,?)`,
            winnerId, 1, 1, 0
        );
    }
    else
    {
        await db.run(
            `UPDATE dashboard SET games_played = games_played + 1, games_won = games_won + 1 WHERE userId=?`,
            winnerId
        );
    }
    // loser
    const d2 = await db.get(`SELECT 1 FROM dashboard WHERE userId=?`, loserId);
    if (!d2)
    {
        await db.run(
            `INSERT INTO dashboard(userId, games_played, games_won, games_lost) VALUES (?,?,?,?)`,
            loserId, 1, 0, 1
        );
    }
    else
    {
        await db.run(
            `UPDATE dashboard SET games_played = games_played + 1, games_lost = games_lost + 1 WHERE userId=?`,
            loserId
        );
    }
}