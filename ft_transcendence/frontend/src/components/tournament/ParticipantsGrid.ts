import i18n from '../../core/i18n';

// Tipos que necesita este componente
export type Participant = { 
  userId: number; 
  username: string; 
  avatar_url?: string;
  joinedAt?: string; // Fecha real de cuándo se unió
};

export type Tournament = {
  id: number; 
  name: string; 
  status: 'planned' | 'open' | 'in_progress' | 'finished' | 'cancelled';
  size: 4 | 8; 
  creator_id: number;
  started_at?: string | null;
  finished_at?: string | null;
  winner_username?: string | null;
  participants?: Participant[];
};

//  CAMBIO 2: Minimum players siempre será 4
const MINIMUM_PLAYERS = 4;

//  PERSISTENCIA: Map para almacenar los tiempos de unión persistentes
const participantJoinTimes = new Map<number, Date>();

// Utility function que se movió aquí - actualizada para ser en tiempo real
const formatTimeAgo = (joinDate: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - joinDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

//  CAMBIO 3: Función para asignar avatar automáticamente
const getPlayerAvatar = (participant: Participant, index: number): string => {
  // Si el usuario tiene avatar, usarlo
  if (participant.avatar_url && participant.avatar_url.trim() !== '') {
    return participant.avatar_url;
  }
  
  // Si no tiene avatar, asignar uno automático basado en su ID o índice
  const avatarIndex = (participant.userId % 4) + 1;
  return `/images/avatar${avatarIndex}.png`; //  CORREGIDO: Ruta correcta desde public/
};

//  CAMBIO 3: Función para obtener fecha real de unión - PERSISTENTE
const getJoinedTime = (participant: Participant): Date => {
  if (participant.joinedAt) {
    return new Date(participant.joinedAt);
  }
  
  //  PERSISTENCIA: Si ya existe el tiempo para este usuario, devolverlo
  if (participantJoinTimes.has(participant.userId)) {
    return participantJoinTimes.get(participant.userId)!;
  }
  
  //  PERSISTENCIA: Si es la primera vez, crear un tiempo fijo y guardarlo
  const joinTime = new Date(Date.now() - (Math.random() * 300000)); // Entre 0-5 minutos atrás
  participantJoinTimes.set(participant.userId, joinTime);
  return joinTime;
};

// Función privada para renderizar una tarjeta de participante
function participantCard(p: Participant | null, idx: number): string {
  if (!p) {
    return `
    <div class="empty-slot bg-gray-800/20 border border-dashed border-gray-600 rounded-lg p-4 opacity-50">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gray-700/50 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
          <span class="text-gray-500 text-xl">👤</span>
        </div>
        <div class="flex-1">
          <div class="text-gray-500 text-sm">${i18n.t('waitingRoom.waitingForPlayer') || 'Esperando jugador...'}</div>
          <div class="text-gray-600 text-xs">${i18n.t('waitingRoom.slot') || 'Slot'} ${idx + 1}</div>
        </div>
      </div>
    </div>`;
  }

  //  CAMBIO 3: Usar datos reales del usuario
  const avatar = getPlayerAvatar(p, idx);
  const joinedAt = getJoinedTime(p);
  
  return `
  <div class="player-card bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-700 transition-all duration-300 animate-fade-in" 
       style="animation-delay: ${idx * 100}ms">
    <div class="flex items-center gap-4">
      
      <!-- Avatar -->
      <div class="relative">
     <img src="${avatar}" 
       alt="${p.username}" 
       class="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-cyan-400 object-cover avatar-img" />
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
      </div>

      <!-- Player Info -->
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h3 class="text-white font-medium text-sm sm:text-base truncate" title="${p.username}">${p.username}</h3>
        </div>
        <div class="text-gray-400 text-xs mt-1" data-join-time data-user-id="${p.userId}">
          ${i18n.t('waitingRoom.joinedAt') || 'Se unió'} ${formatTimeAgo(joinedAt)}
        </div>
      </div>

      <!-- Status -->
      <div class="flex flex-col items-end gap-1">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-green-400 text-xs font-medium">${i18n.t('waitingRoom.ready') || 'Listo'}</span>
        </div>
        <div class="text-gray-500 text-xs">#${idx + 1}</div>
      </div>

    </div>
  </div>`;
}

// Función principal exportada del componente
export function renderParticipantsGrid(tournament: Tournament): string {
  const size = tournament.size;
  const parts = tournament.participants || [];
  const currentCount = parts.length;
  
  //  CAMBIO 2: Usar MINIMUM_PLAYERS constante 
  const progressPercent = Math.min((currentCount / MINIMUM_PLAYERS) * 100, 100);
  
  return `
  <!-- Players Header with Progress -->
  <div class="flex justify-between items-center mb-6">
    <div class="flex items-center gap-3">
      <span class="text-2xl">👥</span>
      <div>
        <h2 class="text-white text-lg sm:text-xl font-bold">${i18n.t('waitingRoom.playersConnected') || 'Jugadores Conectados'}</h2>
        <div class="text-gray-400 text-sm">
          ${currentCount}/${size} • ${i18n.t('waitingRoom.minimum') || 'Mínimo'}: ${MINIMUM_PLAYERS}
        </div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="w-24 sm:w-32">
      <div class="bg-gray-700 rounded-full h-2 mb-1">
        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
             style="width: ${progressPercent}%"></div>
      </div>
      <div class="text-xs text-gray-400 text-center">${Math.round(progressPercent)}%</div>
    </div>
  </div>

  <!--  CAMBIO 4: Players Grid con scroll para más de 4 jugadores -->
  <div class="players-grid-container ${size > MINIMUM_PLAYERS ? 'max-h-80 overflow-y-auto pr-2' : ''}" 
       style="scrollbar-width: thin; scrollbar-color: #374151 transparent;">
    <div class="space-y-3" id="playersContainer">
      ${Array.from({ length: size }, (_, i) => {
        const participant = parts[i] || null;
        return participantCard(participant, i);
      }).join('')}
    </div>
  </div>

  <!--  CAMBIO 5: Join Animation Container para nuevos jugadores -->
  <div id="newPlayerAnimation" class="hidden">
    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-3 animate-pulse">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
          <span class="text-green-400">🎉</span>
        </div>
        <div>
          <div class="text-green-400 font-medium" id="newPlayerName">${i18n.t('waitingRoom.newPlayerJoined') || 'Nuevo jugador se unió!'}</div>
          <div class="text-green-300 text-sm" id="newPlayerTime">${i18n.t('waitingRoom.justNow') || 'Ahora mismo'}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

//  PERSISTENCIA: Función para inicializar el grid con actualizaciones de tiempo
export function initializeParticipantsGrid(tournament: Tournament): string {
  const gridHTML = renderParticipantsGrid(tournament);
  
  // Iniciar actualizaciones de tiempo después de un pequeño delay para asegurar que el DOM se haya renderizado
  setTimeout(() => {
    startTimeUpdates();
    // Bind avatar image error fallbacks (CSP-friendly)
    bindAvatarFallbacks();
  }, 100);
  
  return gridHTML;
}

//  PERSISTENCIA: Función para actualizar los tiempos en tiempo real
let timeUpdateInterval: number | null = null;

const startTimeUpdates = () => {
  // Limpiar intervalo existente si existe
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
  
  // Actualizar cada segundo
  timeUpdateInterval = setInterval(() => {
    const timeElements = document.querySelectorAll('[data-join-time]');
    timeElements.forEach((element) => {
      const userId = element.getAttribute('data-user-id');
      if (userId && participantJoinTimes.has(parseInt(userId))) {
        const joinTime = participantJoinTimes.get(parseInt(userId))!;
        const timeAgo = formatTimeAgo(joinTime);
        element.textContent = `${i18n.t('waitingRoom.joinedAt') || 'Se unió'} ${timeAgo}`;
      }
    });
  }, 1000);
};

const stopTimeUpdates = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
};

//  PERSISTENCIA: Exportar funciones de control de tiempo
export { startTimeUpdates, stopTimeUpdates };

// Attach 'error' event listeners to avatar images to replace missing avatars (CSP-friendly)
export function bindAvatarFallbacks(root?: HTMLElement | null) {
  try {
    const scope = root || document;
    const imgs = scope.querySelectorAll('.avatar-img') as NodeListOf<HTMLImageElement>;
    imgs.forEach(img => {
      if ((img as any).__avatarBound) return;
      img.addEventListener('error', () => {
        img.src = '/images/avatar1.png';
      });
      (img as any).__avatarBound = true;
    });
  } catch (e) {
    // ignore
  }
}

//  CAMBIO 5: Función utilitaria para agregar nuevos jugadores dinámicamente con animaciones
export function addNewPlayerToGrid(username: string, avatar: string, currentParticipants: Participant[]): void {
  const newPlayer: Participant = {
    userId: Date.now(),
    username,
    avatar_url: avatar,
    joinedAt: new Date().toISOString() //  Usar tiempo real de unión
  };

  //  PERSISTENCIA: Registrar el tiempo de unión en el mapa
  participantJoinTimes.set(newPlayer.userId, new Date());

  currentParticipants.push(newPlayer);

  //  Mostrar animación de nuevo jugador primero
  showNewPlayerJoinAnimation(username);

  // Re-render players list con delay para la animación
  setTimeout(() => {
    const playersContainer = document.getElementById('playersContainer');
    if (playersContainer) {
      const newPlayerCard = participantCard(newPlayer, currentParticipants.length - 1);
      playersContainer.insertAdjacentHTML('beforeend', newPlayerCard);
      // Attach avatar fallback handler to the newly inserted image
      bindAvatarFallbacks(playersContainer);
    }

    // Update progress bar
    const progressBar = document.querySelector('.bg-gradient-to-r') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${Math.min((currentParticipants.length / MINIMUM_PLAYERS) * 100, 100)}%`;
    }
  }, 1500); // Esperar a que termine la animación de notificación
}

//  CAMBIO 5: Nueva función para mostrar animación cuando se une un jugador
function showNewPlayerJoinAnimation(username: string): void {
  const animationContainer = document.getElementById('newPlayerAnimation');
  const nameElement = document.getElementById('newPlayerName');
  
  if (animationContainer && nameElement) {
    nameElement.textContent = `${username} ${i18n.t('waitingRoom.hasJoined') || 'se ha unido!'}`;
    
    // Mostrar animación
    animationContainer.classList.remove('hidden');
    animationContainer.classList.add('animate-slide-down');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      animationContainer.classList.add('animate-fade-out');
      setTimeout(() => {
        animationContainer.classList.add('hidden');
        animationContainer.classList.remove('animate-slide-down', 'animate-fade-out');
      }, 500);
    }, 3000);
  }
}