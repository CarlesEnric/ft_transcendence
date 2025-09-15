import { renderFooter } from '../components/global/Footer(A)';
import { renderHeaderCard, initHeaderCard } from '../components/dashboard/HeaderCard';
import { renderRankingCard, initRankingCard } from '../components/dashboard/RankingCard';
import { renderMatchHistoryCard, initMatchHistoryCard } from '../components/dashboard/MatchHistory';
import { renderDebugPanel, initDebugPanel } from '../components/global/DebugPanel';
import { API_CONFIG } from '../config/api';

export const renderHomePage = (): void => {
  const app = document.getElementById('root')!;

  // Utilitzem la configuració API

  app.innerHTML = `
    <div class="min-h-screen global-bg flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-white/5">
        <div class="w-full min-w-[320px] max-w-[1200px] px-6 py-8 flex flex-col gap-10 items-center justify-center">
            <!-- Debug Info -->
            <div class="bg-gray-800 text-white p-4 rounded-lg mb-4 w-full">
                <h3 class="font-bold">DEBUG INFO:</h3>
                <p>HOST_IP: ${API_CONFIG.HOST_IP}</p>
                <p>GOOGLE_URL: ${API_CONFIG.AUTH.GOOGLE}</p>
                <p>AUTH_2FA_STATUS: ${API_CONFIG.AUTH.TWO_FA.STATUS}</p>
                <p>GAME_WS: ${API_CONFIG.GAME.WS}</p>
            </div>
            <!-- Header Card -->
            ${renderHeaderCard()}
    
            <!-- Pong Preview -->
            <div class="w-full">
              <div id="pongContainer" class="w-full h-[300px] bg-gray-900 rounded-xl shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-1 outline-cyan-500 flex items-center justify-center">
                <div class="text-center">
                  <h3 class="text-xl font-semibold text-white mb-4">Quick Game</h3>
                  <button id="startPongBtn" class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Start Game
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Segunda fila: Ranking (izq) + Match History (der) -->
            <div class="w-full flex flex-col lg:flex-row gap-10">
                ${renderRankingCard()}
                ${renderMatchHistoryCard()}
            </div>
            <!-- ✅ Footer -->
            <div class="w-full flex justify-center">
                ${renderFooter()}
            </div>
        </div>
        
        <!-- Debug Panel - per ajuda en el desenvolupament -->
        ${renderDebugPanel()}
    </div>
  `;

  // Inicializadores
  initHeaderCard();
  initRankingCard();
  initMatchHistoryCard();
  initDebugPanel();
  
  // Inicializar el botón del juego Pong
  document.getElementById('startPongBtn')?.addEventListener('click', () => {
    const pongContainer = document.getElementById('pongContainer');
    if (!pongContainer) return;
    
    // Clear container and prepare for game
    pongContainer.innerHTML = '';
    pongContainer.style.position = 'relative';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = pongContainer.clientWidth;
    canvas.height = pongContainer.clientHeight;
    canvas.style.display = 'block';
    pongContainer.appendChild(canvas);
    
    // Initialize simple Pong game
    initSimplePongGame(canvas);
  });
};

// Simple Pong implementation
function initSimplePongGame(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  
  // Game state
  const state = {
    ballX: canvas.width / 2,
    ballY: canvas.height / 2,
    ballRadius: 10,
    ballSpeedX: 5,
    ballSpeedY: 3,
    paddleHeight: 80,
    paddleWidth: 10,
    leftPaddleY: canvas.height / 2 - 40,
    rightPaddleY: canvas.height / 2 - 40,
    playerScore: 0,
    aiScore: 0,
    gameRunning: true
  };
  
  // Control handler
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    state.leftPaddleY = Math.min(
      canvas.height - state.paddleHeight, 
      Math.max(0, mouseY - state.paddleHeight / 2)
    );
  });
  
  // Simple AI
  function updateAI() {
    const paddleCenter = state.rightPaddleY + state.paddleHeight / 2;
    const diff = state.ballY - paddleCenter;
    // Adjust AI paddle position with some delay to make it beatable
    if (Math.abs(diff) > 5) {
      state.rightPaddleY += diff > 0 ? 4 : -4;
    }
    state.rightPaddleY = Math.min(
      canvas.height - state.paddleHeight, 
      Math.max(0, state.rightPaddleY)
    );
  }
  
  // Game loop
  function gameLoop() {
    if (!state.gameRunning) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw scores
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(state.playerScore.toString(), canvas.width / 4, 30);
    ctx.fillText(state.aiScore.toString(), (canvas.width / 4) * 3, 30);
    
    // Draw paddles
    ctx.fillStyle = '#38b2ac';
    ctx.fillRect(0, state.leftPaddleY, state.paddleWidth, state.paddleHeight);
    ctx.fillRect(
      canvas.width - state.paddleWidth, 
      state.rightPaddleY, 
      state.paddleWidth, 
      state.paddleHeight
    );
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f6ad55';
    ctx.fill();
    ctx.closePath();
    
    // Update ball position
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;
    
    // Wall collision (top/bottom)
    if (state.ballY - state.ballRadius < 0 || 
        state.ballY + state.ballRadius > canvas.height) {
      state.ballSpeedY = -state.ballSpeedY;
    }
    
    // Paddle collision
    if (state.ballX - state.ballRadius < state.paddleWidth && 
        state.ballY > state.leftPaddleY && 
        state.ballY < state.leftPaddleY + state.paddleHeight) {
      state.ballSpeedX = -state.ballSpeedX;
      // Add some angle based on where the ball hit the paddle
      const hitPos = (state.ballY - state.leftPaddleY) / state.paddleHeight - 0.5;
      state.ballSpeedY = hitPos * 10;
    }
    
    if (state.ballX + state.ballRadius > canvas.width - state.paddleWidth && 
        state.ballY > state.rightPaddleY && 
        state.ballY < state.rightPaddleY + state.paddleHeight) {
      state.ballSpeedX = -state.ballSpeedX;
      // Add some angle based on where the ball hit the paddle
      const hitPos = (state.ballY - state.rightPaddleY) / state.paddleHeight - 0.5;
      state.ballSpeedY = hitPos * 10;
    }
    
    // Score
    if (state.ballX < 0) {
      state.aiScore++;
      resetBall();
    } else if (state.ballX > canvas.width) {
      state.playerScore++;
      resetBall();
    }
    
    // Update AI
    updateAI();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
  }
  
  // Reset ball to center
  function resetBall() {
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    state.ballSpeedX = -state.ballSpeedX;
    state.ballSpeedY = Math.random() * 6 - 3;
  }
  
  // Start game loop
  gameLoop();
};