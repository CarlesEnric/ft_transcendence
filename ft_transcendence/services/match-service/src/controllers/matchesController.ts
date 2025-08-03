// src/controllers/matchesController.ts

import type { FastifyRequest, FastifyReply } from 'fastify';
import { PostMatch } from '../schemas/matches.schema.js';
import type { infer as zInfer } from 'zod';

type MatchBody = zInfer<typeof PostMatch>;

export async function createMatch(
  request: FastifyRequest<{ Body: MatchBody }>,
  reply: FastifyReply
) {
  const parse = PostMatch.safeParse(request.body);
  if (!parse.success) {
    return reply
      .code(400)
      .send({ error: 'Datos inválidos', detalles: parse.error.format() });
  }

  const { player1, player2, score1, score2 } = parse.data;
  const winner = score1 > score2 ? player1 : player2;
  const date = new Date().toISOString();
  // Get userId from x-user-id header (set by API Gateway)
  const userId = request.headers['x-user-id'] ? String(request.headers['x-user-id']) : undefined;

  let savedInDb = false;

  if (userId) {
    await request.db.run(
      `INSERT INTO matches(player1, player2, score1, score2, winner, date) VALUES (?, ?, ?, ?, ?, ?)`,
      player1, player2, score1, score2, winner, date
    );

    const existing = await request.db.get(
      `SELECT 1 FROM dashboard WHERE userId = ?`,
      userId
    );
    if (!existing)
    {
      await request.db.run(
        `INSERT INTO dashboard(userId, games_played, games_won, games_lost) VALUES (?, 1, ?, ?)`,
        userId, winner === userId ? 1 : 0, winner === userId ? 0 : 1
      );
    }
    else
    {
      await request.db.run(
        `UPDATE dashboard SET games_played = games_played + 1, games_won = games_won + ?, games_lost = games_lost + ? WHERE userId = ?`,
        winner === userId ? 1 : 0, winner === userId ? 0 : 1, userId
      );
    }
    savedInDb = true;
  }

  reply.code(201).send({
    message: 'Partido procesado',
    savedInDb,
    match: { player1, player2, score1, score2, winner, date }
  });
}

export async function listMatches(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Get userId from x-user-id header (set by API Gateway)
  const userId = request.headers['x-user-id'] ? String(request.headers['x-user-id']) : undefined;
  if (!userId)
  {
    return reply.code(200).send([]); // Sin autenticación, devolvemos array vacío
  }
  const rows = await request.db.all(
    `SELECT * FROM matches WHERE player1 = ? OR player2 = ? ORDER BY date DESC`,
    userId, userId
  );
  reply.code(200).send(rows);
}

export async function getDashboard(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log('[MATCH-SERVICE] Headers for /dashboard:', request.headers);
  // Get userId from x-user-id header (set by API Gateway)
  const userId = request.headers['x-user-id'] ? String(request.headers['x-user-id']) : undefined;
  if (!userId) {
    return reply.code(401).send({ error: 'No autorizado' });
  }


  const row = await request.db.get(
    `SELECT games_played, games_won, games_lost FROM dashboard WHERE userId = ?`,
    userId
  ) as any;

  if (!row) {
    return reply
      .code(200)
      .send({ games_played: 0, games_won: 0, games_lost: 0, win_rate: 0 });
  }

  const { games_played, games_won, games_lost } = row;
  return reply.code(200).send({
    games_played, games_won, games_lost, win_rate: games_played > 0 ? games_won / games_played : 0
  });
}
