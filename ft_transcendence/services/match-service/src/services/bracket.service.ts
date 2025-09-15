import type { Database } from 'sqlite';
import { shuffleInPlace } from '../utils/shuffle.js';

export type SeedEntry = { user_id: number; username: string };
export type MatchNode = {
    id: number;
    round: number;
    slot: number;
    player1_seat?: number | null;
    player2_seat?: number | null;
    next_match_id?: number | null;
    next_is_p1?: 0 | 1 | null;
};

/**
 * Crea el árbol de un torneo de 4 u 8, con seeds aleatorios.
 * Devuelve todos los matches creados (con R1 ya ligados a seeds).
 */
export async function createBracket(db: Database, tournamentId: number, size: 4 | 8, seeds: SeedEntry[])
{
    if (seeds.length !== size) throw new Error('Seeds mismatch');
    shuffleInPlace(seeds);
    await db.run(`DELETE FROM tournament_seeds WHERE tournament_id = ?`, tournamentId);
    for (let i = 0; i < seeds.length; i++)
    {
        await db.run(
            `INSERT INTO tournament_seeds(tournament_id, seat, user_id, username) VALUES (?,?,?,?)`,
            tournamentId, i + 1, seeds[i].user_id, seeds[i].username
        );
    }

    // Creamos matches por rondas
    // R4 (size=8) => 3 rondas (R1:4 partidos, R2:2, R3:1)
    // R4 (size=4) => 2 rondas (R1:2, R2:1)
    const rounds = size === 8 ? 3 : 2;
    const perRound = (r: number) => size >> r;
    const nodes: MatchNode[] = [];
    for (let r = 1; r <= rounds; r++)
    {
        for (let s = 1; s <= perRound(r); s++)
        {
            const res = await db.get<{ id: number }>(
                `INSERT INTO tournament_matches (tournament_id, round, slot, status) VALUES (?,?,?,'pending') RETURNING id`,
                tournamentId, r, s
            );
            nodes.push({ id: res!.id, round: r, slot: s });
        }
    }
    // Link de R1 (seats) y relaciones hacia el siguiente partido
    // - Asignamos seats consecutivos de 2 en 2: (1,2), (3,4), ...
    const round1 = nodes.filter(n => n.round === 1).sort((a, b) => a.slot - b.slot);
    for (let i = 0; i < round1.length; i++)
    {
        const n = round1[i];
        n.player1_seat = 2 * i + 1;
        n.player2_seat = 2 * i + 2;
        await db.run(
            `UPDATE tournament_matches SET player1_seat=?, player2_seat=? WHERE id=?`,
            n.player1_seat, n.player2_seat, n.id
        );
    }
    // Relacionar winners con siguiente match
    for (let r = 1; r < rounds; r++)
    {
        const thisR = nodes.filter(n => n.round === r).sort((a, b) => a.slot - b.slot);
        const nextR = nodes.filter(n => n.round === r + 1).sort((a, b) => a.slot - b.slot);
        for (let i = 0; i < thisR.length; i++)
        {
            const from = thisR[i];
            const into = nextR[Math.floor(i / 2)];
            const goesToP1 = (i % 2 === 0); // el primer ganador va como p1, el siguiente como p2
            await db.run(
                `UPDATE tournament_matches SET next_match_id=?, next_is_p1=? WHERE id=?`,
                into.id, goesToP1 ? 1 : 0, from.id
            );
            from.next_match_id = into.id;
            from.next_is_p1 = goesToP1 ? 1 : 0;
        }
    }
    return nodes;
}
/**
 * Calcula qué jugadores (user_id/username) deben estar en un match,
 * usando seats (ronda 1) o los ganadores del match anterior.
 */
export async function resolveParticipants(db: Database, matchId: number): Promise<{ p1?: SeedEntry; p2?: SeedEntry }>
{
    const m = await db.get<any>(
        `SELECT id, tournament_id, round, slot, player1_seat, player2_seat, prev_p1_id, prev_p2_id FROM tournament_matches WHERE id=?`,
        matchId);
    if (!m) throw new Error('Match not found');
    const res: { p1?: SeedEntry; p2?: SeedEntry } = {};
    if (m.round === 1)
    {
        if (m.player1_seat)
        {
            const s1 = await db.get<any>(
                `SELECT user_id, username FROM tournament_seeds WHERE tournament_id=? AND seat=?`,
                m.tournament_id, m.player1_seat);
            if (s1) res.p1 = { user_id: s1.user_id, username: s1.username };
        }
        if (m.player2_seat)
        {
            const s2 = await db.get<any>(
                `SELECT user_id, username FROM tournament_seeds WHERE tournament_id=? AND seat=?`,
                m.tournament_id, m.player2_seat);
            if (s2) res.p2 = { user_id: s2.user_id, username: s2.username };
        }
    }
    else
    {
        if (m.prev_p1_id)
        {
            const w = await db.get<any>(
                `SELECT winner_id, winner_username FROM tournament_matches WHERE id=?`,
                m.prev_p1_id
            );
            if (w?.winner_id) res.p1 = { user_id: w.winner_id, username: w.winner_username };
        }
        if (m.prev_p2_id)
        {
            const w = await db.get<any>(
                `SELECT winner_id, winner_username FROM tournament_matches WHERE id=?`,
                m.prev_p2_id
            );
            if (w?.winner_id) res.p2 = { user_id: w.winner_id, username: w.winner_username };
        }
    }
    return res;
}

/**
 * Cuando conocemos next_match_id/next_is_p1 podemos setear prev_p1_id / prev_p2_id
 * en el next match para que `resolveParticipants` funcione a partir de las rondas 2..N.
 */
export async function wirePrevPointers(db: Database, tournamentId: number)
{
    const ms = await db.all<any[]>(
        `SELECT id, next_match_id, next_is_p1 FROM tournament_matches WHERE tournament_id=?`,
        tournamentId
    );
    for (const m of ms)
    {
        if (!m.next_match_id) continue;
        if (m.next_is_p1 === 1)
        {
            await db.run(
                `UPDATE tournament_matches SET prev_p1_id=? WHERE id=?`,
                m.id, m.next_match_id
            );
        }
        else
        {
            await db.run(
                `UPDATE tournament_matches SET prev_p2_id=? WHERE id=?`,
                m.id, m.next_match_id
            );
        }
    }
}