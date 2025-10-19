import i18n from '../core/i18n';
import { navigateTo } from '../core/router';
import { LocalTournamentService } from './LocalTournamentService';

type TournamentData = { name: string; size: 4 | 8 };

export const renderLocalTournamentModal = (): string => `
  <div id="tournamentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200 ease-out" id="tournamentModalBackdrop"></div>
    <div class="relative w-full max-w-[560px] bg-gray-900 rounded-2xl outline outline-2 outline-yellow-400 p-6 opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95 transition-all duration-200 ease-out" id="tournamentModalPanel">
      <button id="closeTournamentModal" class="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white rounded-full">×</button>
      <h2 class="text-2xl font-bold text-white mb-4">🏆 ${i18n.t('tournament.createTitle') || 'Crear Torneo'}</h2>
      <form id="tournamentForm" class="space-y-5">
        <div>
          <label class="text-white text-sm block mb-2">${i18n.t('tournament.nameLabel') || 'Nombre del Torneo'}</label>
          <input id="tournamentName" name="tournamentName" maxlength="50" required
                 class="w-full h-11 px-3 rounded bg-white text-black" 
                 placeholder="Mi Torneo" />
        </div>
        <div>
          <label class="text-white text-sm block mb-2">${i18n.t('tournament.playersLabel') || 'Número de Jugadores'}</label>
          <select id="size" name="size" required class="w-full h-11 px-3 rounded bg-white text-black">
            <option value="4">4 jugadores</option>
            <option value="8">8 jugadores</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">* Solo 4 u 8</p>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" id="cancelTournament" class="flex-1 h-11 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
            ${i18n.t('common.cancel') || 'Cancelar'}
          </button>
          <button type="submit" id="createTournament" class="flex-1 h-11 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg">
            ${i18n.t('tournament.create') || 'Crear'}
          </button>
        </div>
      </form>
    </div>
  </div>
`;

let _cleanup: (() => void) | null = null;

export function showLocalTournamentModal(): void {
  closeLocalTournamentModal();
  const container = document.createElement('div');
  container.id = 'tournamentModalContainer';
  container.innerHTML = renderLocalTournamentModal();
  document.body.appendChild(container);
  document.body.style.overflow = 'hidden';

  const closeBtn = container.querySelector('#closeTournamentModal') as HTMLButtonElement | null;
  const backdrop = container.querySelector('#tournamentModalBackdrop') as HTMLElement | null;
  const panel = container.querySelector('#tournamentModalPanel') as HTMLElement | null;
  const cancelBtn = container.querySelector('#cancelTournament') as HTMLButtonElement | null;
  const form = container.querySelector('#tournamentForm') as HTMLFormElement;
  const nameInput = container.querySelector('#tournamentName') as HTMLInputElement | null;
  const sizeSelect = container.querySelector('#size') as HTMLSelectElement | null;

  const closeAndGoLanding = () => {
    closeLocalTournamentModal();
    navigateTo('/landing');
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const name = (form.querySelector('#tournamentName') as HTMLInputElement).value.trim();
    const size = parseInt((form.querySelector('#size') as HTMLSelectElement).value, 10) as 4 | 8;
    if (!name) { alert(i18n.t('tournament.nameRequired') || 'El nombre del torneo es obligatorio'); return; }
    if (size !== 4 && size !== 8) { alert('Solo 4 u 8 jugadores permitidos'); return; }

    LocalTournamentService.create(name, size);
    closeLocalTournamentModal();
    navigateTo('/local-tournament/setup');
  };

  closeBtn?.addEventListener('click', closeAndGoLanding);
  backdrop?.addEventListener('click', closeAndGoLanding);
  cancelBtn?.addEventListener('click', closeAndGoLanding);
  form?.addEventListener('submit', onSubmit);

  _cleanup = () => {
    closeBtn?.removeEventListener('click', closeAndGoLanding);
    backdrop?.removeEventListener('click', closeAndGoLanding);
    cancelBtn?.removeEventListener('click', closeAndGoLanding);
    form?.removeEventListener('submit', onSubmit);
  };

  // Prefill with existing tournament or last used prefs
  const existing = LocalTournamentService.get();
  if (existing) {
    if (nameInput) nameInput.value = existing.name;
    if (sizeSelect) sizeSelect.value = String(existing.size);
  } else {
    const prefs = LocalTournamentService.getPrefs?.();
    if (prefs) {
      // No prefill name after finishing a tournament; only keep size as convenience
      if (nameInput) nameInput.value = '';
      if (sizeSelect) sizeSelect.value = String(prefs.size);
    }
  }

  // Close modal on route change/back
  const onPopstate = () => closeLocalTournamentModal();
  window.addEventListener('popstate', onPopstate);
  const prevCleanup = _cleanup;
  _cleanup = () => {
    prevCleanup && prevCleanup();
    window.removeEventListener('popstate', onPopstate);
  };

  // Enter animation
  requestAnimationFrame(() => {
    if (backdrop) backdrop.classList.add('opacity-100');
    if (panel) {
      panel.classList.add('opacity-100', 'translate-y-0', 'sm:scale-100');
      panel.classList.remove('translate-y-4', 'sm:scale-95');
    }
  });
}

export function closeLocalTournamentModal(): void {
  const container = document.getElementById('tournamentModalContainer');
  const backdrop = container?.querySelector('#tournamentModalBackdrop') as HTMLElement | null;
  const panel = container?.querySelector('#tournamentModalPanel') as HTMLElement | null;

  if (!container) {
    _cleanup?.();
    _cleanup = null;
    document.body.style.overflow = '';
    return;
  }

  // Exit animation
  if (backdrop) backdrop.classList.remove('opacity-100');
  if (panel) {
    panel.classList.remove('opacity-100', 'translate-y-0', 'sm:scale-100');
    panel.classList.add('translate-y-4', 'sm:scale-95');
  }

  // Cleanup listeners immediately
  _cleanup?.();
  _cleanup = null;

  // Remove after transition
  const DURATION = 200;
  setTimeout(() => {
    container.remove();
    document.body.style.overflow = '';
  }, DURATION);
}