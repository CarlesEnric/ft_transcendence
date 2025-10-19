import i18n from '../../core/i18n';
import { navigateTo } from '../../core/router';
//  Reutilizamos los tipos de ParticipantsGrid
import { type Participant, type Tournament } from './ParticipantsGrid';

//  Función principal para renderizar el header del torneo
export function renderTournamentHeader(
    tournament: Tournament,
    participants: Participant[],
    currentPage: 'lobby' | 'bracket' = 'lobby',
    mode: 'online' | 'local' = 'online',
    bracketReady: boolean = true
): string {
    // Calcular progreso de participantes
    const currentParticipants = participants.length;
    const maxParticipants = tournament.size;
    const progressPercentage = Math.round((currentParticipants / maxParticipants) * 100);
    
    // Determinar color del progreso
    let progressColor = 'bg-red-500'; // < 50%
    if (progressPercentage >= 100) progressColor = 'bg-green-500';
    else if (progressPercentage >= 75) progressColor = 'bg-yellow-500';
    else if (progressPercentage >= 50) progressColor = 'bg-orange-500';

    // Estado del torneo con colores
    const statusColors = {
        'planned': 'bg-gray-500',
        'open': 'bg-blue-500', 
        'in_progress': 'bg-yellow-500',
        'finished': 'bg-green-500',
        'cancelled': 'bg-red-500'
    };

    const statusTexts = {
        'planned': i18n.t('tournament.status.planned') || 'Planificado',
        'open': i18n.t('tournament.status.open') || 'Abierto',
        'in_progress': i18n.t('tournament.status.inProgress') || 'En Progreso',
        'finished': i18n.t('tournament.status.finished') || 'Finalizado',
        'cancelled': i18n.t('tournament.status.cancelled') || 'Cancelado'
    };

    return `
        <!-- Breadcrumb Navigation -->
        <div class="w-full max-w-7xl mx-auto mb-4 sm:mb-6">
            <div class="flex items-center gap-2 mb-4 text-sm">
                <button id="backButton" class="text-cyan-400 hover:text-cyan-300 transition-colors">
                    ← ${i18n.t('general.back') || (mode === 'local' ? 'Volver' : 'Volver al dashboard')}
                </button>
                <span class="text-gray-400">•</span>
                <span class="text-gray-300">${i18n.t('tournament.tournament') || 'Torneo'}</span>
                <span class="text-gray-400">•</span>
                <span class="text-white font-medium">${tournament.name}</span>
            </div>

            <!-- Tournament Header -->
            <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(255,215,0,0.20)] outline outline-2 outline-offset-[-2px] outline-yellow-400 p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    <!-- Tournament Info -->
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <span class="text-3xl">${currentPage === 'bracket' ? '⚔️' : '🏆'}</span>
                        </div>
                        <div>
                            <h1 class="text-xl sm:text-2xl font-bold text-white">${tournament.name}</h1>
                            <div class="flex items-center gap-4 mt-1">
                                <span class="text-yellow-400 text-sm font-medium">
                                    ${currentPage === 'bracket' ? 
                                        '🏆 ' + (i18n.t('bracket.tournamentInProgress') || 'Torneo en Progreso') : 
                                        '🎮 ' + (i18n.t('waitingRoom.tournament') || 'Torneo')
                                    }
                                </span>
                                <span class="text-gray-400 text-xs">ID: ${tournament.id}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="flex flex-col items-end gap-2">
                        <div class="px-4 py-2 ${tournament.status === 'open' ? 'bg-orange-600/20 border-orange-600/50' : 'bg-blue-600/20 border-blue-600/50'} border rounded-lg">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 ${tournament.status === 'open' ? 'bg-orange-400' : 'bg-blue-400'} rounded-full animate-pulse"></div>
                                <span class="${tournament.status === 'open' ? 'text-orange-400' : 'text-blue-400'} text-sm font-medium">
                                    ${tournament.status === 'open' ? 
                                        (i18n.t('waitingRoom.waitingForPlayers') || 'Esperando jugadores') : 
                                        statusTexts[tournament.status]
                                    }
                                </span>
                            </div>
                        </div>
                        <div class="text-gray-400 text-xs text-right">
                            ${currentParticipants} ${i18n.t('tournament.participants') || 'participantes'}
                        </div>
                        
                        <!-- Navegación entre páginas -->
                        <div class="flex bg-gray-800 rounded-lg overflow-hidden">
                            <button id="navLobby" class="px-3 py-1 text-xs font-medium transition-colors ${currentPage === 'lobby' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:text-white hover:bg-gray-700'}">
                                ${i18n.t('tournament.lobby') || 'Lobby'}
                            </button>
                            <button id="navBracket" ${!bracketReady ? 'disabled' : ''} ${!bracketReady ? 'title="Empieza el torneo primero"' : ''}
                                class="px-3 py-1 text-xs font-medium transition-colors ${currentPage === 'bracket' 
                                    ? 'bg-yellow-500 text-black' 
                                    : (!bracketReady 
                                        ? 'text-gray-500 cursor-not-allowed opacity-50' 
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700')}">
                                ${i18n.t('tournament.bracket') || 'Bracket'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}

//  Función para configurar eventos del header
export function setupTournamentHeaderEvents(
    tournament: Tournament,
    currentPage: 'lobby' | 'bracket' = 'lobby',
    mode: 'online' | 'local' = 'online',
    bracketReady: boolean = true
): void {
    // Botón de volver
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            if (mode === 'local') {
                if (currentPage === 'bracket') navigateTo('/local-tournament/lobby');
                else navigateTo('/local-tournament/setup');
            } else {
                navigateTo('/');
            }
        });
    }

    // Navegación al lobby
    const navLobby = document.getElementById('navLobby');
    if (navLobby && currentPage !== 'lobby') {
        navLobby.addEventListener('click', () => {
            if (mode === 'local') navigateTo('/local-tournament/lobby');
            else navigateTo(`/tournaments/${tournament.id}`);
        });
    }

    // Navegación al bracket
    const navBracket = document.getElementById('navBracket');
    if (navBracket && currentPage !== 'bracket') {
        if (!bracketReady) {
            // no-op; show tooltip via title attribute in render
        } else {
            navBracket.addEventListener('click', () => {
                if (mode === 'local') navigateTo('/local-tournament/bracket');
                else navigateTo(`/tournaments/${tournament.id}/bracket`);
            });
        }
    }
}