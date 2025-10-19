import type { FastifyReply, FastifyRequest } from 'fastify';
import { getAuthUser } from '../plugins/auth.js';
import { sseBus } from '../utils/sseBus.js';
import type { Database } from 'sqlite';
import type { TournamentStatus, UserEvent } from '../utils/sseBus.js';


type Size = 4 | 8;

interface TournamentRow {
  id: number;
  name: string;
  size: Size;
  status: TournamentStatus; // 'planned' | 'open' | 'in_progress' | 'finished' | 'cancelled' | 'waiting'
  creator_id: number;
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  winner_id?: number | null;
  winner_username?: string | null;
}

interface ParticipantRow {
  userId: number;
  username: string;
  joinedAt: string;
}

interface SeedRow {
  seat: number;
  user_id: number;
  username: string;
}

interface MatchRow {
  id: number;
  round: number;
  slot: number;
  status: 'pending' | 'in_progress' | 'finished';
  player1_seat: number | null;
  player2_seat: number | null;
  prev_p1_id: number | null;
  prev_p2_id: number | null;
  next_match_id: number | null;
  next_is_p1: 1 | 0 | null;
  room_code: string | null;
  score1: number | null;
  score2: number | null;
  winner_username: string | null;
}

type RunResult = { lastID: number; changes: number };

interface WithDbRequest extends FastifyRequest {
  db: Database;
}

async function dbAll<T>(db: Database, sql: string, params: unknown[] = []): Promise<T[]> {
  return db.all<T[]>(sql, params);
}

async function dbGet<T>(db: Database, sql: string, params: unknown[] = []): Promise<T | undefined> {
  return db.get<T>(sql, params);
}

async function dbRun(db: Database, sql: string, params: unknown[] = []): Promise<RunResult> {
  const res = await db.run(sql, params);
  return { lastID: Number(res?.lastID ?? 0), changes: Number(res?.changes ?? 0) };
}


async function loadTournamentPlayers(db: Database, tournamentId: number): Promise<ParticipantRow[]> {
  return dbAll<ParticipantRow>(
    db,
    `SELECT user_id as userId, username, joined_at as joinedAt
     FROM tournament_participants
     WHERE tournament_id=?
     ORDER BY datetime(joined_at) ASC`,
    [tournamentId]
  );
}

async function emitToParticipants(db: Database, tournamentId: number, ev: UserEvent): Promise<void> {
  const players = await loadTournamentPlayers(db, tournamentId);
  players.forEach((p) => sseBus.emitUser(p.userId, ev));
}

function pairingsForSize(size: Size): Array<[number, number]> {
  return size === 8
    ? [
      [1, 8],
      [4, 5],
      [3, 6],
      [2, 7],
    ]
    : [
      [1, 4],
      [2, 3],
    ];
}

async function seedBracket(db: Database, tournamentId: number, size: Size): Promise<void> {
  const participants = await loadTournamentPlayers(db, tournamentId);
  const top = participants.slice(0, size);

  await dbRun(db, `DELETE FROM tournament_seeds WHERE tournament_id=?`, [tournamentId]);
  await dbRun(db, `DELETE FROM tournament_matches WHERE tournament_id=?`, [tournamentId]);

  for (let i = 0; i < top.length; i++) {
    const seat = i + 1;
    await dbRun(
      db,
      `INSERT INTO tournament_seeds (tournament_id, seat, user_id, username)
       VALUES (?, ?, ?, ?)`,
      [tournamentId, seat, top[i].userId, top[i].username]
    );
  }

  const r1Pairs = pairingsForSize(size);
  const matchIds: { r1: number[]; r2: number[]; r3: number[] } = { r1: [], r2: [], r3: [] };

  for (let i = 0; i < r1Pairs.length; i++) {
    const [s1, s2] = r1Pairs[i];
    const res = await dbRun(
      db,
      `INSERT INTO tournament_matches
       (tournament_id, round, slot, status, player1_seat, player2_seat)
       VALUES (?, 1, ?, 'pending', ?, ?)`,
      [tournamentId, i + 1, s1, s2]
    );
    matchIds.r1.push(res.lastID);
  }

  if (size === 4) {
    const f = await dbRun(
      db,
      `INSERT INTO tournament_matches (tournament_id, round, slot, status)
       VALUES (?, 2, 1, 'pending')`,
      [tournamentId]
    );
    matchIds.r2 = [f.lastID];

    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=1 WHERE id=?`, [
      matchIds.r2[0],
      matchIds.r1[0],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=0 WHERE id=?`, [
      matchIds.r2[0],
      matchIds.r1[1],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET prev_p1_id=?, prev_p2_id=? WHERE id=?`, [
      matchIds.r1[0],
      matchIds.r1[1],
      matchIds.r2[0],
    ]);
  } else {
    const s1 = await dbRun(
      db,
      `INSERT INTO tournament_matches (tournament_id, round, slot, status)
       VALUES (?, 2, 1, 'pending')`,
      [tournamentId]
    );
    const s2 = await dbRun(
      db,
      `INSERT INTO tournament_matches (tournament_id, round, slot, status)
       VALUES (?, 2, 2, 'pending')`,
      [tournamentId]
    );
    matchIds.r2 = [s1.lastID, s2.lastID];
    const f = await dbRun(
      db,
      `INSERT INTO tournament_matches (tournament_id, round, slot, status)
       VALUES (?, 3, 1, 'pending')`,
      [tournamentId]
    );
    matchIds.r3 = [f.lastID];
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=1 WHERE id=?`, [
      matchIds.r2[0],
      matchIds.r1[0],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=0 WHERE id=?`, [
      matchIds.r2[0],
      matchIds.r1[1],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=1 WHERE id=?`, [
      matchIds.r2[1],
      matchIds.r1[2],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=0 WHERE id=?`, [
      matchIds.r2[1],
      matchIds.r1[3],
    ]);

    await dbRun(db, `UPDATE tournament_matches SET prev_p1_id=?, prev_p2_id=? WHERE id=?`, [
      matchIds.r1[0],
      matchIds.r1[1],
      matchIds.r2[0],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET prev_p1_id=?, prev_p2_id=? WHERE id=?`, [
      matchIds.r1[2],
      matchIds.r1[3],
      matchIds.r2[1],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=1 WHERE id=?`, [
      matchIds.r3[0],
      matchIds.r2[0],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET next_match_id=?, next_is_p1=0 WHERE id=?`, [
      matchIds.r3[0],
      matchIds.r2[1],
    ]);
    await dbRun(db, `UPDATE tournament_matches SET prev_p1_id=?, prev_p2_id=? WHERE id=?`, [
      matchIds.r2[0],
      matchIds.r2[1],
      matchIds.r3[0],
    ]);
  }
}

export async function createTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }

  const db = (req as WithDbRequest).db;
  const body = (req.body ?? {}) as Partial<{ name: string; size: number }>;
  const _size: Size = body.size === 8 ? 8 : 4;
  const _name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Torneo';

  const res = await dbRun(
    db,
    `INSERT INTO tournaments (name, size, status, creator_id) VALUES (?, ?, 'open', ?)`,
    [_name, _size, me.id]
  );
  const id = res.lastID;

  await dbRun(
    db,
    `INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id, username)
     VALUES (?, ?, ?)`,
    [id, me.id, me.username]
  );

  sseBus.emitUser(me.id, { type: 'tournament_status', id, status: 'open' });
  reply.code(201).send({ id });
}

export async function joinTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  const t = await dbGet<TournamentRow>(db, `SELECT * FROM tournaments WHERE id=?`, [id]);
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }
  if (t.status !== 'open' && t.status !== 'planned') {
    reply.code(400).send({ error: 'El torneo no acepta más jugadores' });
    return;
  }

  const countRow = await dbGet<{ c: number }>(
    db,
    `SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?`,
    [id]
  );
  const current = countRow?.c ?? 0;
  if (current >= t.size) {
    reply.code(400).send({ error: 'Torneo lleno' });
    return;
  }
  await dbRun(
    db,
    `INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id, username)
     VALUES (?, ?, ?)`,
    [id, me.id, me.username]
  );
  const countAfter = await dbGet<{ c: number }>(
    db,
    `SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?`,
    [id]
  );
  const tNow = await dbGet<{ size: number; status: TournamentStatus }>(db, `SELECT size, status FROM tournaments WHERE id=?`, [id]);
  await emitToParticipants(db, id, { type: 'tournament_joined', id, userId: me.id });
  if (tNow && countAfter && countAfter.c >= tNow.size && (tNow.status === 'open' || tNow.status === 'planned')) {
    await emitToParticipants(db, id, { type: 'tournament_status', id, status: 'waiting' });
  }
  reply.send({ ok: true });
}

export async function startTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  const t = await dbGet<TournamentRow>(db, `SELECT * FROM tournaments WHERE id=?`, [id]);
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }
  if (t.creator_id !== me.id) {
    reply.code(403).send({ error: 'Solo el creador puede iniciar' });
    return;
  }

  const countRow = await dbGet<{ c: number }>(
    db,
    `SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?`,
    [id]
  );
  const current = countRow?.c ?? 0;
  if (current < t.size) {
    reply.code(400).send({ error: 'Faltan jugadores' });
    return;
  }

  await seedBracket(db, id, t.size as Size);
  await dbRun(db, `UPDATE tournaments SET status='in_progress', started_at=datetime('now') WHERE id=?`, [id]);

  await emitToParticipants(db, id, { type: 'tournament_status', id, status: 'in_progress' });
  reply.send({ ok: true });
}

export async function allocateRoomForTournamentMatch(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const params = req.params as { id: string; matchId: string };
  const id = Number(params.id);
  const matchId = Number(params.matchId);
  const body = (req.body ?? {}) as Partial<{ room_code: string }>;

  if (!body.room_code) {
    reply.code(400).send({ error: 'room_code requerido' });
    return;
  }

  const exists = await dbGet<{ id: number }>(
    db,
    `SELECT id FROM tournament_matches WHERE id=? AND tournament_id=?`,
    [matchId, id]
  );
  if (!exists) {
    reply.code(404).send({ error: 'Match no encontrado' });
    return;
  }

  await dbRun(
    db,
    `UPDATE tournament_matches
     SET room_code=?, status=CASE WHEN status='pending' THEN 'in_progress' ELSE status END
     WHERE id=?`,
    [body.room_code, matchId]
  );

  await emitToParticipants(db, id, { type: 'tournament_bracket_update', id, matchId });
  reply.send({ ok: true });
}

export async function reportTournamentMatch(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const params = req.params as { id: string; matchId: string };
  const id = Number(params.id);
  const matchId = Number(params.matchId);
  const body = (req.body ?? {}) as Partial<{
    score1: number;
    score2: number;
    winner_id: number;
    winner_username: string;
  }>;

  const m = await dbGet<MatchRow>(
    db,
    `SELECT * FROM tournament_matches WHERE id=? AND tournament_id=?`,
    [matchId, id]
  );
  if (!m) {
    reply.code(404).send({ error: 'Match no encontrado' });
    return;
  }

  await dbRun(
    db,
    `UPDATE tournament_matches
     SET status='finished', score1=?, score2=?, winner_id=?, winner_username=?, finished_at=datetime('now')
     WHERE id=?`,
    [body.score1 ?? null, body.score2 ?? null, body.winner_id ?? null, body.winner_username ?? null, matchId]
  );

  await emitToParticipants(db, id, { type: 'tournament_bracket_update', id, matchId });
  reply.send({ ok: true });
}

export async function leaveTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  await dbRun(db, `DELETE FROM tournament_participants WHERE tournament_id=? AND user_id=?`, [id, me.id]);
  await emitToParticipants(db, id, { type: 'tournament_left', id, userId: me.id });
  reply.send({ ok: true });
}

export async function cancelTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  const t = await dbGet<Pick<TournamentRow, 'creator_id'>>(db, `SELECT creator_id FROM tournaments WHERE id=?`, [
    id,
  ]);
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }
  if (t.creator_id !== me.id) {
    reply.code(403).send({ error: 'Solo el creador puede cancelar' });
    return;
  }

  await dbRun(db, `UPDATE tournaments SET status='cancelled' WHERE id=?`, [id]);
  await emitToParticipants(db, id, { type: 'tournament_status', id, status: 'cancelled' });
  reply.send({ ok: true });
}

export async function getBracket(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  const t = await dbGet<Pick<TournamentRow, 'id' | 'name' | 'size' | 'status'>>(
    db,
    `SELECT id, name, size, status FROM tournaments WHERE id=?`,
    [id]
  );
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }

  const seeds = await dbAll<SeedRow>(
    db,
    `SELECT seat, user_id, username
     FROM tournament_seeds
     WHERE tournament_id=?
     ORDER BY seat ASC`,
    [id]
  );

  const matches = await dbAll<MatchRow>(
    db,
    `SELECT id, round, slot, status,
            player1_seat, player2_seat,
            prev_p1_id, prev_p2_id, next_match_id, next_is_p1,
            room_code, score1, score2, winner_username
     FROM tournament_matches
     WHERE tournament_id=?
     ORDER BY round ASC, slot ASC, id ASC`,
    [id]
  );

  reply.send({ tournament: t, seeds, matches });
}

export async function getTournamentById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);

  const t = await dbGet<TournamentRow>(
    db,
    `SELECT id, name, size, status, creator_id, created_at, started_at, finished_at, winner_username
     FROM tournaments WHERE id=?`,
    [id]
  );
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }

  const participants = await dbAll<ParticipantRow>(
    db,
    `SELECT user_id as userId, username, joined_at as joinedAt
     FROM tournament_participants WHERE tournament_id=?
     ORDER BY datetime(joined_at) ASC`,
    [id]
  );

  reply.send({
    id: t.id,
    name: t.name,
    size: t.size,
    status: t.status,
    creator_id: t.creator_id,
    created_at: t.created_at,
    started_at: t.started_at,
    finished_at: t.finished_at,
    winner_username: t.winner_username,
    participants,
  });
}

export async function listTournaments(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  const db = (req as WithDbRequest).db;

  const rows = await dbAll<
    Pick<TournamentRow, 'id' | 'name' | 'size' | 'status' | 'creator_id' | 'created_at'> & {
      participants: number;
    }
  >(
    db,
    `SELECT
        t.id, t.name, t.size, t.status, t.creator_id, t.created_at,
        (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id=t.id) AS participants
     FROM tournaments t
     ORDER BY datetime(t.created_at) DESC`
  );

  const items = await Promise.all(
    rows.map(async (t) => {
      const seats_left = Math.max(0, (t.size as number) - (t.participants as number));
      let is_participant = false;

      if (me) {
        const r = await dbGet<{ ok: number }>(
          db,
          `SELECT 1 as ok FROM tournament_participants WHERE tournament_id=? AND user_id=?`,
          [t.id, me.id]
        );
        is_participant = !!r;
      }

      return {
        id: t.id,
        name: t.name,
        status: t.status,
        size: t.size,
        created_at: t.created_at,
        participants: t.participants,
        seats_left,
        creator_id: t.creator_id,
        is_participant,
      };
    })
  );

  reply.send({ items });
}

export async function seedInlineTournament(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await getAuthUser(req);
  if (!me) {
    reply.code(401).send({ error: 'No autorizado' });
    return;
  }
  const db = (req as WithDbRequest).db;
  const id = Number((req.params as { id: string }).id);
  const body = (req.body ?? {}) as Partial<{ participants: number[] }>;

  if (!Array.isArray(body.participants) || (body.participants.length !== 4 && body.participants.length !== 8)) {
    reply.code(400).send({ error: 'participants debe ser un array de 4 u 8 userIds' });
    return;
  }
  const t = await dbGet<TournamentRow>(db, `SELECT * FROM tournaments WHERE id=?`, [id]);
  if (!t) {
    reply.code(404).send({ error: 'Torneo no encontrado' });
    return;
  }
  if (t.creator_id !== me.id) {
    reply.code(403).send({ error: 'Solo el creador puede sembrar participantes' });
    return;
  }
  if (t.status !== 'open' && t.status !== 'planned' && t.status !== 'waiting') {
    reply.code(400).send({ error: `Estado ${t.status} no permite seeding` });
    return;
  }
  const currentCountRow = await dbGet<{ c: number }>(
    db,
    `SELECT COUNT(*) as c FROM tournament_participants WHERE tournament_id=?`,
    [id]
  );
  const currentCount = currentCountRow?.c ?? 0;
  const size = t.size as 4 | 8;
  const slotsLeft = Math.max(0, size - currentCount);
  if (slotsLeft <= 0) {
    reply.send({ ok: true, count: 0 });
    return;
  }
  const current = await dbAll<{ user_id: number }>(
    db,
    `SELECT user_id FROM tournament_participants WHERE tournament_id=?`,
    [id]
  );
  const currentIds = new Set(current.map(r => r.user_id));
  const toInsert = body.participants.filter(uid => !currentIds.has(uid)).slice(0, slotsLeft);
  for (const uid of toInsert) {
    let username = `user_${uid}`;
    try {
      const u = await dbGet<{ username: string }>(db, `SELECT username FROM users WHERE id=?`, [uid]);
      if (u?.username) username = u.username;
    } catch {
    }

    await dbRun(
      db,
      `INSERT OR IGNORE INTO tournament_participants (tournament_id, user_id, username)
       VALUES (?, ?, ?)`,
      [id, uid, username]
    );
  }
  await emitToParticipants(db, id, { type: 'tournament_joined', id, userId: me.id });

  reply.send({ ok: true, count: toInsert.length });
}