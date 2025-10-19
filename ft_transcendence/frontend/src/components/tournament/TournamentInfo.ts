import i18n from '../../core/i18n';

//  Importamos la interfaz Tournament de ParticipantsGrid para mantener compatibilidad
import { type Tournament } from './ParticipantsGrid';

//  Utility function para formatear tiempo
const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

//  Función principal para renderizar la información del torneo
export function renderTournamentInfo(tournament: Tournament): string {
    const createdAt = tournament.started_at ? new Date(tournament.started_at) : new Date();
    const participantCount = tournament.participants?.length || 0;
    
    return `
    <div class="bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(128,90,213,0.20)] outline outline-2 outline-offset-[-2px] outline-purple-400 p-4 sm:p-5">
      <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span class="text-purple-400">ℹ️</span>
        ${i18n.t('waitingRoom.tournamentInfo') || 'Información del Torneo'}
      </h3>
      
      <div class="space-y-3">
        <!-- Formato del torneo -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.format') || 'Formato'}:</span>
          <span class="text-white text-sm font-medium">⚔️ ${i18n.t('waitingRoom.knockout') || 'Knockout'}</span>
        </div>
        
        <!-- Tiempo por partido -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.timeLimit') || 'Tiempo por partido'}:</span>
          <span class="text-white text-sm font-medium">∞ ${i18n.t('waitingRoom.noTimeLimit') || 'Sin límite'}</span>
        </div>
        
        <!-- Máximo de jugadores -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.maxPlayers') || 'Máximo jugadores'}:</span>
          <span class="text-white text-sm font-medium">👥 ${tournament.size}</span>
        </div>
        
        <!-- Participantes actuales -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.participants') || 'Participantes'}:</span>
          <span class="text-white text-sm font-medium ${participantCount === tournament.size ? 'text-green-400' : ''}">${participantCount}/${tournament.size}</span>
        </div>
        
        <!-- Estado del torneo -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.status') || 'Estado'}:</span>
          <span class="text-white text-sm font-medium ${getStatusColor(tournament.status)}">${getStatusText(tournament.status)}</span>
        </div>
        
        <!-- Tiempo de creación -->
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">${i18n.t('waitingRoom.created') || 'Creado'}:</span>
          <span class="text-white text-sm font-medium">${formatTimeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  `;
}

//  Función auxiliar para obtener el color del estado
function getStatusColor(status: string): string {
    switch (status) {
        case 'planned':
            return 'text-gray-400';
        case 'open':
            return 'text-orange-400';
        case 'in_progress':
            return 'text-blue-400';
        case 'finished':
            return 'text-green-400';
        case 'cancelled':
            return 'text-red-400';
        default:
            return 'text-gray-400';
    }
}

//  Función auxiliar para obtener el texto del estado
function getStatusText(status: string): string {
    switch (status) {
        case 'planned':
            return i18n.t('waitingRoom.statusPlanned') || 'Planeado';
        case 'open':
            return i18n.t('waitingRoom.statusOpen') || 'Abierto';
        case 'in_progress':
            return i18n.t('waitingRoom.statusInProgress') || 'En progreso';
        case 'finished':
            return i18n.t('waitingRoom.statusFinished') || 'Finalizado';
        case 'cancelled':
            return i18n.t('waitingRoom.statusCancelled') || 'Cancelado';
        default:
            return i18n.t('waitingRoom.statusUnknown') || 'Desconocido';
    }
}

//  Función para actualizar la información del torneo en tiempo real
export function updateTournamentInfo(tournament: Tournament): void {
    const container = document.querySelector('[data-component="tournament-info"]');
    if (container) {
        container.innerHTML = renderTournamentInfo(tournament);
    }
}

//  Función para inicializar el componente con evento listeners si es necesario
export function initializeTournamentInfo(tournament: Tournament): string {
    return `<div data-component="tournament-info">${renderTournamentInfo(tournament)}</div>`;
}