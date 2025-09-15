import { navigateTo } from '../../core/router';
import { getState } from '../../core/state';
import { initPongGame } from '../game/Pong';
import { renderFooter, initFooter } from '../global/Footer(A)';
import i18n from '../../core/i18n';

export const renderDemoGameRoom = (): void => {
  const app = document.getElementById('root')!;
  const state = getState();
  const user = state.user;

  // Verificar si es usuario demo
  if (!user?.isDemoUser) {
    navigateTo('/');
    return;
  }

  const timeLeft = calculateTimeLeft(user);
  
  if (timeLeft <= 0) {
    renderDemoExpired();
    return;
  }

  app.innerHTML = `
    <!-- CAMBIO: Nuevo layout flexbox vertical más responsive -->
    <div class="min-h-screen global-bg p-4 relative flex flex-col">
      
      <!-- CAMBIO: Centro reorganizado - Solo juego y controles, más centrado -->
      <div class="flex-1 flex flex-col items-center justify-center gap-4">
        <!-- CAMBIO: Timer más pequeño y responsive -->
        <div id="timer" class="text-white text-sm sm:text-base font-medium">
          ${i18n.t('game.timeLeft') || 'Time left'}: ${formatTime(timeLeft)}
        </div>
        
            <!-- CAMBIO: Header reorganizado - Player 1 (izq) + Exit (der) en lugar del centro -->
      <div class="w-full flex justify-between items-start mb-4">
        
        <!-- CAMBIO: Player 1 movido arriba izquierda, más compacto y responsive -->
           <div class="p-3 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] 
                    outline outline-2 outline-offset-[-2px] outline-teal-600 flex flex-col gap-2.5">
          <div class="flex flex-col items-start">
            <!-- CAMBIO: Avatar más pequeño y responsive (w-28 sm:w-36) -->
            <div class="w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)] 
                        bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <div class="text-white text-4xl sm:text-6xl font-bold">👤</div>
            </div>
            <!-- CAMBIO: Info más compacta sin self-stretch innecesario -->
            <div class="mt-2 flex flex-col gap-2">
              <div class="px-3 py-2 bg-teal-600 rounded-lg text-white text-sm sm:text-base font-semibold">
                ${i18n.t('game.player1') || 'Player 1'}
              </div>
              <div class="px-3 py-2 bg-blue-300 rounded-lg text-gray-950 text-sm sm:text-base font-medium">
                ${i18n.t('game.demoLevel') || 'Demo Level'}
              </div>
            </div>
          </div>
        </div>

        <!-- NUEVO: Botón Exit movido arriba derecha, más simple y accesible -->
        <div class="flex flex-col items-center">
          <button id="exitDemo" class="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 hover:bg-cyan-200 
                                      rounded-full flex items-center justify-center transition-colors">
            <svg class="w-6 h-6 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
          <div class="mt-1 text-white text-sm sm:text-base font-medium">
            ${i18n.t('game.exit') || 'Exit'}
          </div>
        </div>
      </div>
        
        <!-- CAMBIO: Container responsive con aspect-ratio en lugar de dimensiones fijas -->
        <div class="w-full max-w-[998px] aspect-[16/10] bg-gray-950 rounded-[20px] overflow-hidden">
          <div id="pongContainer" class="w-full h-full">
            <!-- El juego Pong se inicializará aquí -->
          </div>
        </div>
        <div class="w-full flex justify-end mt-4">
          <div class="p-3 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] 
                    outline outline-2 outline-offset-[-2px] outline-cyan-950 flex flex-col gap-2.5">
          <div class="flex flex-col items-end">
            <!-- CAMBIO: Orden invertido - primero level, luego name, luego avatar -->
            <div class="px-3 py-2 bg-blue-300 rounded-lg text-gray-950 text-sm sm:text-base font-medium mb-2">
              ${i18n.t('game.easyLevel') || 'Easy Level'}
            </div>
            <div class="px-3 py-2 bg-teal-600 rounded-lg text-white text-sm sm:text-base font-semibold mb-2">
              ${i18n.t('game.aiOpponent') || 'AI Opponent'}
            </div>
            <!-- CAMBIO: Avatar responsive y al final -->
            <div class="w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)] 
                        bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
              <div class="text-white text-4xl sm:text-6xl font-bold">🤖</div>
            </div>
          </div>
        </div>
      </div>

        <!-- CAMBIO: Botones más simples, menos padding vertical -->
        <div class="w-full max-w-[540px] flex gap-3">
          <button id="playAgain" class="flex-1 h-14 px-6 py-3 bg-cyan-700 hover:bg-cyan-800 
                                       rounded-lg flex justify-center items-center transition-colors">
            <div class="text-white text-lg font-bold">${i18n.t('game.playAgain') || 'PLAY AGAIN'}</div>
          </button>
          <button id="loginBtn" class="flex-1 h-14 px-6 py-3 bg-cyan-200 hover:bg-cyan-300 
                                      rounded-lg flex justify-center items-center transition-colors">
            <div class="text-teal-800 text-lg font-bold">${i18n.t('game.login') || 'LOGIN'}</div>
          </button>
        </div>
      </div>

      <!-- NUEVO: Player 2 movido abajo derecha con orden invertido (level → name → avatar) -->
     

      <!-- CAMBIO: Footer simplificado sin padding extra -->
      <div class="mt-4">
        ${renderFooter()}
      </div>
    </div>
  `;

  // Initialize components
  initFooter();

  // Inicializar el juego
  initPongGame();

  // Inicializar timer
  startDemoTimer(user);

  // Event listeners
  document.getElementById('exitDemo')?.addEventListener('click', () => {
    endDemo();
  });

  document.getElementById('playAgain')?.addEventListener('click', () => {
    // Reiniciar el juego
    if (confirm(i18n.t('game.restartConfirm') || 'Are you sure you want to restart the game?')) {
      initPongGame();
    }
  });

  document.getElementById('loginBtn')?.addEventListener('click', () => {
    navigateTo('/login');
  });
};

// CAMBIO: Funciones auxiliares mantienen la misma lógica de cálculo de tiempo
const calculateTimeLeft = (user: any): number => {
  const elapsed = Date.now() - user.demoStartTime;
  return Math.max(0, user.demoTimeLimit - elapsed);
};

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const startDemoTimer = (user: any): void => {
  const timerInterval = setInterval(() => {
    const timeLeft = calculateTimeLeft(user);
    const timerElement = document.getElementById('timer');
    
    if (timerElement) {
      timerElement.innerHTML = `${i18n.t('game.timeLeft') || 'Time left'}: ${formatTime(timeLeft)}`;

      // 🔄 CAMBIO: Timer cambia a rojo cuando quedan 30 segundos
      if (timeLeft <= 30000) { // 30 segundos
        timerElement.className = 'text-center text-red-400 text-sm sm:text-base font-medium animate-pulse';
      }
    }
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      renderDemoExpired();
    }
  }, 1000);

  // Limpiar interval si se cambia de página
  window.addEventListener('beforeunload', () => {
    clearInterval(timerInterval);
  });
};

// 🔄 CAMBIO: renderDemoExpired mantiene la misma funcionalidad
const renderDemoExpired = (): void => {
  const app = document.getElementById('root')!;
  
  app.innerHTML = `
    <!-- Demo Expired Screen -->
    <div class="min-h-screen global-bg p-6 flex items-center justify-center">
      <div class="w-full max-w-[600px] p-8 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-blue-300 flex flex-col items-center text-center">
        
        <!-- Icon -->
        <div class="text-8xl mb-6">⏰</div>
        
        <!-- Title -->
        <h1 class="text-4xl font-bold text-white mb-4 font-['Inter']">
          ${i18n.t('demo.expired') || 'Demo Time Expired!'}
        </h1>
        
        <!-- Description -->
        <p class="text-gray-400 text-lg mb-8 font-['Inter'] leading-relaxed">
          ${i18n.t('demo.expiredMessage') || 'Hope you enjoyed the Pong demo! To continue playing and access all features, register for a free account or log in.'}
        </p>
        
        <!-- Action Buttons -->
        <div class="w-full flex gap-4 mb-6">
          <button id="playAgainDemo" class="flex-1 h-14 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex flex-col justify-center items-center transition-colors">
            <div class="text-white text-lg font-bold font-['Inter']">${i18n.t('demo.playAgain') || '🎮 Play Again'}</div>
            <div class="text-green-200 text-sm font-['Inter']">${i18n.t('demo.twoMinutes') || '(2 min)'}</div>
          </button>
          
          <button id="registerNow" class="flex-1 h-14 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex flex-col justify-center items-center transition-colors">
            <div class="text-white text-lg font-bold font-['Inter']">${i18n.t('demo.registerFree') || '🚀 Register Free'}</div>
            <div class="text-purple-200 text-sm font-['Inter']">${i18n.t('demo.unlimited') || '(Unlimited)'}</div>
          </button>
          
          <button id="loginNow" class="flex-1 h-14 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex flex-col justify-center items-center transition-colors">
            <div class="text-white text-lg font-bold font-['Inter']">${i18n.t('demo.login') || '🔑 Login'}</div>
            <div class="text-blue-200 text-sm font-['Inter']">${i18n.t('demo.existingUser') || '(Existing User)'}</div>
          </button>
        </div>
        
        <!-- Back Home -->
        <button id="backHome" class="text-gray-400 hover:text-gray-300 font-['Inter'] transition-colors">
          ${i18n.t('demo.backToHome') || '← Back to Home'}
        </button>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('playAgainDemo')?.addEventListener('click', () => {
    navigateTo('/');
  });

  document.getElementById('registerNow')?.addEventListener('click', () => {
    navigateTo('/register');
  });

  document.getElementById('loginNow')?.addEventListener('click', () => {
    navigateTo('/login');
  });

  document.getElementById('backHome')?.addEventListener('click', () => {
    navigateTo('/');
  });
};

const endDemo = (): void => {
  if (confirm(i18n.t('demo.endConfirm') || 'Are you sure you want to end the demo?')) {
    renderDemoExpired();
  }
};