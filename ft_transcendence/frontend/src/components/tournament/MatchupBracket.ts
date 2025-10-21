import i18n from '../../core/i18n';
export interface Player {
  userId: number;
  username: string;
  avatar?: string;
  avatar_url?: string; // support external or normalized avatar urls
  seat?: number;
}
export interface Match {
  id: number;
  round: number;
  slot: number;
  status: 'pending' | 'in_progress' | 'finished';
  player1?: Player | null;
  player2?: Player | null;
  winner?: Player | null;
  score1?: number | null;
  score2?: number | null;
  room_code?: string | null;
}
export interface BracketData {
  matches: Match[];
  tournamentSize: 4 | 8;
  currentRound: number;
  winner?: Player | null;
  showActions?: boolean; // when false, hide play/join/create buttons
}

export function renderMatchupBracket(data: BracketData): string {
  return `
    <div class="bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(128,90,213,0.20)] outline outline-2 outline-offset-[-2px] outline-purple-400 p-4 sm:p-6">
      <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span class="text-purple-400">⚔️</span>
        ${i18n.t('bracket.title') || 'Enfrentamientos'}
      </h3>
      
      <!-- Constrain the bracket height so it doesn't grow; round 1 will scroll internally -->
      <div class="max-h-[65vh] overflow-hidden">
        <div class="flex items-center gap-6 justify-center">
          <!-- Bracket grid (flex-1) -->
          <div class="max-w-[1100px] w-full">
            ${renderBracketStructure(data)}
          </div>

          <!-- Trophy (right side, vertically centered relative to bracket) -->
          ${data.winner ? `
            <div class="hidden lg:flex flex-col items-center justify-center w-40 text-center">
              <img src="${data.winner.avatar || '/images/avatar1.png'}" class="w-20 h-20 rounded-full border-2 border-green-400 mb-2" />
              <div class="text-white text-sm font-semibold">${data.winner.username}</div>
              <div class="text-green-400 text-xs font-bold mt-1">${i18n.t('bracket.winner') || 'Winner'}</div>
            </div>
          ` : `
            <div class="hidden lg:flex flex-col items-center justify-center w-32">
              <div class="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-400 flex items-center justify-center mb-2">
                <span class="text-3xl">🏆</span>
              </div>
              <div class="text-sm text-gray-300 text-center">${i18n.t('tournament.trophy') || 'Trophy'}</div>
            </div>
          `}
        </div>
      </div>

      <!-- Tournament Info -->
      <div class="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <div>
          <span>${i18n.t('bracket.round') || 'Ronda'} ${data.currentRound}</span>
          <span class="ml-4">${i18n.t('bracket.format') || 'Formato'}: ${data.tournamentSize} ${i18n.t('bracket.players') || 'jugadores'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderBracketStructure(data: BracketData): string {
  const matchesByRound = groupMatchesByRound(data.matches);
  const rounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));
  
  return `
    <div class="grid gap-6 ${getGridCols(data.tournamentSize)}">
      ${rounds.map(round => renderRound(data, parseInt(round), matchesByRound[round])).join('')}
    </div>
  `;
}

function groupMatchesByRound(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, match) => {
    const round = match.round.toString();
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<string, Match[]>);
}

function renderRound(data: BracketData, round: number, matches: Match[]): string {
  if (round === 1) {
    return `
      <div class="space-y-4">
        <h4 class="text-center text-white font-semibold text-sm sticky top-0 bg-gray-900/80 py-2 z-10">
          ${getRoundName(round)}
        </h4>
        <div class="space-y-3 max-h-[48vh] overflow-y-auto pr-2">
          ${matches.map(match => renderMatch(data, match)).join('')}
        </div>
      </div>
    `;
  }
  return `
    <div class="space-y-4 flex flex-col justify-center h-full">
      <h4 class="text-center text-white font-semibold text-sm">
        ${getRoundName(round)}
      </h4>
      <div class="space-y-3 flex flex-col justify-center">
        ${matches.map(match => renderMatch(data, match)).join('')}
      </div>
    </div>
  `;
}

function renderMatch(data: BracketData, match: Match): string {
  const statusClass = getMatchStatusClass(match.status);
  const canPlay = match.status === 'pending' && !!match.player1 && !!match.player2;
  const hasRoom = !!match.room_code;
  const highlight = match.status === 'finished';
  const allowActions = data.showActions !== false; // default true

  return `
    <div class="bg-gray-800 rounded-lg p-3 ${statusClass} border border-gray-600/50">
      <div class="space-y-2 mb-3">
        ${renderMatchPlayer(match.player1, match.score1, match.winner?.userId === match.player1?.userId, highlight)}
        <div class="text-center text-gray-500 text-xs font-bold">VS</div>
        ${renderMatchPlayer(match.player2, match.score2, match.winner?.userId === match.player2?.userId, highlight)}
      </div>

      <div class="flex justify-between items-center text-xs">
        <span class="text-gray-400">
          ${getMatchStatusText(match.status)}
        </span>

        ${allowActions && (canPlay || hasRoom)
          ? `
            <button
              data-action="match-btn"
              data-match-id="${match.id}"
              data-room="${match.room_code || ''}"
              class="px-3 py-1 ${hasRoom ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded text-xs font-medium transition-colors">
              ${hasRoom ? (i18n.t('bracket.join') || 'Entrar') : (i18n.t('bracket.createRoom') || 'Crear sala')}
            </button>
          `
          : ''}
        ${match.status === 'finished' ? `
          <span class="text-green-400 font-medium">
            ${i18n.t('bracket.finished') || 'Finalizado'}
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

function renderMatchPlayer(
  player: Player | null | undefined,
  score: number | null | undefined,
  isWinner: boolean,
  highlight: boolean
): string {
  if (!player) {
    return `
      <div class="flex items-center justify-between p-2 bg-gray-700/50 rounded border-l-4 border-gray-500">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span class="text-gray-400 text-xs">?</span>
          </div>
          <span class="text-gray-500 text-sm">${i18n.t('bracket.waitingPlayer') || 'Esperando jugador'}</span>
        </div>
        <span class="text-gray-500">-</span>
      </div>
    `;
  }

  const winnerClass = highlight
    ? (isWinner ? 'border-green-400 bg-green-900/20' : 'border-red-400 bg-red-900/10')
    : 'border-gray-500';

  const textClass = highlight
    ? (isWinner ? 'text-green-400' : 'text-red-300')
    : 'text-gray-200';

  const avatarBorderClass = highlight
    ? (isWinner ? 'border-green-400' : 'border-red-400')
    : 'border-gray-400';

  const resolveAvatar = (src?: string): string => {
    if (!src || src.trim() === '') return '';
    const s = src.trim();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    // treat as local image filename
    return `/images/${s}`;
  };

  const avatarSrc = resolveAvatar(player.avatar) || resolveAvatar(player.avatar_url) || `/images/avatar${(player.userId % 4) + 1}.png`;

  return `
    <div class="flex items-center justify-between p-2 bg-gray-700/50 rounded border-l-4 ${winnerClass}">
      <div class="flex items-center gap-2">
        <img
          src="${avatarSrc}"
          alt="${player.username}"
          class="w-8 h-8 rounded-full border-2 ${avatarBorderClass}" />
        <span class="text-sm font-medium ${textClass}">${player.username}</span>
      </div>
      <span class="font-bold ${textClass}">${score ?? '-'}</span>
    </div>
  `;
}

function getGridCols(tournamentSize: number): string {
  switch (tournamentSize) {
    case 4: return 'grid-cols-2';
    case 8: return 'grid-cols-3';
    default: return 'grid-cols-2';
  }
}

function getRoundName(round: number): string {
  switch (round) {
    case 1: return i18n.t('bracket.quarterfinals') || 'Cuartos de Final';
    case 2: return i18n.t('bracket.semifinals') || 'Semifinales';
    case 3: return i18n.t('bracket.final') || 'Final';
    default: return `${i18n.t('bracket.round') || 'Ronda'} ${round}`;
  }
}

function getMatchStatusClass(status: string): string {
  switch (status) {
    case 'in_progress': return 'ring-2 ring-blue-400/50';
    case 'finished': return 'ring-2 ring-green-400/50';
    default: return '';
  }
}

function getMatchStatusText(status: string): string {
  switch (status) {
    case 'pending': return i18n.t('bracket.pending') || 'Pendiente';
    case 'in_progress': return i18n.t('bracket.inProgress') || 'En progreso';
    case 'finished': return i18n.t('bracket.finished') || 'Finalizado';
    default: return status;
  }
}

export function initializeMatchupBracket(data: BracketData): string {
  return `<div data-component="matchup-bracket">${renderMatchupBracket(data)}</div>`;
}

export function updateMatchupBracket(data: BracketData): void {
  const container = document.querySelector('[data-component="matchup-bracket"]');
  if (container) {
    container.innerHTML = renderMatchupBracket(data);
  }
}

export function createEmptyBracket(tournamentSize: 4 | 8): BracketData {
  const matches: Match[] = [];
  
  if (tournamentSize === 4) {
    matches.push(
      { id: 1, round: 1, slot: 1, status: 'pending', player1: null, player2: null },
      { id: 2, round: 1, slot: 2, status: 'pending', player1: null, player2: null },
      { id: 3, round: 2, slot: 1, status: 'pending', player1: null, player2: null }
    );
  } else if (tournamentSize === 8) {
    for (let i = 1; i <= 4; i++) {
      matches.push({ id: i, round: 1, slot: i, status: 'pending', player1: null, player2: null });
    }
    for (let i = 5; i <= 6; i++) {
      matches.push({ id: i, round: 2, slot: i - 4, status: 'pending', player1: null, player2: null });
    }
    matches.push({ id: 7, round: 3, slot: 1, status: 'pending', player1: null, player2: null });
  }
  return {
    matches,
    tournamentSize,
    currentRound: 1
  };
}