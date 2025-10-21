// gameRoom/PlayerCard.ts
import i18n from '../../core/i18n';
import { getState } from '../../core/state';

interface PlayerCardProps {
  type: 'player1' | 'player2';
  compact?: boolean;
}

const t = (key: string, fallback: string) => {
  const s = i18n?.t?.(key);
  return !s || s === key ? fallback : s;
};

const getInitial = (nameOrEmail: string): string => {
  const base = (nameOrEmail || '').trim();
  if (!base) return '?';
  const username = base.includes('@') ? base.split('@')[0] : base;
  return username[0]?.toUpperCase() || '?';
};

export const renderPlayerCard = ({ type, compact = false }: PlayerCardProps): string => {
  const isPlayer1 = type === 'player1';
  const state: any = getState();
  const me = state.user;
  const players = state.players || {};
  const data = players?.[type] || null;
  const otherRole = isPlayer1 ? 'player2' : 'player1';
  const otherPresent = !!players?.[otherRole];
  const hasPlayer = !!data;
  const username = data?.username || (isPlayer1 ? t('game.waiting.player1','Waiting') : t('game.waiting.player2','Waiting'));
  const initial = getInitial(data?.username || data?.email || username);
  const isLocalUser = hasPlayer && me && data?.id === me.id;
  const ready = !!data?.ready;
  const waitingOpponent = type === 'player2' && !hasPlayer;

  // Resolve avatar url from data.avatar_url or data.avatar
  const resolveAvatarURL = (src?: string): string => {
    if (!src) return '';
    const s = String(src).trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    return `/images/${s}`; // treat as image filename by default
  };
  const avatarSrc = resolveAvatarURL(data?.avatar_url || data?.avatar);
  
  const spinnerHTML = `
    <div class="${compact ? 'mt-1' : 'mt-2'} flex items-center justify-center gap-2 ${compact ? 'text-[10px] sm:text-xs' : 'text-xs xl:text-sm'} text-white/70">
      <span class="inline-block w-3 h-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></span>
      <span>${t('game.searchingOpponent','Searching opponent…')}</span>
    </div>
  `;
  
  const readyDisabled = !(hasPlayer && otherPresent && isLocalUser);
  
  
  const readyBtn = waitingOpponent ? '' : `
    <button 
      class="readyBtn mt-1 px-2 py-0.5 ${compact ? 'text-[10px] sm:text-xs' : 'text-xs'} rounded-full 
            ${ready ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}
            ${readyDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}"
      data-role="${type}"
      ${readyDisabled ? 'disabled' : ''}>
      ${ready ? t('game.ready','Ready') : t('game.notReady','Not ready')}
    </button>`;

  if (compact) {
    return `
      <div class="flex-1 max-w-[140px] sm:max-w-[160px]" data-player-card="${type}">
        <div class="p-2 sm:p-3 bg-gray-900 rounded-[15px] sm:rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                    outline outline-2 outline-offset-[-2px] ${isPlayer1 ? 'outline-teal-600' : 'outline-cyan-950'} flex flex-col gap-2">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)]
                        ${isPlayer1 ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-yellow-400 to-orange-600'}
                        flex items-center justify-center select-none overflow-hidden relative">
              ${avatarSrc
                ? `<img src="${avatarSrc}" alt="${username}" class="w-full h-full object-cover object-center rounded-full" onerror="this.src='/images/avatar1.png'" />`
                : `<div class="text-white text-xl sm:text-2xl md:text-3xl font-bold">${initial}</div>`}
            </div>
            <div class="mt-2 flex flex-col gap-1 w-full">
              <div class="px-2 py-1 ${isPlayer1 ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white'} rounded-md text-xs sm:text-sm font-semibold text-center truncate" title="${username}">
                ${username}
              </div>
            </div>
            <div class="mt-1 w-full text-center">
              ${waitingOpponent ? spinnerHTML : `<div class="mt-1">${readyBtn}</div>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="p-3 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                outline outline-2 outline-offset-[-2px] ${isPlayer1 ? 'outline-teal-600' : 'outline-cyan-950'} flex flex-col gap-2.5"
         data-player-card="${type}">
      <div class="flex flex-col ${isPlayer1 ? 'items-start' : 'items-end'}">
        <div class="w-32 h-32 xl:w-36 xl:h-36 rounded-full shadow-[0px_2px_8px_rgba(0,240,255,0.20)]
                    ${isPlayer1 ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-yellow-400 to-orange-600'}
                    flex items-center justify-center select-none overflow-hidden relative">
          ${avatarSrc
            ? `<img src="${avatarSrc}" alt="${username}" class="w-full h-full object-cover object-center rounded-full" onerror="this.src='/images/avatar1.png'" />`
            : `<div class="text-white text-5xl xl:text-6xl font-bold">${initial}</div>`}
        </div>

        <div class="mt-2 flex flex-col gap-2 ${isPlayer1 ? 'items-start' : 'items-end'}">
          <div class="px-3 py-2 bg-teal-600 rounded-lg text-white text-sm xl:text-base font-semibold truncate" title="${username}">
            ${username}
          </div>
        </div>
        <div class="mt-2 ${isPlayer1 ? 'text-left' : 'text-right'}">
          ${waitingOpponent ? spinnerHTML : `<div class="mt-2">${readyBtn}</div>`}
        </div>
      </div>
    </div>
  `;
};
