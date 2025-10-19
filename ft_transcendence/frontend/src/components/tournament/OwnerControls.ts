import i18n from '../../core/i18n';
import { type Participant, type Tournament } from './ParticipantsGrid';

// Función principal exportada del componente OwnerControls
export function renderOwnerControls(t: Tournament, participants: Participant[]): string {
    //  CAMBIO: Ahora solo se activa cuando todos los slots están llenos (100%)
    const canStart = participants.length === t.size;
        const alreadyStarted = t.status === 'in_progress' || t.started_at;
    
    return `
    <div data-component="owner-controls" class="bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(255,215,0,0.20)] outline outline-2 outline-offset-[-2px] outline-yellow-400 p-4 sm:p-5">
      <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span class="text-yellow-400">👑</span>
        ${i18n.t('waitingRoom.ownerControls') || 'Controles del Organizador'}
      </h3>
      
      <div class="space-y-3">
                ${alreadyStarted ? `
                    <!-- View Tournament Button -->
                    <button id="btnViewTournament" 
                                    class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                        <span class="text-xl">📊</span>
                        ${i18n.t('tournament.viewTournament') || 'Ver Torneo'}
                    </button>
                ` : `
                    <!-- Start Tournament Button -->
                    <button id=\"btnStart\" 
                                    class=\"w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${!canStart ? 'opacity-50' : ''}\" 
                                    ${!canStart ? 'disabled' : ''}>
                        <span class=\"text-xl\"></span>
                        ${i18n.t('waitingRoom.startTournament') || 'Iniciar Torneo'}
                    </button>
                `}

        <!-- Settings Button -->
        <button id="tournamentSettings" class="w-full h-10 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          <img src="/icons/settings.png" alt="" class="w-4 h-4" />
          ${i18n.t('waitingRoom.settings') || 'Configuración'}
        </button>

        <!-- Cancel Tournament -->
        <button id="btnCancel" class="w-full h-10 bg-red-600/30 hover:bg-red-700/50 text-red-400 font-medium rounded-lg transition-colors border border-red-600/50">
          ${i18n.t('waitingRoom.cancelTournament') || 'Cancelar Torneo'}
        </button>

      </div>
    </div>
  `;
}

// Función para configurar los event listeners del componente
export function setupOwnerControlsEvents(
    tournament: Tournament, 
    onStart: () => Promise<void>,
    onCancel: () => Promise<void>,
    onSettings: () => void
): void {
    // Event listener para el botón de inicio
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
        btnStart.addEventListener('click', onStart);
    }
    const btnView = document.getElementById('btnViewTournament');
    if (btnView) {
        btnView.addEventListener('click', () => {
            // Navegar al bracket como vista por defecto del torneo en progreso
            // Nota: en entorno local, usamos ruta local
            location.pathname.startsWith('/local')
              ? (window.history.pushState({}, '', '/local-tournament/bracket'), window.dispatchEvent(new PopStateEvent('popstate')))
              : (window.history.pushState({}, '', `/tournaments/${tournament.id}/bracket`), window.dispatchEvent(new PopStateEvent('popstate')));
        });
    }

    // Event listener para el botón de cancelar
    const btnCancel = document.getElementById('btnCancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', onCancel);
    }

    // Event listener para configuración
    const tournamentSettings = document.getElementById('tournamentSettings');
    if (tournamentSettings) {
        tournamentSettings.addEventListener('click', onSettings);
    }
}

// Función utilitaria para verificar si se puede iniciar el torneo
export function canStartTournament(participants: Participant[], tournamentSize: number): boolean {
    //  CAMBIO: Ahora requiere que todos los slots estén llenos (100%)
    return participants.length === tournamentSize;
}

// Función para actualizar el estado del botón de inicio dinámicamente
export function updateStartButtonState(participants: Participant[], tournamentSize: number): void {
    const btnStart = document.getElementById('btnStart');
    const canStart = canStartTournament(participants, tournamentSize);
    
    if (btnStart) {
        if (canStart) {
            btnStart.removeAttribute('disabled');
            btnStart.classList.remove('opacity-50');
        } else {
            btnStart.setAttribute('disabled', 'true');
            btnStart.classList.add('opacity-50');
        }
    }
}

//  NUEVA: Función para mostrar mensaje de cancelación del torneo
export function showTournamentCancelledMessage(ownerUsername: string): void {
    const mainContent = document.getElementById('main-content') || document.getElementById('app');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="min-h-screen global-bg flex items-center justify-center p-4">
            <div class="max-w-lg w-full">
                <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(239,68,68,0.20)] outline outline-2 outline-offset-[-2px] outline-red-400 p-8 text-center">
                    <!-- Icono de cancelación -->
                    <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="text-4xl"></span>
                    </div>
                    
                    <!-- Título -->
                    <h1 class="text-2xl font-bold text-white mb-4">
                        ${i18n.t('tournament.tournamentCancelled') || 'Torneo Cancelado'}
                    </h1>
                    
                    <!-- Mensaje -->
                    <div class="text-gray-300 mb-6 space-y-2">
                        <p class="text-lg">
                            ${i18n.t('tournament.cancelledBy') || 'Cancelado por'}: 
                            <span class="text-red-400 font-semibold">${ownerUsername}</span>
                        </p>
                        <p class="text-sm text-gray-400">
                            ${i18n.t('tournament.cancelledMessage') || 'Este torneo ha sido cancelado por el organizador. Todos los participantes han sido notificados.'}
                        </p>
                    </div>
                    
                    <!-- Botón para volver -->
                    <button id="backToDashboard" class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors">
                        ${i18n.t('tournament.backToDashboard') || 'Volver al Dashboard'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Event listener para volver al dashboard
    document.getElementById('backToDashboard')?.addEventListener('click', () => {
        // Aquí deberías usar tu función de navegación
        // navigateTo('/dashboard'); 
        window.location.href = '/dashboard';
    });
}