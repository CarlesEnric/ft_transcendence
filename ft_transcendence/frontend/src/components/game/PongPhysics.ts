export interface PongConfig {
  canvas: HTMLCanvasElement;
  gameMode: 'pvp' | 'ai' | 'online'; // For AI behavior or other specific logic
  onScoreUpdate?: (player1Score: number, player2Score: number) => void;
  onGameEnd?: (winner: 'player1' | 'player2') => void;
  goalsToWin?: number;
}

export interface PongState {
  // Ball
  ballX: number;
  ballY: number;
  ballRadius: number;
  ballSpeedX: number;
  ballSpeedY: number;
  ballMaxSpeed: number;
  
  // Paddles
  paddleHeight: number;
  paddleWidth: number;
  paddlePadding: number; // Distance from wall
  leftPaddleY: number;
  rightPaddleY: number;
  paddleSpeed: number;
  
  // Score
  player1Score: number;
  player2Score: number;
  goalsToWin: number;
  
  // Game
  gameRunning: boolean;
  
  // Input
  keys: Record<string, boolean>;
}

export class PongPhysics {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: PongConfig;
  private state: PongState;
  private animationId: number | null = null;
  private mousePaddleY: number = 0;
  private useMouseControl: boolean = false;

  constructor(config: PongConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.config = config;

    // Initialize state with canvas-responsive values
    this.state = {
      ballX: this.canvas.width / 2,
      ballY: this.canvas.height / 2,
      ballRadius: 8,
      ballSpeedX: 4,
      ballSpeedY: 0,
      ballMaxSpeed: 7,
      
      paddleHeight: Math.min(80, this.canvas.height * 0.2),
      paddleWidth: 10,
      paddlePadding: 5,
      leftPaddleY: this.canvas.height / 2 - 40,
      rightPaddleY: this.canvas.height / 2 - 40,
      paddleSpeed: 4,
      
      player1Score: 0,
      player2Score: 0,
      goalsToWin: config.goalsToWin || 5,
      
      gameRunning: true,
      keys: {},
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.state.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.state.keys[e.key.toLowerCase()] = false;
    });

    // Mouse controls for AI mode
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePaddleY = e.clientY - rect.top - this.state.paddleHeight / 2;
    });
  }

  public setMouseControl(enabled: boolean): void {
    this.useMouseControl = enabled;
  }

  private updatePaddles(): void {
    // LEFT PADDLE CONTROL
    if (this.config.gameMode === 'ai' && this.useMouseControl) {
      // AI mode: mouse controls left paddle (player)
      this.state.leftPaddleY = Math.max(
        0,
        Math.min(
          this.canvas.height - this.state.paddleHeight,
          this.mousePaddleY
        )
      );
    } else if (this.config.gameMode === 'pvp' || this.config.gameMode === 'online') {
      // PvP/Online: W/S keys control left paddle
      if (this.state.keys['w']) {
        this.state.leftPaddleY = Math.max(0, this.state.leftPaddleY - this.state.paddleSpeed);
      }
      if (this.state.keys['s']) {
        this.state.leftPaddleY = Math.min(
          this.canvas.height - this.state.paddleHeight,
          this.state.leftPaddleY + this.state.paddleSpeed
        );
      }
    }

    // RIGHT PADDLE CONTROL
    if (this.config.gameMode === 'ai') {
      // AI mode: right paddle controlled by AI logic (automatic)
      this.updateAIPaddle();
    } else {
      // PvP/Online: Arrow keys control right paddle
      if (this.state.keys['arrowup']) {
        this.state.rightPaddleY = Math.max(0, this.state.rightPaddleY - this.state.paddleSpeed);
      }
      if (this.state.keys['arrowdown']) {
        this.state.rightPaddleY = Math.min(
          this.canvas.height - this.state.paddleHeight,
          this.state.rightPaddleY + this.state.paddleSpeed
        );
      }
    }
  }

  private updateAIPaddle(): void {
    const paddleCenter = this.state.rightPaddleY + this.state.paddleHeight / 2;
    const diff = this.state.ballY - paddleCenter;
    
    // AI reacts to ball position with slight delay (makes it beatable)
    if (Math.abs(diff) > 8) {
      const aiSpeed = this.state.paddleSpeed * 0.9; // Slightly slower than player
      this.state.rightPaddleY += diff > 0 ? aiSpeed : -aiSpeed;
    }

    // Keep AI paddle within bounds
    this.state.rightPaddleY = Math.max(
      0,
      Math.min(this.canvas.height - this.state.paddleHeight, this.state.rightPaddleY)
    );
  }

  private resetBall(): void {
    this.state.ballX = this.canvas.width / 2;
    this.state.ballY = this.canvas.height / 2;
    // Random angle between -45 and 45 degrees
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    this.state.ballSpeedX = Math.cos(angle) * this.state.ballMaxSpeed * (Math.random() > 0.5 ? 1 : -1);
    this.state.ballSpeedY = Math.sin(angle) * this.state.ballMaxSpeed * (Math.random() > 0.5 ? 1 : -1);
  }

  private handleBallPhysics(): void {
    // Update ball position
    this.state.ballX += this.state.ballSpeedX;
    this.state.ballY += this.state.ballSpeedY;

    // Wall collision (top/bottom) with padding to prevent getting stuck
    const topBound = this.state.ballRadius;
    const bottomBound = this.canvas.height - this.state.ballRadius;

    if (this.state.ballY < topBound) {
      this.state.ballY = topBound;
      this.state.ballSpeedY = -this.state.ballSpeedY;
    } else if (this.state.ballY > bottomBound) {
      this.state.ballY = bottomBound;
      this.state.ballSpeedY = -this.state.ballSpeedY;
    }

    // Left paddle collision
    const leftPaddleRight = this.state.paddlePadding + this.state.paddleWidth;
    if (
      this.state.ballX - this.state.ballRadius < leftPaddleRight &&
      this.state.ballX > this.state.paddlePadding &&
      this.state.ballY > this.state.leftPaddleY &&
      this.state.ballY < this.state.leftPaddleY + this.state.paddleHeight
    ) {
      this.state.ballX = leftPaddleRight + this.state.ballRadius; // Prevent ball from getting stuck
      this.state.ballSpeedX = Math.abs(this.state.ballSpeedX); // Ensure ball moves right

      // Add angle based on paddle hit position
      const hitPos = (this.state.ballY - this.state.leftPaddleY) / this.state.paddleHeight - 0.5;
      this.state.ballSpeedY += hitPos * 2;

      // Clamp speed
      const speed = Math.sqrt(this.state.ballSpeedX ** 2 + this.state.ballSpeedY ** 2);
      if (speed > this.state.ballMaxSpeed) {
        this.state.ballSpeedX = (this.state.ballSpeedX / speed) * this.state.ballMaxSpeed;
        this.state.ballSpeedY = (this.state.ballSpeedY / speed) * this.state.ballMaxSpeed;
      }
    }

    // Right paddle collision
    const rightPaddleLeft = this.canvas.width - this.state.paddlePadding - this.state.paddleWidth;
    if (
      this.state.ballX + this.state.ballRadius > rightPaddleLeft &&
      this.state.ballX < this.canvas.width - this.state.paddlePadding &&
      this.state.ballY > this.state.rightPaddleY &&
      this.state.ballY < this.state.rightPaddleY + this.state.paddleHeight
    ) {
      this.state.ballX = rightPaddleLeft - this.state.ballRadius; // Prevent ball from getting stuck
      this.state.ballSpeedX = -Math.abs(this.state.ballSpeedX); // Ensure ball moves left

      // Add angle based on paddle hit position
      const hitPos = (this.state.ballY - this.state.rightPaddleY) / this.state.paddleHeight - 0.5;
      this.state.ballSpeedY += hitPos * 2;

      // Clamp speed
      const speed = Math.sqrt(this.state.ballSpeedX ** 2 + this.state.ballSpeedY ** 2);
      if (speed > this.state.ballMaxSpeed) {
        this.state.ballSpeedX = (this.state.ballSpeedX / speed) * this.state.ballMaxSpeed;
        this.state.ballSpeedY = (this.state.ballSpeedY / speed) * this.state.ballMaxSpeed;
      }
    }

    // Score detection
    if (this.state.ballX < -this.state.ballRadius) {
      this.state.player2Score++;
      this.config.onScoreUpdate?.(this.state.player1Score, this.state.player2Score);
      
      if (this.state.player2Score >= this.state.goalsToWin) {
        this.state.gameRunning = false;
        this.config.onGameEnd?.('player2');
        return;
      }
      this.resetBall();
    } else if (this.state.ballX > this.canvas.width + this.state.ballRadius) {
      this.state.player1Score++;
      this.config.onScoreUpdate?.(this.state.player1Score, this.state.player2Score);
      
      if (this.state.player1Score >= this.state.goalsToWin) {
        this.state.gameRunning = false;
        this.config.onGameEnd?.('player1');
        return;
      }
      this.resetBall();
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a202c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw center line
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 15]);
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.strokeStyle = '#4299e1';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
    this.ctx.fillStyle = '#38b2ac';
    this.ctx.fillRect(
      this.state.paddlePadding,
      this.state.leftPaddleY,
      this.state.paddleWidth,
      this.state.paddleHeight
    );
    this.ctx.fillRect(
      this.canvas.width - this.state.paddlePadding - this.state.paddleWidth,
      this.state.rightPaddleY,
      this.state.paddleWidth,
      this.state.paddleHeight
    );

    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.state.ballX, this.state.ballY, this.state.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#f6ad55';
    this.ctx.fill();
    this.ctx.closePath();
  }

  private gameLoop = (): void => {
    if (!this.state.gameRunning) return;

    this.updatePaddles();
    this.handleBallPhysics();
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    this.state.gameRunning = true;
    this.gameLoop();
  }

  public stop(): void {
    this.state.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public reset(): void {
    this.stop();
    this.state = {
      ...this.state,
      ballX: this.canvas.width / 2,
      ballY: this.canvas.height / 2,
      ballSpeedX: 4,
      ballSpeedY: 0,
      player1Score: 0,
      player2Score: 0,
      leftPaddleY: this.canvas.height / 2 - 40,
      rightPaddleY: this.canvas.height / 2 - 40,
      gameRunning: false,
    };
  }

  public getState(): Readonly<PongState> {
    return { ...this.state };
  }

  public isRunning(): boolean {
    return this.state.gameRunning;
  }
}
