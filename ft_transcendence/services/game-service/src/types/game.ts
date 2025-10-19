// Tipus per al joc Pong Online

export interface GameState {
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    radius: number;
  };
  paddles: {
    left: number;
    right: number;
    width: number;
    height: number;
  };
  score: {
    left: number;
    right: number;
  };
}

export interface GameMessage {
  type: 'move' | 'ready' | 'start' | 'sync' | 'game_start' | 'game_state' | 'score' | 'end' | 'game_end' | 'join' | 'gameUpdate' | 'welcome' | 'joined' | 'readyConfirmed' | 'gameUpdateReceived' | 'error' | 'game_restart' | 'restart' | 'restart_requested' | 'room_deleted' | 'abandon' | 'role_assigned';
  direction?: 'up' | 'down';
  state?: any;
  data?: any;
  player1?: number;
  player2?: number;
  room?: string;
  userId?: number | string;
  message?: string;
  paddle?: { y: number; side: string };
  winner?: 'left' | 'right';
  reason?: 'normal' | 'opponent_disconnected' | 'opponent_abandoned';
  pending?: number;
  role?: 'left' | 'right';
}