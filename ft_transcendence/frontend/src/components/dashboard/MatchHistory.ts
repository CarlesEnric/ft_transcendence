import i18n from "../../core/i18n";
import { listenSSE, type SseMessage } from "../../core/sse";

type MatchRow = {
  username: string;
  handle: string;
  avatarUrl?: string | null;
  date: string;
  result: string;
  status: 'victory' | 'defeated';
};

const rowBg = (i: number) => (i % 2 === 0 ? 'bg-zinc-700' : 'bg-gray-800');

const statusPill = (status: MatchRow['status']) => {
  if (status === 'victory') {
    return `
      <span class="px-2 py-1 bg-emerald-50 rounded-[54px] inline-flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
        <span class="text-green-600 text-xs">${i18n.t('history.victory') || 'Victory'}</span>
      </span>`;
  }
  return `
    <span class="px-2 py-1 bg-red-100 rounded-[54px] inline-flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
      <span class="text-red-600 text-xs">${i18n.t('history.defeated') || 'Defeated'}</span>
    </span>`;
};

const renderPlayerCell = (r: MatchRow) => {
  if (r.avatarUrl) {
    return `
      <div class="px-5 py-2.5 flex items-center gap-3">
        <img class="w-9 h-9 rounded-full" src="${r.avatarUrl}" alt="${r.username}"/>
        <div class="flex flex-col">
          <span class="text-white text-sm font-semibold">${r.username}</span>
          <span class="text-neutral-400 text-sm">${r.handle}</span>
        </div>
      </div>`;
  }
  const initials = r.username
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return `
    <div class="px-5 py-2.5 flex items-center gap-3">
      <div class="w-9 h-9 bg-violet-700 rounded-full grid place-items-center">
        <span class="text-neutral-50 text-sm">${initials || 'U'}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-white text-sm font-semibold">${r.username}</span>
        <span class="text-neutral-400 text-sm">${r.handle}</span>
      </div>
    </div>`;
};

export const renderMatchHistoryCard = (rows: MatchRow[] = []): string => {
  if (!rows || rows.length === 0) {
    return `
    <section id="match-history-card"
      class="w-full h-full min-w-0 rounded-[20px] outline outline-2 outline-cyan-700 overflow-hidden flex flex-col">
      <div class="grid grid-cols-1 sm:grid-cols-4 bg-gray-900 w-full">
        <div class="px-5 py-5 text-white font-semibold">${i18n.t('history.opponents') || 'Oponentes'}</div>
        <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.date') || 'Date'}</div>
        <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.results') || 'Results'}</div>
        <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.status') || 'Status'}</div>
      </div>
      <div class="p-6 bg-gray-800 text-center text-sm text-neutral-300 flex-1 w-full min-w-0 flex items-center justify-center">
        ${i18n.t('history.empty') || 'No matches yet.'}
      </div>
    </section>`;
  }
  // Enable internal scroll only when there are more than 9 matches
  const scrollMaxClass = rows.length > 9 ? 'max-h-[520px]' : '';
  const playersCol = rows.map((r, i) =>
    `<div class="${rowBg(i)}">${renderPlayerCell(r)}</div>`
  ).join('');
  const dateCol = rows.map((r, i) =>
    `<div class="px-5 py-5 ${rowBg(i)} grid"><span class="text-white text-sm">${r.date}</span></div>`
  ).join('');
  const resultCol = rows.map((r, i) =>
    `<div class="px-5 py-5 ${rowBg(i)} grid"><span class="text-white text-sm">${r.result}</span></div>`
  ).join('');
  const statusCol = rows.map((r, i) =>
    `<div class="px-5 py-4 ${rowBg(i)}">${statusPill(r.status)}</div>`
  ).join('');
  return `
  <section id="match-history-card"
    class="w-full h-full min-w-0 rounded-[20px] outline outline-2 outline-cyan-700 overflow-hidden flex flex-col">
    <div class="grid grid-cols-1 sm:grid-cols-4 bg-gray-900 w-full">
      <div class="px-5 py-5 text-white font-semibold">${i18n.t('history.opponents') || 'Oponentes'}</div>
      <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.date') || 'Date'}</div>
      <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.results') || 'Results'}</div>
      <div class="px-5 py-5 text-white font-semibold sm:text-left">${i18n.t('history.status') || 'Status'}</div>
    </div>
    <div class="flex-1 overflow-y-auto w-full min-w-0 ${scrollMaxClass}">
      <div class="grid grid-cols-1 sm:grid-cols-4 w-full">
        <div class="flex flex-col">${playersCol}</div>
        <div class="flex flex-col">${dateCol}</div>
        <div class="flex flex-col">${resultCol}</div>
        <div class="flex flex-col">${statusCol}</div>
      </div>
    </div>
  </section>`;
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

type MeProfile = { id: number; username: string; email?: string } | { user?: { id: number; username: string; email?: string } };

async function getMeId(): Promise<number | null> {
  try {
    const res = await fetch('/api/auth/profile', { credentials: 'include' });
    const json = (await res.json()) as MeProfile;
    const user = (json as any)?.user ?? json;
    const id = Number((user as any)?.id);
    return Number.isFinite(id) ? id : null;
  }
  catch {
    return null;
  }
}

function fmtDate(d: string): string {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}

function toRows(meId: number | null, matches: BackendMatch[]): MatchRow[] {
  return matches.map((m) => {
    const iAmP1 = meId != null && m.player1 === meId;
    const opponentName = iAmP1 ? m.username2 : m.username1;
    const myScore = iAmP1 ? m.score1 : m.score2;
    const theirScore = iAmP1 ? m.score2 : m.score1;
    const status: MatchRow['status'] =
      (m.winner != null && meId != null && m.winner === meId) ? 'victory'
        : (m.winner != null && meId != null && m.winner !== meId) ? 'defeated'
          : (myScore >= theirScore ? 'victory' : 'defeated');
    return {
      username: opponentName,
      handle: `@${opponentName}`.replace(/\s+/g, '_').toLowerCase(),
      avatarUrl: null,
      date: fmtDate(m.date),
      result: `${myScore} - ${theirScore}`,
      status,
    };
  });
}

async function loadRows(): Promise<MatchRow[]> {
  const [meId, res] = await Promise.all([
    getMeId(),
    fetch('/api/matches', { credentials: 'include' }),
  ]);
  if (!res.ok) return [];
  const list = (await res.json()) as BackendMatch[];
  return toRows(meId, Array.isArray(list) ? list : []);
}

let _unsub: (() => void) | null = null;

export async function mountMatchHistory(containerId = 'match-history'): Promise<void> {
  const el = document.getElementById(containerId);
  if (!el) return;
  const rows = await loadRows();
  el.innerHTML = renderMatchHistoryCard(rows);
  _unsub?.();
  _unsub = listenSSE('/api/matches/sse/me', (ev: SseMessage) => {
    if (!ev || !ev.type) return;
    if (ev.type === 'match_created' || ev.type === 'match_finished' || ev.type === 'room_update') {
      loadRows().then((rows2) => {
        el.innerHTML = renderMatchHistoryCard(rows2);
      }).catch(() => { });
    }
  });
}

export async function initMatchHistoryCard(): Promise<void> {
  const host = document.getElementById('match-history');
  if (host) await mountMatchHistory('match-history');
}

export function resetMatchHistoryCard(): void { }