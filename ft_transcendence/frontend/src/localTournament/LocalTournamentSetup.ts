import { navigateTo } from '../core/router';
import i18n from '../core/i18n';
import { renderFooter, initFooter } from '../components/global/Footer';
import { LocalTournamentService, LocalParticipant } from './LocalTournamentService';

export function renderLocalTournamentSetup(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const t = LocalTournamentService.get();
  if (!t) {
    navigateTo('/landing');
    return;
  }

  const players: LocalParticipant[] = Array.from({ length: t.size }, (_, idx) => ({
    userId: idx + 1, username: '', avatar_url: '', joinedAt: new Date().toISOString()
  }));

  // Prefill from existing participants if present
  const existing = (t.participants || []);
  for (let i = 0; i < t.size; i++) {
    const ep = existing[i];
    if (ep) {
      players[i].username = ep.username || '';
      // Normalize avatar to avatarX.png
      const av = ep.avatar_url || '';
      players[i].avatar_url = av.startsWith('/images/') ? av.replace('/images/', '') : av;
    }
  }

  const card = (index: number) => `
    <div class="w-full flex flex-col items-center gap-3 sm:gap-4 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500 p-4 sm:p-5 lg:p-6">
      <div class="text-lg sm:text-xl font-semibold text-white mb-1">${i18n.t('demo.player') || 'Player'} ${index + 1}</div>
      <div class="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
        ${[1, 2, 3, 4].map(a => `
          <img src="/images/avatar${a}.png" data-slot="${index}" data-avatar="avatar${a}.png" 
               class="avatar-select w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-2 border-gray-600 cursor-pointer hover:scale-105 transition ring-0 ring-offset-2 ring-offset-gray-900" />
        `).join('')}
      </div>
      <input type="text" data-name="${index}" placeholder="${i18n.t('demo.namePlaceholder') || 'Nombre del jugador'}"
             class="mt-2 w-full px-3 py-2 rounded bg-gray-800 text-white text-center" maxlength="16" />
    </div>
  `;

  app.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      <!-- Header (igual estilo que el resto) -->
      <div class="w-full max-w-7xl mx-auto mb-4 sm:mb-6">
        <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(255,215,0,0.20)] outline outline-2 outline-offset-[-2px] outline-yellow-400 p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 bg-yellow-500/20 rounded-full grid place-items-center">🏆</div>
              <div>
                <h1 class="text-xl sm:text-2xl font-bold text-white">${t.name}</h1>
                <div class="text-gray-400 text-sm">${i18n.t('tournament.playersLabel') || 'Número de Jugadores'}: ${t.size}</div>
              </div>
            </div>
            <button id="backToLanding" class="h-10 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm">
              ← ${i18n.t('general.back') || 'Volver'}
            </button>
          </div>
        </div>
      </div>

      <!-- Grid jugadores -->
      <div class="flex-1 flex flex-col items-center gap-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-6xl px-2">
          ${Array.from({ length: t.size }, (_, i) => card(i)).join('')}
        </div>

        <!-- Botón continuar -->
        <div class="w-full max-w-[540px] flex gap-2 sm:gap-3 px-2">
          <button id="continueToLobby" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-700 hover:bg-cyan-800 
                  rounded-lg justify-center items-center transition-colors disabled:opacity-50" disabled>
            <div class="text-white text-base sm:text-lg font-bold">${i18n.t('common.continue') || 'Continuar'}</div>
          </button>
        </div>
      </div>

      <div class="mt-2 sm:mt-4">${renderFooter()}</div>
    </div>
  `;
  initFooter();
  document.getElementById('backToLanding')?.addEventListener('click', () => navigateTo('/landing'));

  function validate() {
    const ok = players.every(p => p.username && p.avatar_url);
    (document.getElementById('continueToLobby') as HTMLButtonElement).disabled = !ok;
  }

  document.querySelectorAll<HTMLImageElement>('.avatar-select').forEach(img => {
    img.addEventListener('click', e => {
      const el = e.currentTarget as HTMLImageElement;
      const slot = parseInt(el.dataset.slot || '0', 10);
      const avatar = el.dataset.avatar || '';
      const siblings = el.parentElement?.querySelectorAll('.avatar-select') || [];
      siblings.forEach(s => {
        s.classList.remove('border-cyan-400', 'ring-2', 'ring-cyan-400');
      });
      // Destacar el avatar seleccionado como en el Demo: anillo visible y borde cian
      el.classList.add('border-cyan-400', 'ring-2', 'ring-cyan-400');
      players[slot].avatar_url = avatar;
      validate();
    });
  });

  // After DOM is ready, apply prefilled values and highlights
  document.querySelectorAll<HTMLInputElement>('input[data-name]').forEach(inp => {
    const slot = parseInt(inp.dataset.name || '0', 10);
    if (players[slot]?.username) inp.value = players[slot].username;
  });
  // Highlight selected avatars if any
  for (let i = 0; i < t.size; i++) {
    const sel = players[i]?.avatar_url;
    if (!sel) continue;
    const container = document.querySelector(`img.avatar-select[data-slot="${i}"]`)?.parentElement;
    if (!container) continue;
    container.querySelectorAll('.avatar-select').forEach(s => s.classList.remove('border-cyan-400', 'ring-2', 'ring-cyan-400'));
    const target = container.querySelector(`img.avatar-select[data-avatar="${sel}"]`) as HTMLImageElement | null;
    if (target) target.classList.add('border-cyan-400', 'ring-2', 'ring-cyan-400');
  }
  // Validate to enable continue if all set
  validate();

  document.querySelectorAll<HTMLInputElement>('input[data-name]').forEach(inp => {
    inp.addEventListener('input', e => {
      const el = e.currentTarget as HTMLInputElement;
      const slot = parseInt(el.dataset.name || '0', 10);
      players[slot].username = el.value.trim();
      validate();
    });
  });

  document.getElementById('continueToLobby')?.addEventListener('click', () => {
    LocalTournamentService.addOrUpdateParticipants(players);
    navigateTo('/local-tournament/lobby');
  });
}