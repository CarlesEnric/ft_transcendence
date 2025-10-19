import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Database } from 'sqlite';
import { getAuthUser } from '../plugins/auth.js';

type InlineMatchBody = {
  player1: number;
  player2: number;
  username1: string;
  username2: string;
  score1: number;
  score2: number;
  winner: number;
  date?: string;
  tournament_id?: number | null;
};

export async function saveInlineMatch(req: FastifyRequest, reply: FastifyReply) {
  const me = await getAuthUser(req);
  if (!me) return reply.code(401).send({ error: 'No autorizado' });

  const body = req.body as InlineMatchBody;
  const {
    player1, player2, username1, username2,
    score1, score2, winner, date, tournament_id
  } = body;

  if (
    !player1 || !player2 ||
    typeof username1 !== 'string' || typeof username2 !== 'string' ||
    typeof score1 !== 'number' || typeof score2 !== 'number' ||
    !winner
  ) {
    return reply.code(400).send({ error: 'Campos obligatorios faltantes' });
  }

  const db = (req.db as unknown) as Database;

  const sql = `
    INSERT INTO matches (player1, player2, username1, username2, score1, score2, winner, date, tournament_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), ?)
  `;
  const res = await db.run(sql, [
    player1,
    player2,
    username1,
    username2,
    score1,
    score2,
    winner,
    date ?? null,
    tournament_id ?? null,
  ]);

  return reply.code(201).send({ ok: true, id: res.lastID });
}