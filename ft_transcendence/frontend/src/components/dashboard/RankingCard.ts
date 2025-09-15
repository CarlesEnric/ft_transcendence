// components/RankingCard.ts
import i18n from '../../core/i18n';

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

    <!-- Placeholder “rings” -->
    <div class="p-6 flex justify-center">
      <div class="relative w-48 h-48 sm:w-56 sm:h-56">
        <div class="absolute inset-0 rounded-full outline outline-[12px] outline-zinc-900"></div>
        <div class="absolute inset-0 rounded-full outline outline-[12px] outline-cyan-400 clip-path"></div>
        <div class="absolute inset-[12px] rounded-full outline outline-[12px] outline-zinc-900"></div>
        <div class="absolute inset-[12px] rounded-full outline outline-[12px] outline-cyan-200"></div>
        <div class="absolute inset-[24px] rounded-full outline outline-[12px] outline-zinc-900"></div>
        <div class="absolute inset-[24px] rounded-full outline outline-[12px] outline-cyan-700"></div>
      </div>
    </div>

    <div class="px-6 py-4 flex flex-wrap items-center gap-4">
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

    <div class="p-6 flex flex-col gap-3">
      <button id="inviteFriendsBtn"
        class="w-full px-6 py-3 bg-cyan-950 rounded-lg text-white font-bold">
        ${i18n.t('ranking.inviteFriends') || 'INVITAR AMIGOS'}
      </button>
      <button id="findMatchBtn"
        class="w-full px-6 py-3 bg-cyan-700 rounded-lg text-white font-bold">
        ${i18n.t('ranking.findMatch') || 'FIND MATCH'}
      </button>
    </div>
  </aside>`;
};

export const initRankingCard = (): void => {
  document.getElementById('inviteFriendsBtn')?.addEventListener('click', () => {
    alert('Invite friends – coming soon!');
  });
  document.getElementById('findMatchBtn')?.addEventListener('click', () => {
    alert('Matchmaking – coming soon!');
  });
};