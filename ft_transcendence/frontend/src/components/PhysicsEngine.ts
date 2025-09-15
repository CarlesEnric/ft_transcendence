// PhysicsEngine.ts
// Motor de física bàsic per a Pong, modular i fàcil d'integrar

export interface Vector2 {
  x: number;
  y: number;
}

export interface BallState {
  position: Vector2;
  velocity: Vector2;
  radius: number;
}

export interface PaddleState {
  position: number; // només z (vertical)
  height: number;
  width: number;
}

export interface GamePhysicsState {
  ball: BallState;
  paddles: {
    left: PaddleState;
    right: PaddleState;
  };
  bounds: {
    width: number;
    height: number;
  };
}

export class PhysicsEngine {
  private state: GamePhysicsState;

  constructor(initialState: GamePhysicsState) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  /**
   * Actualitza la física del joc (una iteració)
   */
  /**
   * Retorna 'left' o 'right' si la pilota ha sortit per un lateral, null si no
   */
  public update(dt: number): 'left' | 'right' | null {
    // Mou la pilota
    this.state.ball.position.x += this.state.ball.velocity.x * dt;
    this.state.ball.position.y += this.state.ball.velocity.y * dt;
    // Col·lisions amb parets (només dalt/baix)
    this.handleWallCollisions();
    // Col·lisions amb pales (placeholder)
    this.handlePaddleCollisions();
    // Detecció de sortida per lateral
    const { ball, bounds } = this.state;
    if (ball.position.x - ball.radius < 0) {
      return 'left'; // punt per la dreta
    }
    if (ball.position.x + ball.radius > bounds.width) {
      return 'right'; // punt per l'esquerra
    }
    return null;
  }

  private handleWallCollisions(): void {
    const { ball, bounds } = this.state;
    // Top
    if (ball.position.y - ball.radius < 0) {
      ball.position.y = ball.radius;
      ball.velocity.y *= -1;
    }
    // Bottom
    if (ball.position.y + ball.radius > bounds.height) {
      ball.position.y = bounds.height - ball.radius;
      ball.velocity.y *= -1;
    }
  }

  private handlePaddleCollisions(): void {
    // Placeholder: aquí s'implementaria la col·lisió amb les pales
    // (es pot millorar incrementalment)
  }

  public getState(): GamePhysicsState {
    return JSON.parse(JSON.stringify(this.state));
  }
}
