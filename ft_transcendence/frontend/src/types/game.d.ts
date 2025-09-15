export interface GameState {
    ball: {
      x: number;
      z: number;
      velocityX: number;
      velocityZ: number;
    };
    paddles: {
      left: number;
      right: number;
    };
    score: {
      left: number;
      right: number;
    };
  }
  
  export interface GameMessage {
    type: 'move' | 'start' | 'pause' | 'reset';
    player?: 'left' | 'right';
    direction?: 'up' | 'down';
    data?: any;
  }