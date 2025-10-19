import { PongPhysics } from './PongPhysics';

export interface PongPlayerInfo {
  name: string;
  avatar?: string;
}

let engine: PongPhysics | null = null;

export function initPong2dPvP(
  canvas: HTMLCanvasElement,
  onScoreUpdate?: (p1: number, p2: number) => void,
  player1?: PongPlayerInfo,
  player2?: PongPlayerInfo
): void {
  // Cleanup any existing engine
  if (engine) {
    engine.stop();
    engine = null;
  }

  // Create engine with PvP config
  engine = new PongPhysics({
    gameMode: 'pvp',
    canvas,
    goalsToWin: 5,
    onScoreUpdate,
  });

  // Start the game
  engine.start();
}