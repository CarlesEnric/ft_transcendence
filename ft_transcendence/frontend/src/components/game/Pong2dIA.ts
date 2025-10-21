import { navigateTo } from '../../core/router';
import { renderFooter, initFooter } from '../global/Footer';
import i18n from '../../core/i18n';
import { createResponsivePongCanvas } from './pongCanvasUtils';
import { getState } from '../../core/state';
import { showGameEndedButtons } from './GameEndedButtons';
import { createScoreUpdater, getWinnerFromDOM } from './ScoreUpdater';
import { renderGameLayout } from './GameLayouts';
import { PongPhysics } from './PongPhysics';
import { saveMatchHistory } from '../../inlineRegistered/RegisteredTournamentService';

const GOALS_TO_WIN = 5;
const AI_USER_ID = 999999;
const AI_NAME = 'AI';

const getWinner = (): 'player1' | 'player2' | null => {
  return getWinnerFromDOM(GOALS_TO_WIN);
};

// Helper function to generate avatar from username (deterministic)
const getAvatarFromUsername = (username: string): string => {
  if (!username) return 'avatar1.png';
  // Hash the username to get a consistent avatar number (1-4)
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const avatarNum = (Math.abs(hash) % 4) + 1; // Returns 1-4
  return `/images/avatar${avatarNum}.png`;
};

// Normalize avatar URL (supports google URLs, absolute paths, or local filenames)
const resolveAvatarURL = (src?: string): string => {
  if (!src) return '';
  const s = String(src).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
  return `/images/${s}`;
};

// Helper functions for layout rendering (reusable components)
interface IAPlayer {
  username: string;
  avatar_url?: string;
  avatar?: string;
}

// Wrappers locals per Pong2dIA
const renderIAGameLayout = (player: IAPlayer, aiName: string): string => {
  const p1 = { ...player, avatar_url: resolveAvatarURL(player.avatar_url || player.avatar) };
  const p2 = { username: aiName, avatar: getAvatarFromUsername(aiName), avatar_url: getAvatarFromUsername(aiName) } as IAPlayer;
  return renderGameLayout(p1, p2, true);
};

let engine: PongPhysics | null = null;

// Initialize Pong 2D game with AI
export function initPong2dIA(canvas: HTMLCanvasElement, onScoreUpdate?: (playerScore: number, aiScore: number) => void): void {
  // Cleanup any existing engine
  if (engine) {
    engine.stop();
    engine = null;
  }

  // Create engine with AI config
  engine = new PongPhysics({
    gameMode: 'ai',
    canvas,
    goalsToWin: GOALS_TO_WIN,
    onScoreUpdate,
  });

  // Enable mouse control for AI mode
  engine.setMouseControl(true);

  // Start the game
  engine.start();
}

// Stop the game
export function stopPong2dIA(): void {
  if (engine) {
    engine.stop();
    engine = null;
  }
}

/**
 * Main render function for Pong2dIA component
 * Creates full game UI with player card, AI card, canvas, and controls
 */
export const renderPong2dIA = async (): Promise<void> => {
  const rawUser = getState().user;
  const currentUser = rawUser && typeof rawUser.id === 'number' ? rawUser : { id: -1, username: '', avatar_url: '' };
  const app = document.getElementById('app')!;
  const aiName = 'IA';
  let gameStarted = false;

  function renderIAGame() {
    // Use component-based rendering
    app.innerHTML = `
      <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">
          <!-- Game Status -->
          <div id="gameStatus" class="text-cyan-400 text-lg sm:text-2xl font-bold text-center min-h-[30px]">Playing...</div>
          
          <!-- Scoreboard -->
          <div class="w-full flex justify-center mb-0 sm:mb-2">
            <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
              <div class="flex items-center gap-4 sm:gap-8 text-white">
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${currentUser.username || 'Player'}</div>
                  <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
                <div class="text-lg sm:text-2xl text-gray-400">:</div>
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${aiName}</div>
                  <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Game Layout with components -->
          <div class="w-full flex justify-center">
            ${renderIAGameLayout(currentUser, aiName)}
          </div>
          
          <!-- Action Buttons -->
          <div class="w-full max-w-[540px] flex gap-3 mt-4">
            <button id="playAgain" class="flex-1 h-14 bg-cyan-700 hover:bg-cyan-800 
                        rounded-lg justify-center items-center transition-colors hidden">
              <div class="text-white text-lg font-bold">PLAY AGAIN</div>
            </button>
            <button id="homeBtn" class="flex-1 h-14 bg-cyan-200 hover:bg-cyan-300 
                                      rounded-lg justify-center items-center transition-colors hidden">
              <div class="text-teal-800 text-lg font-bold">HOME</div>
            </button>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const pongContainer = document.getElementById('pongContainer');
      if (pongContainer) {
        pongContainer.innerHTML = '';
        const canvas = createResponsivePongCanvas(pongContainer);
        initPong2dIA(canvas, updateScore);
      }
    }, 0);

    // Bind event listeners for action buttons
    document.getElementById('playAgain')?.addEventListener('click', () => {
      stopPong2dIA();
      renderPong2dIA();
    });
    document.getElementById('homeBtn')?.addEventListener('click', () => {
      stopPong2dIA();
      navigateTo('/dashboard');
    });
  }

  gameStarted = true;
  renderIAGame();
};

export const updateScore = createScoreUpdater({
  goalsToWin: GOALS_TO_WIN,
  onGameEnded: async () => {
    showGameEndedButtons({ getWinner });
    try {
      const s1 = Number.parseInt(document.getElementById('player1Score')?.textContent || '0', 10);
      const s2 = Number.parseInt(document.getElementById('player2Score')?.textContent || '0', 10);
      const me = (getState() as any)?.user;
      if (!me?.id) {
        console.warn('[IA] Missing me.id; skip persisting match');
        return;
      }
      await saveMatchHistory({
        player1Id: Number(me.id),
        player2Id: AI_USER_ID,
        player1Name: String(me.username || 'Player'),
        player2Name: AI_NAME,
        score1: s1,
        score2: s2,
        mode: 'inline-1vAI',
        played_at: new Date().toISOString(),
        tournament_id: null
      });
    } catch (e) {
      console.warn('[IA] Persist failed:', e);
    }
  },
});