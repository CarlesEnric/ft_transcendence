import type { Database } from 'sqlite';

export type RoomRow = {
  id: number;
  code: string;
  status: 'waiting' | 'in_progress' | 'finished' | 'cancelled';
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  tournament_id?: number | null;
};

export type RoomPlayerRow = {
  user_id: number;
  username: string;
  ready: number;
};

export async function loadRoomByCode(db: Database, code: string): Promise<RoomRow | null> {
  const row = await db.get<RoomRow>(
    `SELECT id, code, status, created_at, started_at, finished_at, tournament_id
       FROM rooms
      WHERE code = ?`,
    code
  );
  return row ?? null;
}

export async function loadPlayers(db: Database, roomId: number): Promise<RoomPlayerRow[]> {
  const rows = await db.all<RoomPlayerRow[]>(
    `SELECT rp.user_id AS user_id, rp.username AS username, rp.ready AS ready FROM room_players rp
      WHERE rp.room_id = ? ORDER BY rp.user_id ASC`,
    roomId
  );
  return rows ?? [];
}

export async function getRoomSnapshotByCode(
  db: Database,
  code: string
): Promise<{
  code: string;
  status: RoomRow['status'];
  players: Array<{ userId: number; username: string; ready: 0 | 1 }>;
} | null> {
  const room = await loadRoomByCode(db, code);
  if (!room) return null;

  const players = await loadPlayers(db, room.id);
  return {
    code: room.code,
    status: room.status,
    players: players.map((p) => ({
      userId: Number(p.user_id),
      username: String(p.username),
      ready: (Number(p.ready) ? 1 : 0) as 0 | 1,
    })),
  };
}