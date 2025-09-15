// ✅ PongPreview.ts (versión completamente limpia - sin efectos)
export class PongPreview {
  private container: HTMLElement | null = null;
  private ball: HTMLElement | null = null;
  private paddleLeft: HTMLElement | null = null;
  private paddleRight: HTMLElement | null = null;

  private ballX = 200;
  private ballY = 200;
  private ballSpeedX = 3;
  private ballSpeedY = 2;

  private paddleHeight = 80;
  private paddleLeftY = 150;
  private paddleRightY = 150;

  private animationId: number | null = null;

  private fps = 30;
  private fpsInterval = 1000 / this.fps;
  private lastTime = 0;

  private paddleWidth = 12;
  private ballRadius = 8;
  private containerWidth = 0;
  private containerHeight = 0;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container with id '${containerId}' not found`);
    this.container = container;

    this.container.innerHTML = '';

    this.container.className =
      "w-full max-w-[1000px] mx-auto h-[300px] sm:h-[400px] lg:h-[468px] relative bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_rgba(0,240,255,0.20)] outline outline-2 outline-blue-300 overflow-hidden";

    this.createElements();
    this.updateContainerDimensions();
    window.addEventListener('resize', this.updateContainerDimensions);

    this.resetBall();
    this.updatePositions();
    this.start();
  }

  private createElements() {
    if (!this.container) return;

    // ✅ Ball SIN trail ni glow - completamente limpia
    this.ball = document.createElement("div");
    this.ball.className = "absolute bg-pink-500 rounded-full";
    this.ball.style.width = `${this.ballRadius * 2}px`;
    this.ball.style.height = `${this.ballRadius * 2}px`;
    this.container.appendChild(this.ball);

    // ✅ Left paddle - limpia
    this.paddleLeft = document.createElement("div");
    this.paddleLeft.className = "absolute bg-cyan-200 rounded-sm transition-all duration-200";
    this.paddleLeft.style.width = `${this.paddleWidth}px`;
    this.paddleLeft.style.height = `${this.paddleHeight}px`;
    this.container.appendChild(this.paddleLeft);

    // ✅ Right paddle - limpia
    this.paddleRight = document.createElement("div");
    this.paddleRight.className = "absolute bg-yellow-500 rounded-sm transition-all duration-200";
    this.paddleRight.style.width = `${this.paddleWidth}px`;
    this.paddleRight.style.height = `${this.paddleHeight}px`;
    this.container.appendChild(this.paddleRight);

    // ✅ Center line
    const centerLine = document.createElement("div");
    centerLine.className =
      "absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-400 opacity-50 transform -translate-x-1/2";
    this.container.appendChild(centerLine);
  }

  private updateContainerDimensions = () => {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.containerWidth = rect.width;
    this.containerHeight = rect.height;
  };

  private resetBall() {
    this.ballX = this.containerWidth / 2;
    this.ballY = this.containerHeight / 2;
    this.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 4);
    this.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 4);
  }

  private updatePositions() {
    if (!this.ball || !this.paddleLeft || !this.paddleRight) return;

    // ✅ Pelota - movimiento simple
    this.ball.style.transform = `translate(${this.ballX}px, ${this.ballY}px)`;

    // ✅ Movimiento suave de palas
    if (this.ballSpeedX < 0) {
      const targetY = Math.max(0, Math.min(this.ballY - this.paddleHeight / 2, this.containerHeight - this.paddleHeight));
      this.paddleLeftY += (targetY - this.paddleLeftY) * 0.15;
    } else {
      const targetY = Math.max(0, Math.min(this.ballY - this.paddleHeight / 2, this.containerHeight - this.paddleHeight));
      this.paddleRightY += (targetY - this.paddleRightY) * 0.15;
    }

    this.paddleLeft.style.transform = `translate(10px, ${this.paddleLeftY}px)`;
    this.paddleRight.style.transform = `translate(${this.containerWidth - this.paddleWidth - 10}px, ${this.paddleRightY}px)`;
  }

  private updatePhysics() {
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;
    
    // ✅ Variación aleatoria mínima
    if (Math.random() < 0.005) {
      this.ballSpeedY += (Math.random() - 0.5) * 0.1;
      this.ballSpeedY = Math.max(-4, Math.min(4, this.ballSpeedY));
    }
  }

  private checkCollisions() {
    // ✅ Colisión con paredes superior/inferior
    if (this.ballY <= this.ballRadius || this.ballY >= this.containerHeight - this.ballRadius) {
      this.ballSpeedY *= -1;
      this.ballY = Math.max(this.ballRadius, Math.min(this.ballY, this.containerHeight - this.ballRadius));
    }

    const ballCenterX = this.ballX + this.ballRadius;
    const ballCenterY = this.ballY + this.ballRadius;

    // ✅ Pala izquierda - sin efectos
    if (ballCenterX <= 10 + this.paddleWidth &&
        ballCenterY >= this.paddleLeftY &&
        ballCenterY <= this.paddleLeftY + this.paddleHeight) {
      if (this.ballSpeedX < 0) {
        this.ballSpeedX *= -1;
        this.ballX = 10 + this.paddleWidth;
      }
    }

    // ✅ Pala derecha - sin efectos
    if (ballCenterX >= this.containerWidth - 10 - this.paddleWidth &&
        ballCenterY >= this.paddleRightY &&
        ballCenterY <= this.paddleRightY + this.paddleHeight) {
      if (this.ballSpeedX > 0) {
        this.ballSpeedX *= -1;
        this.ballX = this.containerWidth - 10 - this.paddleWidth - this.ballRadius * 2;
      }
    }

    // ✅ Reset si sale de límites
    if (this.ballX < -20 || this.ballX > this.containerWidth + 20) {
      this.resetBall();
    }
  }

  // ✅ Game loop simple
  private gameLoop = (time: number) => {
    if (!this.lastTime) this.lastTime = time;
    const elapsed = time - this.lastTime;

    if (elapsed > this.fpsInterval) {
      this.lastTime = time - (elapsed % this.fpsInterval);

      this.updatePhysics();
      this.checkCollisions();
      this.updatePositions();
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.animationId) {
      console.log('🎮 Starting Pong preview animation');
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  public stop() {
    if (this.animationId) {
      console.log('⏹️ Stopping Pong preview animation');
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // ✅ Cleanup completo
  public destroy() {
    this.stop();
    
    window.removeEventListener('resize', this.updateContainerDimensions);
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.ball = null;
    this.paddleLeft = null;
    this.paddleRight = null;
    
    console.log('🧹 PongPreview completely destroyed');
  }
}