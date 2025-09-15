import i18n from "../../core/i18n";

// components/MatchHistoryCard.ts
type MatchRow = {
  username: string;
  handle: string;
  avatarUrl?: string | null;
  date: string;           // e.g. '5/27/15'
  result: string;         // e.g. '5 - 10'
  status: 'victory' | 'defeated';
};

const SAMPLE_ROWS: MatchRow[] = [
  { username: 'Jane Cooper', handle: '@jane', avatarUrl: null, date: '5/27/15', result: '5 - 10', status: 'victory' },
  { username: 'Wade Warren', handle: '@wade456', avatarUrl: 'https://placehold.co/38x38', date: '5/19/12', result: '15 - 10', status: 'defeated' },
  { username: 'Jane Cooper', handle: '@jane', avatarUrl: null, date: '5/27/15', result: '5 - 10', status: 'victory' },
  { username: 'Wade Warren', handle: '@wade456', avatarUrl: 'https://placehold.co/38x38', date: '5/19/12', result: '15 - 10', status: 'defeated' },
  { username: 'Jane Cooper', handle: '@jane', avatarUrl: null, date: '5/27/15', result: '5 - 10', status: 'victory' },
  { username: 'Wade Warren', handle: '@wade456', avatarUrl: 'https://placehold.co/38x38', date: '5/19/12', result: '15 - 10', status: 'defeated' },
  { username: 'Jane Cooper', handle: '@jane', avatarUrl: null, date: '5/27/15', result: '5 - 10', status: 'victory' },
  { username: 'Wade Warren', handle: '@wade456', avatarUrl: 'https://placehold.co/38x38', date: '5/19/12', result: '15 - 10', status: 'defeated' },
];

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
      <div class="px-5 py-2.5 ${''} flex items-center gap-3">
        <img class="w-9 h-9 rounded-full" src="${r.avatarUrl}" alt="${r.username}"/>
        <div class="flex flex-col">
          <span class="text-white text-sm font-semibold">${r.username}</span>
          <span class="text-neutral-400 text-sm">${r.handle}</span>
        </div>
      </div>`;
  }
  return `
    <div class="px-5 py-2.5 ${''} flex items-center gap-3">
      <div class="w-9 h-9 bg-violet-700 rounded-full grid place-items-center">
        <span class="text-neutral-50 text-sm">JC</span>
      </div>
      <div class="flex flex-col">
        <span class="text-white text-sm font-semibold">${r.username}</span>
        <span class="text-neutral-400 text-sm">${r.handle}</span>
      </div>
    </div>`;
};

export const renderMatchHistoryCard = (rows: MatchRow[] = SAMPLE_ROWS): string => {
  // Construye columnas tipo “tabla” responsiva
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
    class="flex-1 rounded-[20px] outline outline-2 outline-cyan-700
           overflow-hidden">

    <!-- Headers -->
    <div class="grid grid-cols-1 sm:grid-cols-4">
      <div class="px-5 py-5 bg-gray-900 text-white font-semibold">${i18n.t('history.players') || 'Players'}</div>
      <div class="px-5 py-5 bg-gray-900 text-white font-semibold sm:text-left">${i18n.t('history.date') || 'Date'}</div>
      <div class="px-5 py-5 bg-gray-900 text-white font-semibold sm:text-left">${i18n.t('history.results') || 'Results'}</div>
      <div class="px-5 py-5 bg-gray-900 text-white font-semibold sm:text-left">${i18n.t('history.status') || 'Status'}</div>
    </div>

    <!-- Rows, cuatro columnas paralelas (layout de “tabla CSS”) -->
    <div class="grid grid-cols-1 sm:grid-cols-4">
      <div class="flex flex-col">${playersCol}</div>
      <div class="flex flex-col">${dateCol}</div>
      <div class="flex flex-col">${resultCol}</div>
      <div class="flex flex-col">${statusCol}</div>
    </div>
  </section>`;
};

export const initMatchHistoryCard = (): void => {
  // Aquí iría la lógica para paginar/ordenar/filtrar si lo necesitas
};