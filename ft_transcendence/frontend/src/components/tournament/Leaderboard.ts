import i18n from '../../core/i18n';

//  Tipos para el componente Leaderboard
export interface LeaderboardEntry {
    userId: number;
    username: string;
    score: number;
    position: number;
    avatar?: string;
}

export interface LeaderboardData {
    entries: LeaderboardEntry[];
    isEmpty: boolean;
}

//  Función principal para renderizar el leaderboard
export function renderLeaderboard(data: LeaderboardData): string {
  if (data.isEmpty || data.entries.length === 0) {
    return renderEmptyLeaderboard();
  }

  return renderPopulatedLeaderboard(data.entries);
}

//  Función para renderizar leaderboard vacío
function renderEmptyLeaderboard(): string {
    return `
    <div class="bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(156,163,175,0.20)] outline outline-2 outline-offset-[-2px] outline-gray-400 p-4 sm:p-5">
      <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span class="text-gray-400">🏅</span>
        ${i18n.t('leaderboard.title') || 'Clasificación'}
      </h3>
      
      <div class="text-center py-8">
        <div class="text-gray-500 text-4xl mb-3">📊</div>
        <div class="text-gray-400 text-sm mb-2">${i18n.t('leaderboard.empty') || 'La clasificación aparecerá aquí'}</div>
        <div class="text-gray-500 text-xs">${i18n.t('leaderboard.afterMatches') || 'después de los primeros partidos'}</div>
      </div>
    </div>
  `;
}

//  Función para renderizar leaderboard con datos
function renderPopulatedLeaderboard(entries: LeaderboardEntry[]): string {
    const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

    return `
    <div class="h-full bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(255,215,0,0.20)] outline outline-2 outline-offset-[-2px] outline-yellow-400 p-4 sm:p-5 flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white text-lg font-bold flex items-center gap-2">
          <span class="text-yellow-400">🏅</span>
          ${i18n.t('leaderboard.title') || 'Clasificación'}
        </h3>
        <div class="text-xs text-gray-400">${i18n.t('leaderboard.live') || 'En vivo'}</div>
      </div>

      <!-- Header row -->
      <div class="hidden sm:flex items-center justify-between text-gray-400 text-xs mb-2 px-2">
        <div>${i18n.t('leaderboard.players') || 'Players'}</div>
        <div class="text-right w-12">${i18n.t('leaderboard.score') || 'Score'}</div>
      </div>

      <div class="flex-1 overflow-y-auto space-y-3 pr-2">
        ${sortedEntries.map((entry, index) => renderLeaderboardEntry(entry, index + 1)).join('')}
      </div>

      <!-- Footer info -->
      <div class="mt-3 pt-3 border-t border-gray-700 text-center">
        <div class="text-gray-400 text-xs">
          ${i18n.t('leaderboard.updated') || 'Actualizado'}
        </div>
      </div>
    </div>
  `;
}

//  Función para renderizar una entrada del leaderboard
function renderLeaderboardEntry(entry: LeaderboardEntry, position: number): string {
    // color rules: positions 1-2 green, 3-4 yellow, >4 red
    const color = position <= 2 ? 'green' : position <= 4 ? 'yellow' : 'red';
    const bgClass = position <= 2 ? 'bg-green-900/20' : position <= 4 ? 'bg-yellow-900/10' : 'bg-red-900/10';
    const textClass = position <= 2 ? 'text-green-400' : position <= 4 ? 'text-yellow-400' : 'text-red-400';
    const borderClass = position <= 2 ? 'border-green-400' : position <= 4 ? 'border-yellow-400' : 'border-red-400';

    return `
    <div class="flex items-center justify-between p-3 ${bgClass} rounded-lg border ${borderClass} border-opacity-30">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <img src="${entry.avatar || `/images/avatar${(entry.userId % 4) + 1}.png`}" 
             alt="${entry.username}" 
             class="w-10 h-10 rounded-full border-2 ${borderClass} " />
        
        <!-- Username -->
        <div>
          <div class="text-white font-medium text-sm">${entry.username}</div>
          <div class="text-gray-400 text-xs">${i18n.t('leaderboard.player') || 'Jugador'}</div>
        </div>
      </div>

      <!-- Score on the right (replaces Ready) -->
      <div class="text-right">
        <div class="text-white font-bold text-lg ${textClass}">${entry.score}</div>
      </div>
    </div>
  `;
}

//  Funciones auxiliares para estilos según posición
function getPositionClass(position: number): string {
  // deprecated - kept for backwards compat
  return 'bg-gray-800/20';
}

function getPositionIcon(position: number): string {
    switch (position) {
        case 1: return '👑';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return position.toString();
    }
}

function getPositionBadgeClass(position: number): string {
  return 'bg-gray-600/20 text-gray-400';
}

function getPositionAvatarBorder(position: number): string {
  return 'border-gray-500';
}

//  Función para inicializar el componente
export function initializeLeaderboard(data: LeaderboardData): string {
    return `<div data-component="leaderboard">${renderLeaderboard(data)}</div>`;
}

//  Función para actualizar el leaderboard en tiempo real
export function updateLeaderboard(data: LeaderboardData): void {
    const container = document.querySelector('[data-component="leaderboard"]');
    if (container) {
        container.innerHTML = renderLeaderboard(data);
    }
}

//  Función para crear datos de ejemplo
export function createEmptyLeaderboard(): LeaderboardData {
    return {
        entries: [],
        isEmpty: true
    };
}

export function createLeaderboardFromResults(results: Array<{userId: number, username: string, score: number, avatar?: string}>): LeaderboardData {
    const entries: LeaderboardEntry[] = results.map((result, index) => ({
        userId: result.userId,
        username: result.username,
        score: result.score,
        position: index + 1,
        avatar: result.avatar
    }));
    
    return {
        entries,
        isEmpty: false
    };
}