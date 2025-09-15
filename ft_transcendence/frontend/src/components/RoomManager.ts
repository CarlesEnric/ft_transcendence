// RoomManager.ts
// Gestiona sales de joc (rooms) per a partides multiplayer de Pong

export interface Room {
  id: string;
  players: string[]; // user IDs or names
  state: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /**
   * Crea una nova sala i retorna el seu ID
   */
  public createRoom(playerId: string): Room {
    const id = this.generateRoomId();
    const room: Room = {
      id,
      players: [playerId],
      state: 'waiting',
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return room;
  }

  /**
   * Uneix un jugador a una sala existent
   */
  public joinRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= 2 || room.state !== 'waiting') return false;
    room.players.push(playerId);
    room.state = 'playing';
    return true;
  }

  /**
   * Obté una sala per ID
   */
  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Elimina una sala
   */
  public removeRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  /**
   * Llista totes les sales actives
   */
  public listRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Genera un ID únic per a la sala
   */
  private generateRoomId(): string {
    return Math.random().toString(36).substr(2, 8);
  }
}
