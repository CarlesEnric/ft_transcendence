import type { FastifyReply, FastifyRequest } from 'fastify';
import { getAuthUser } from '../plugins/auth.js';
import type { Database } from 'sqlite';

type RunResult = { lastID: number; changes: number };
interface WithDbRequest extends FastifyRequest { db: Database; }
async function dbRun(db: Database, sql: string, params: unknown[] = []): Promise<RunResult> {
  const res = await db.run(sql, params);
  return { lastID: Number(res?.lastID ?? 0), changes: Number(res?.changes ?? 0) };
}

export async function listMatches(req: FastifyRequest, reply: FastifyReply)
{
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });
  const rows = await req.db.all(
    `SELECT id, player1, player2, username1, username2, score1, score2, winner, date, tournament_id
     FROM matches WHERE player1 = ? OR player2 = ? ORDER BY datetime(date) DESC LIMIT 50`,
    me.id, me.id
  );
  return reply.send(rows ?? []);
}

export async function getDashboard(req: FastifyRequest, reply: FastifyReply)
{
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });
  const row = await req.db.get<{ games_played: number; games_won: number; games_lost: number }>(
    `SELECT games_played, games_won, games_lost FROM dashboard WHERE userId = ?`,
    me.id
  );

  if (row && (row.games_played != null)) {
    const { games_played = 0, games_won = 0, games_lost = 0 } = row;
    return reply.code(200).send({
      games_played,
      games_won,
      games_lost,
      win_rate: games_played > 0 ? games_won / games_played : 0
    });
  }
  const agg = await req.db.get<{ games_played: number; games_won: number; games_lost: number }>(
    `
    SELECT
      COUNT(*) AS games_played,
      SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS games_won,
      SUM(CASE WHEN winner != ? AND winner IS NOT NULL THEN 1 ELSE 0 END) AS games_lost
    FROM matches
    WHERE player1 = ? OR player2 = ?
    `,
    me.id, me.id, me.id, me.id
  );

  const games_played = Number(agg?.games_played ?? 0);
  const games_won    = Number(agg?.games_won ?? 0);
  const games_lost   = Number(agg?.games_lost ?? 0);
  const win_rate     = games_played > 0 ? games_won / games_played : 0;
  await req.db.run(
    `
    INSERT INTO dashboard (userId, games_played, games_won, games_lost)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      games_played = excluded.games_played,
      games_won    = excluded.games_won,
      games_lost   = excluded.games_lost
    `,
    me.id, games_played, games_won, games_lost
  );

  return reply.code(200).send({ games_played, games_won, games_lost, win_rate });
}

export async function getLeaderboard(req: FastifyRequest, reply: FastifyReply)
{
  const top = Number((req.query as any)?.top ?? 10);
  const rows = await req.db.all(
    `SELECT userId, games_played, games_won, games_lost,CASE WHEN games_played>0 THEN 1.0*games_won/games_played ELSE 0 END AS win_rate
     FROM dashboard ORDER BY games_won DESC, games_played DESC LIMIT ?`,
    top
  );
  reply.code(200).send(rows);
}

export async function createOfflineMatch(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) { reply.code(401).send({ error: 'No autorizado' }); return; }
  const db = (req as WithDbRequest).db;
  const body = (req.body ?? {}) as Partial<{
    player1Id: number; player2Id: number;
    player1Name?: string; player2Name?: string;
    score1: number; score2: number;
    mode?: string; played_at?: string;
    tournament_id?: number | null;
  }>;
  const p1 = Number(body.player1Id);
  const p2 = Number(body.player2Id);
  const s1 = Number(body.score1);
  const s2 = Number(body.score2);
  const playedAt = (typeof body.played_at === 'string' && body.played_at.trim()) ? body.played_at.trim() : null;
  const tournamentId =
    (body.tournament_id == null || Number.isNaN(Number(body.tournament_id))) ? null : Number(body.tournament_id);

  if (!Number.isFinite(p1) || !Number.isFinite(p2) || p1 <= 0 || p2 <= 0 || p1 === p2) {
    reply.code(400).send({ error: 'player1Id/player2Id inválidos' }); return;
  }
  if (!Number.isFinite(s1) || !Number.isFinite(s2) || s1 < 0 || s2 < 0) {
    reply.code(400).send({ error: 'score1/score2 inválidos' }); return;
  }
  if (s1 === s2) { reply.code(400).send({ error: 'No se permiten empates' }); return; }

  const u1name = body.player1Name ?? `#${p1}`;
  const u2name = body.player2Name ?? `#${p2}`;
  const winnerId = s1 > s2 ? p1 : p2;
  const loserId  = s1 > s2 ? p2 : p1;
  const sql = `
    INSERT INTO matches (player1, username1, player2, username2, score1, score2, winner, date, tournament_id)
    VALUES (?,?,?,?,?,?,?, COALESCE(?, datetime('now')), ?)
  `;
  const { lastID } = await dbRun(db, sql, [
    p1, u1name,
    p2, u2name,
    s1, s2, winnerId,
    playedAt ?? null,
    tournamentId
  ]);
  await dbRun(db, `INSERT OR IGNORE INTO dashboard (userId, games_played, games_won, games_lost) VALUES (?,0,0,0)`, [p1]);
  await dbRun(db, `INSERT OR IGNORE INTO dashboard (userId, games_played, games_won, games_lost) VALUES (?,0,0,0)`, [p2]);
  await dbRun(db, `UPDATE dashboard SET games_played = games_played + 1, games_won = games_won + 1 WHERE userId = ?`, [winnerId]);
  await dbRun(db, `UPDATE dashboard SET games_played = games_played + 1, games_lost = games_lost + 1 WHERE userId = ?`, [loserId]);
  reply.code(201).send({ ok: true, id: lastID });
}