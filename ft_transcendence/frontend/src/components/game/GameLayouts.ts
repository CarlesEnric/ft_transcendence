/**
 * GameLayouts Component
 * Centralized reusable layout renderers for game UI
 * Prevents duplication across DemoGameInline, Pong2dInline, and GameRoom
 */

import { renderPongCanvas } from './PongCanvas';
import { renderPlayerCard } from './PlayerCard';
import { renderDemoPlayerCard } from './DemoPlayerCard';
import i18n from '../../core/i18n';

const GOALS_TO_WIN = 5;

// Helper function to generate default avatar based on username
const getDefaultAvatar = (username: string): string => {
  if (!username) return 'avatar1.png';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const avatarNum = (Math.abs(hash) % 4) + 1; // Returns 1-4
  return `avatar${avatarNum}.png`;
};

// Helper function to normalize avatar URL/path to just the filename
const normalizeAvatar = (avatarUrl: string | undefined): string => {
  if (!avatarUrl) return '';
  
  // If it's already /uploads/ or /images/, return as is
  if (avatarUrl.startsWith('/uploads/') || avatarUrl.startsWith('/images/')) {
    return avatarUrl;
  }
  
  // If it's a full URL or path, extract just the filename
  if (avatarUrl.includes('/')) {
    const parts = avatarUrl.split('/');
    const filename = parts[parts.length - 1];
    // Check if it looks like a default avatar
    if (filename.includes('avatar')) {
      return filename; // Will be converted to /images/avatar1.png in DemoPlayerCard
    }
    return filename; // User upload filename
  }
  
  // If it's just a filename, return as is
  return avatarUrl;
};

/**
 * Renders the game header with status and exit button
 */
export const renderGameHeader = (isGameEnded: boolean): string => `
  <div class="w-full flex justify-between items-center mb-4 sm:mb-6">
    <div class="flex-1"></div>

    <!-- Game Status Center - responsive text -->
    <div class="text-center px-2">
      <div class="text-white text-xs sm:text-sm md:text-base font-medium">
        ${i18n.t('game.firstTo') || 'First to'} ${GOALS_TO_WIN} ${i18n.t('game.goals') || 'goals wins!'}
      </div>
      <div id="gameStatus" class="text-cyan-400 text-sm sm:text-lg font-bold mt-1">
        ${isGameEnded ? '' : (i18n.t('game.playing') || 'Playing...')}
      </div>
    </div>
    
    <div class="flex-1 flex justify-end">
      <div class="flex flex-col items-center">
        <button id="exitGame" class="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-cyan-100 hover:bg-cyan-200 
                                    rounded-full flex items-center justify-center transition-colors">
          <img src="/icons/logout.png" alt="Exit" class="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
        </button>
        <div class="mt-1 text-white text-xs sm:text-sm lg:text-base font-medium">
          ${i18n.t('game.exit') || 'Exit'}
        </div>
      </div>
    </div>
  </div>
`;

/**
 * Interface for player info in layouts
 */
export interface PlayerLayoutInfo {
  username: string;
  avatar_url?: string;
  avatar?: string;
}

/**
 * Renders desktop layout with player cards on sides and canvas in center
 * Used for both online and inline games
 * @deprecated Use renderGameLayout instead
 */
export const renderDesktopLayout = (
  player1: PlayerLayoutInfo,
  player2: PlayerLayoutInfo,
  useDemo: boolean = false
): string => {
  const renderPlayer = useDemo 
    ? (type: 'player1' | 'player2', compact?: boolean) => {
        const isP1 = type === 'player1';
        const user = isP1 ? player1 : player2;
        const normalizedAvatar = normalizeAvatar(user.avatar_url || user.avatar);
        const avatar = normalizedAvatar || getDefaultAvatar(user.username);
        return renderDemoPlayerCard({ type, name: user.username, avatar });
      }
    : (type: 'player1' | 'player2', compact?: boolean) => 
        renderPlayerCard({ type, compact });

  return `
    <div class="hidden lg:flex w-full max-w-[1300px] items-stretch gap-6">
      <div class="flex flex-col justify-start self-start">
        ${renderPlayer('player1')}
      </div>
      <div class="flex-1 flex justify-center">
        ${renderPongCanvas()}
      </div>
      <div class="flex flex-col justify-end self-end">
        ${renderPlayer('player2')}
      </div>
    </div>
  `;
};

/**
 * Renders mobile layout with player cards at top and canvas below
 * Used for both online and inline games
 */
export const renderMobileLayout = (
  player1: PlayerLayoutInfo,
  player2: PlayerLayoutInfo,
  useDemo: boolean = false
): string => {
  const renderPlayer = useDemo 
    ? (type: 'player1' | 'player2', compact?: boolean) => {
        const isP1 = type === 'player1';
        const user = isP1 ? player1 : player2;
        const normalizedAvatar = normalizeAvatar(user.avatar_url || user.avatar);
        const avatar = normalizedAvatar || getDefaultAvatar(user.username);
        return renderDemoPlayerCard({ type, compact, name: user.username, avatar });
      }
    : (type: 'player1' | 'player2', compact?: boolean) => 
        renderPlayerCard({ type, compact });

  return `
    <div class="lg:hidden w-full max-w-[600px] flex flex-col gap-4">
      <div class="flex justify-between gap-3 px-2">
        ${renderPlayer('player1', true)}
        ${renderPlayer('player2', true)}
      </div>
      <div class="w-full">
        ${renderPongCanvas()}
      </div>
    </div>
  `;
};

/**
 * Renders complete responsive game layout (desktop + mobile)
 * NOW: Single unified layout with ONE pongContainer
 */
export const renderGameLayout = (
  player1: PlayerLayoutInfo,
  player2: PlayerLayoutInfo,
  useDemo: boolean = false
): string => {
  const renderPlayer = useDemo 
    ? (type: 'player1' | 'player2', compact?: boolean) => {
        const isP1 = type === 'player1';
        const user = isP1 ? player1 : player2;
        const normalizedAvatar = normalizeAvatar(user.avatar_url || user.avatar);
        const avatar = normalizedAvatar || getDefaultAvatar(user.username);
        return renderDemoPlayerCard({ type, name: user.username, avatar, compact });
      }
    : (type: 'player1' | 'player2', compact?: boolean) => 
        renderPlayerCard({ type, compact });

  return `
    <div class="w-full flex justify-center">
      <!-- Single responsive layout: flex-col on mobile, flex-row on desktop -->
      <div class="w-full flex flex-col lg:flex-row lg:items-stretch lg:gap-6 gap-4 lg:max-w-[1300px] max-w-[600px]">
        <!-- Player 1: Top on mobile, left on desktop -->
        <div class="lg:flex lg:flex-col lg:justify-start lg:self-start">
          ${renderPlayer('player1', false)}
        </div>

        <!-- Canvas: Full width on mobile, flex-1 on desktop -->
        <div class="w-full lg:flex-1 flex justify-center">
          ${renderPongCanvas()}
        </div>

        <!-- Player 2: Bottom on mobile, right on desktop -->
        <div class="lg:flex lg:flex-col lg:justify-end lg:self-end">
          ${renderPlayer('player2', false)}
        </div>
      </div>
    </div>
  `;
};

/**
 * Renders the complete game container structure
 */
export const renderGameContainer = (
  content: string,
  footer: string
): string => `
  <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
    ${content}
    <div class="mt-2 sm:mt-4">${footer}</div>
  </div>
`;
