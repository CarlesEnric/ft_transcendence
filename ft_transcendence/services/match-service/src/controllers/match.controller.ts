import type { FastifyReply, FastifyRequest } from 'fastify';
import { getAuthUser } from '../plugins/auth.js';

export async function listMatches(req: FastifyRequest, reply: FastifyReply)
{
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });
  const rows = await req.db.all(
    `SELECT id, player1, player2, username1, username2, score1, score2, winner, date, tournament_id
     FROM matches WHERE player1 = ? OR player2 = ? ORDER BY date DESC`,
    me.id, me.id
  );
  reply.code(200).send(rows);
}

export async function getDashboard(req: FastifyRequest, reply: FastifyReply)
{
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });
  const row = await req.db.get<{ games_played: number; games_won: number; games_lost: number }>(
    `SELECT games_played, games_won, games_lost FROM dashboard WHERE userId = ?`,
    me.id
  );
  const games_played = row?.games_played ?? 0;
  const games_won = row?.games_won ?? 0;
  const games_lost = row?.games_lost ?? 0;
  reply.code(200).send({
    games_played, games_won, games_lost, win_rate: games_played > 0 ? games_won / games_played : 0,
  });
}

export async function getLeaderboard(req: FastifyRequest, reply: FastifyReply)
{
  const top = Number((req.query as any)?.top ?? 10);
  const rows = await req.db.all(
    `SELECT userId, games_played, games_won, games_lost, CASE WHEN games_played>0 THEN 1.0*games_won/games_played ELSE 0 END AS win_rate
     FROM dashboard ORDER BY games_won DESC, games_played DESC LIMIT ?`,
    top
  );
  reply.code(200).send(rows);
}