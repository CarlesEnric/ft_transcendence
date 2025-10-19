import { EventEmitter } from 'node:events';

type RoomEvent =
  | { type: 'joined'; code: string; userId: number; username: string }
  | { type: 'ready'; code: string; userId: number; ready: boolean }
  | { type: 'status'; code: string; status: 'waiting' | 'in_progress' | 'finished' | 'cancelled' }
  | { type: 'left'; code: string; userId: number }
  | { type: 'finished'; code: string; score1: number; score2: number; winnerUserId: number };

type TournamentStatus = 'planned' | 'open' | 'in_progress' | 'finished' | 'cancelled' | 'waiting';

type UserEvent =
  | { type: 'room_update'; code: string }
  | { type: 'match_created' }
  | { type: 'match_finished'; code: string }
  | { type: 'room_invite' }
  | { type: 'tournament_status'; id: number; status: TournamentStatus }
  | { type: 'tournament_joined'; id: number; userId: number }
  | { type: 'tournament_left'; id: number; userId: number }
  | { type: 'tournament_bracket_update'; id: number; matchId: number };

class SseBus {
  private rooms = new Map<string, EventEmitter>();
  private users = new Map<number, EventEmitter>();

  room(code: string): EventEmitter {
    let ee = this.rooms.get(code);
    if (!ee) {
      ee = new EventEmitter();
      this.rooms.set(code, ee);
    }
    return ee;
  }

  user(userId: number): EventEmitter {
    let ee = this.users.get(userId);
    if (!ee) {
      ee = new EventEmitter();
      this.users.set(userId, ee);
    }
    return ee;
  }

  emitRoom(code: string, ev: RoomEvent): void {
    this.room(code).emit('event', ev);
  }

  emitUser(userId: number, ev: UserEvent): void {
    this.user(userId).emit('event', ev);
  }
}

export const sseBus = new SseBus();
export type { RoomEvent, UserEvent, TournamentStatus };
export { SseBus };