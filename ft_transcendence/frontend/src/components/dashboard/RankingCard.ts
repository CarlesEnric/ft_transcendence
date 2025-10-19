import i18n from '../../core/i18n';
import { listenSSE, type SseMessage } from '../../core/sse';

type DashboardStats = {
  games_played: number;
  games_won: number;
  games_lost: number;
  win_rate: number;
};

type BackendMatch = {
  id: number;
  player1: number;
  player2: number;
  username1: string;
  username2: string;
  score1: number;
  score2: number;
  winner: number | null;
  date: string;
  tournament_id?: number | null;
};

let _unsubSSE: null | (() => void) = null;

export const renderRankingCard = (): string => {
  return `
  <aside id="ranking-card"
    class="w-full lg:w-80 bg-gray-900 rounded-[20px]
           outline outline-2 outline-offset-[-2px] outline-cyan-700
           flex flex-col overflow-hidden">

    <div class="px-6 py-4">
      <h3 class="text-white text-2xl sm:text-3xl font-bold">${i18n.t('ranking.title') || 'Your ranking'}</h3>
      <p class="text-slate-300 text-sm sm:text-base">${i18n.t('ranking.subtitle') || 'This is your ranking bro.'}</p>
    </div>

    <div class="p-6 flex justify-center">
      <svg class="w-48 h-48 sm:w-56 sm:h-56" viewBox="0 0 120 120" aria-label="ranking chart">
        <!-- Outer ring: Win Rate -->
        <circle cx="60" cy="60" r="52" stroke="#0f172a" stroke-width="8" fill="none" />
        <circle id="rkRingWinrate" cx="60" cy="60" r="52" stroke="#22d3ee" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="0" stroke-dashoffset="0" />
        <!-- Middle ring: Wins share -->
        <circle cx="60" cy="60" r="40" stroke="#0f172a" stroke-width="8" fill="none" />
        <circle id="rkRingWins" cx="60" cy="60" r="40" stroke="#a5f3fc" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="0" stroke-dashoffset="0" />
        <!-- Inner ring: Losses share -->
        <circle cx="60" cy="60" r="28" stroke="#0f172a" stroke-width="8" fill="none" />
        <circle id="rkRingLosses" cx="60" cy="60" r="28" stroke="#3b82f6" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="0" stroke-dashoffset="0" />
      </svg>
    </div>

    <div class="px-6 pb-2 grid grid-cols-2 gap-3">
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-xs text-gray-400">${i18n.t('ranking.played') || 'Played'}</div>
        <div id="rkPlayed" class="text-white text-xl font-bold">—</div>
      </div>
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-xs text-gray-400">${i18n.t('ranking.winShort') || 'Wins'}</div>
        <div id="rkWins" class="text-white text-xl font-bold">—</div>
      </div>
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-xs text-gray-400">${i18n.t('ranking.lossShort') || 'Losses'}</div>
        <div id="rkLosses" class="text-white text-xl font-bold">—</div>
      </div>
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-xs text-gray-400">${i18n.t('ranking.winrate') || 'Win rate'}</div>
        <div id="rkWinRate" class="text-white text-xl font-bold">—</div>
      </div>
    </div>

    <div class="px-6 py-4 flex flex-row items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="w-7 h-3 bg-cyan-400 rounded-full"></span>
        <span class="text-white text-sm">${i18n.t('ranking.tied') || 'Tied'}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-7 h-3 bg-cyan-100 rounded-full"></span>
        <span class="text-white text-sm">${i18n.t('ranking.win') || 'Win'}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-7 h-3 bg-blue-500 rounded-full"></span>
        <span class="text-white text-sm">${i18n.t('ranking.lose') || 'Lose'}</span>
      </div>
    </div>
  </aside>`;
};

function replaceElementWithClone(id: string) {
  const oldEl = document.getElementById(id);
  if (!oldEl) return null;
  const newEl = oldEl.cloneNode(true) as HTMLElement;
  oldEl.parentNode?.replaceChild(newEl, oldEl);
  return newEl;
}

async function getMeId(): Promise<number | null> {
  try {
    const res = await fetch('/api/auth/profile', { credentials: 'include' });
    const json = await res.json();
    const user = (json as any)?.user ?? json;
    const id = Number(user?.id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

function normalizeStats(payload: any): DashboardStats | null {
  if (!payload || typeof payload !== 'object') return null;

  const p = payload.stats ?? payload;
  const played = p.games_played ?? p.gamesPlayed;
  const won    = p.games_won ?? p.gamesWon;
  const lost   = p.games_lost ?? p.gamesLost;
  let wr       = p.win_rate ?? p.winRate;

  if (typeof wr === 'string') {
    wr = wr.endsWith('%') ? (parseFloat(wr) / 100) : parseFloat(wr);
  }

  const okNums = [played, won, lost].every((n) => Number.isFinite(Number(n)));
  if (!okNums) return null;

  const playedN = Number(played);
  const wonN    = Number(won);
  const lostN   = Number(lost);
  const wrN     =
    Number.isFinite(Number(wr)) ? Number(wr)
    : (playedN > 0 ? wonN / playedN : 0);

  return {
    games_played: playedN,
    games_won: wonN,
    games_lost: lostN,
    win_rate: wrN
  };
}

async function fetchDashboardStrict(): Promise<DashboardStats | null> {
  try {
    const res = await fetch('/api/matches/dashboard', { credentials: 'include' });
    if (!res.ok) {
      console.warn('[RankingCard] /dashboard not OK:', res.status);
      return null;
    }
    const json = await res.json();
    const stats = normalizeStats(json);
    if (!stats) {
      console.warn('[RankingCard] /dashboard payload no normalizable:', json);
    }
    return stats;
  } catch (e) {
    console.warn('[RankingCard] /dashboard error:', e);
    return null;
  }
}
async function fetchDashboardFallback(): Promise<DashboardStats | null> {
  try {
    const [meId, res] = await Promise.all([
      getMeId(),
      fetch('/api/matches', { credentials: 'include' })
    ]);
    if (!res.ok || meId == null) return null;
    const list = (await res.json()) as BackendMatch[];
    if (!Array.isArray(list)) return null;

    let played = 0, won = 0, lost = 0;
    for (const m of list) {
      const iAmP1 = m.player1 === meId;
      const iAmP2 = m.player2 === meId;
      if (!iAmP1 && !iAmP2) continue;

      played += 1;
      if (m.winner == null) {
      } else if (m.winner === meId) {
        won += 1;
      } else {
        lost += 1;
      }
    }
    const win_rate = played > 0 ? won / played : 0;
    return { games_played: played, games_won: won, games_lost: lost, win_rate };
  } catch (e) {
    console.warn('[RankingCard] fallback /matches error:', e);
    return null;
  }
}

async function fetchDashboard(): Promise<DashboardStats | null> {
  const s1 = await fetchDashboardStrict();
  if (s1) return s1;
  return await fetchDashboardFallback();
}

function paintDashboard(stats: DashboardStats | null) {
  const playedEl = document.getElementById('rkPlayed');
  const winsEl   = document.getElementById('rkWins');
  const lossEl   = document.getElementById('rkLosses');
  const wrEl     = document.getElementById('rkWinRate');
  const ringWr   = document.getElementById('rkRingWinrate') as SVGCircleElement | null;
  const ringWins = document.getElementById('rkRingWins') as SVGCircleElement | null;
  const ringLoss = document.getElementById('rkRingLosses') as SVGCircleElement | null;

  if (!playedEl || !winsEl || !lossEl || !wrEl) return;

  if (!stats) {
    playedEl.textContent = '—';
    winsEl.textContent   = '—';
    lossEl.textContent   = '—';
    wrEl.textContent     = '—';
    // Reset rings
    if (ringWr)  { ringWr.style.strokeDasharray = '0 999'; ringWr.style.transition = 'stroke-dasharray 600ms'; }
    if (ringWins){ ringWins.style.strokeDasharray = '0 999'; ringWins.style.transition = 'stroke-dasharray 600ms'; }
    if (ringLoss){ ringLoss.style.strokeDasharray = '0 999'; ringLoss.style.transition = 'stroke-dasharray 600ms'; }
    return;
  }

  const played = stats.games_played ?? 0;
  const wins   = stats.games_won ?? 0;
  const losses = stats.games_lost ?? 0;
  const wrPct  = Math.round(100 * (stats.win_rate ?? (played ? wins / Math.max(played, 1) : 0)));

  playedEl.textContent = String(played);
  winsEl.textContent   = String(wins);
  lossEl.textContent   = String(losses);
  wrEl.textContent     = `${wrPct}%`;

  // Animate rings
  const setRing = (ring: SVGCircleElement | null, value01: number) => {
    if (!ring) return;
    const r = Number(ring.getAttribute('r') || '0');
    const c = 2 * Math.PI * r;
    const filled = Math.max(0, Math.min(1, value01)) * c;
    ring.style.transition = 'stroke-dasharray 800ms ease';
    ring.setAttribute('stroke-dasharray', `${filled} ${c - filled}`);
  };

  const total = Math.max(played, 1);
  setRing(ringWr, (stats.win_rate ?? 0));
  setRing(ringWins, wins / total);
  setRing(ringLoss, losses / total);
}

export const initRankingCard = async (): Promise<void> => {
  replaceElementWithClone('ranking-card');
  const stats = await fetchDashboard();
  paintDashboard(stats);
  _unsubSSE?.();
  _unsubSSE = listenSSE('/api/matches/sse/me', (ev: SseMessage) => {
    if (!ev?.type) return;
    if (ev.type === 'match_created' || ev.type === 'match_finished' || ev.type === 'room_update') {
      fetchDashboard().then(paintDashboard).catch(() => {});
    }
  });

};

export const resetRankingCard = (): void => {
  _unsubSSE?.();
  _unsubSSE = null;
};