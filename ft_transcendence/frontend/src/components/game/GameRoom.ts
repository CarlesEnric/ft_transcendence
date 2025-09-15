import { navigateTo } from '../../core/router';
import { getState } from '../../core/state';
import { initPongGame } from './Pong';

export const renderGameRoom = (): void => {
  const app = document.getElementById('root')!;
  const state = getState();
  
  const themeClasses = state.theme === 'dark'
    ? 'min-h-screen bg-gray-900 text-white'
    : 'min-h-screen bg-gray-100 text-gray-900';

  app.innerHTML = `
    <div class="${themeClasses}">
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-green-400">🕹️ Pong Game</h1>
          <button id="home" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors text-white">
            ← Back to Home
          </button>
        </div>
        <div id="pongContainer"></div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('home')?.addEventListener('click', () => {
    navigateTo('/home');
  });
  // Inicializar el juego Pong
  initPongGame();
};