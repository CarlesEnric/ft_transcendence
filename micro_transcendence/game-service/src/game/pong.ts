import WebSocket from 'ws';

interface Player {
  ws: WebSocket;
  y: number;
  score: number;
}

interface GameState {
  paddle1: Player;
  paddle2: Player;
  ball: { x: number; y: number; vx: number; vy: number };
}

export class PongGame {
  players: Player[] = [];
  state: GameState;
  interval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      paddle1: { ws: null as any, y: 0, score: 0 },
      paddle2: { ws: null as any, y: 0, score: 0 },
      ball: { x: 0, y: 0, vx: 0.05, vy: 0.03 }
    };
  }

  addPlayer(ws: WebSocket) {
    if (!this.state.paddle1.ws) {
      this.state.paddle1.ws = ws;
      this.players[0] = this.state.paddle1;
      ws.send(JSON.stringify({ type: 'welcome', player: 1 }));
    } else if (!this.state.paddle2.ws) {
      this.state.paddle2.ws = ws;
      this.players[1] = this.state.paddle2;
      ws.send(JSON.stringify({ type: 'welcome', player: 2 }));
      this.start();
    }
  }

  removePlayer(ws: WebSocket) {
    if (this.state.paddle1.ws === ws) this.state.paddle1.ws = null as any;
    if (this.state.paddle2.ws === ws) this.state.paddle2.ws = null as any;
    if (this.interval) clearInterval(this.interval);
  }

  handleMessage(ws: WebSocket, msg: any) {
    if (msg.type === 'move') {
      if (ws === this.state.paddle1.ws) {
        this.state.paddle1.y += msg.direction === 'up' ? 0.1 : -0.1;
        // Limitació de moviment de la paleta
        // this.state.paddle1.y = Math.min(Math.max(this.state.paddle1.y, -maxY), maxY);

      } else if (ws === this.state.paddle2.ws) {
        this.state.paddle2.y += msg.direction === 'up' ? 0.1 : -0.1;
      }
    }
  }

  start() {
    this.interval = setInterval(() => this.tick(), 16);
  }

  tick() {
    // Mou la pilota
    const ball = this.state.ball;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Rebota a dalt/baix
    if (ball.y > 2.5 || ball.y < -2.5) ball.vy *= -1;

    // Rebota amb paletes
    if (
      (ball.x < -1.8 && Math.abs(ball.y - this.state.paddle1.y) < 0.6) ||
      (ball.x > 1.8 && Math.abs(ball.y - this.state.paddle2.y) < 0.6)
    ) {
      ball.vx *= -1;
    }

    // Punt
    if (ball.x < -2) {
      this.state.paddle2.score++;
      ball.x = 0; ball.y = 0; ball.vx = 0.05; ball.vy = 0.03;
    }
    if (ball.x > 2) {
      this.state.paddle1.score++;
      ball.x = 0; ball.y = 0; ball.vx = -0.05; ball.vy = 0.03;
    }

    // Envia estat a tots dos jugadors
    [this.state.paddle1, this.state.paddle2].forEach(p => {
      if (p.ws && p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(JSON.stringify({
          type: 'state',
          paddle1: { y: this.state.paddle1.y, score: this.state.paddle1.score },
          paddle2: { y: this.state.paddle2.y, score: this.state.paddle2.score },
          ball: { x: ball.x, y: ball.y }
        }));
      }
    });
  }
}