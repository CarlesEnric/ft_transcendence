/**
 * Dashboard de partides - Historial i estadístiques de jocs
 * Component per visualitzar totes les partides jugades amb detalls
 */

interface Match {
  id: number;
  player1: {
    id: number;
    username: string;
    avatar?: string;
  };
  player2: {
    id: number;
    username: string;
    avatar?: string;
  };
  score: {
    player1: number;
    player2: number;
  };
  duration: number; // en segons
  startedAt: string;
  endedAt: string;
  winner: number;
  gameMode: 'classic' | 'speed' | 'tournament';
  status: 'completed' | 'abandoned' | 'disconnected';
}

interface MatchesStats {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  averageGameDuration: number;
  longestGame: number;
  bestWinStreak: number;
  currentStreak: number;
  favoriteGameMode: string;
}

/**
 * Crear el dashboard de partides
 */
export function createMatchesDashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'matches-dashboard-container';
  
  container.innerHTML = `
    <div class="matches-dashboard">
      <!-- Header -->
      <div class="matches-header">
        <div class="header-content">
          <h1>📊 Dashboard de Partides</h1>
          <p>Historial complet i estadístiques dels teus jocs</p>
        </div>
        
        <div class="header-actions">
          <button class="filter-btn" onclick="toggleFilters()">
            🔍 Filtres
          </button>
          <button class="export-btn" onclick="exportMatches()">
            📥 Exportar
          </button>
          <button class="refresh-btn" onclick="refreshMatches()">
            🔄 Actualitzar
          </button>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-overview">
        <div class="stat-card primary">
          <div class="stat-icon">🎮</div>
          <div class="stat-content">
            <span class="stat-value" id="total-matches">0</span>
            <span class="stat-label">Total Partides</span>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <span class="stat-value" id="total-wins">0</span>
            <span class="stat-label">Victories</span>
          </div>
        </div>
        
        <div class="stat-card error">
          <div class="stat-icon">💔</div>
          <div class="stat-content">
            <span class="stat-value" id="total-losses">0</span>
            <span class="stat-label">Derrotes</span>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <span class="stat-value" id="win-rate">0%</span>
            <span class="stat-label">% Victories</span>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value" id="avg-duration">0:00</span>
            <span class="stat-label">Durada Mitjana</span>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <span class="stat-value" id="current-streak">0</span>
            <span class="stat-label">Ratxa Actual</span>
          </div>
        </div>
      </div>
      
      <!-- Filters Panel -->
      <div id="filters-panel" class="filters-panel" style="display: none;">
        <div class="filters-content">
          <div class="filter-group">
            <label>Període:</label>
            <select id="period-filter">
              <option value="all">Tots els temps</option>
              <option value="today">Avui</option>
              <option value="week">Aquesta setmana</option>
              <option value="month">Aquest mes</option>
              <option value="year">Aquest any</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Mode de joc:</label>
            <select id="mode-filter">
              <option value="all">Tots els modes</option>
              <option value="classic">Clàssic</option>
              <option value="speed">Velocitat</option>
              <option value="tournament">Torneig</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Resultat:</label>
            <select id="result-filter">
              <option value="all">Tots</option>
              <option value="wins">Només victories</option>
              <option value="losses">Només derrotes</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Oponent:</label>
            <input type="text" id="opponent-filter" placeholder="Nom d'usuari...">
          </div>
          
          <div class="filter-actions">
            <button class="apply-filters-btn" onclick="applyFilters()">
              Aplicar Filtres
            </button>
            <button class="clear-filters-btn" onclick="clearFilters()">
              Netejar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Matches List -->
      <div class="matches-section">
        <div class="section-header">
          <h2>Historial de Partides</h2>
          <div class="view-toggle">
            <button class="view-btn active" data-view="list" onclick="switchView('list')">
              📋 Llista
            </button>
            <button class="view-btn" data-view="grid" onclick="switchView('grid')">
              ⚏ Graella
            </button>
          </div>
        </div>
        
        <div id="matches-container" class="matches-container">
          <div class="loading-matches">
            <div class="loading-spinner">⏳</div>
            <p>Carregant partides...</p>
          </div>
        </div>
        
        <!-- Pagination -->
        <div id="pagination" class="pagination" style="display: none;">
          <button class="page-btn" onclick="goToPage('prev')">‹ Anterior</button>
          <span class="page-info">
            Pàgina <span id="current-page">1</span> de <span id="total-pages">1</span>
          </span>
          <button class="page-btn" onclick="goToPage('next')">Següent ›</button>
        </div>
      </div>
    </div>
    
    <style>
      .matches-dashboard-container {
        min-height: 100vh;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .matches-dashboard {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }
      
      /* Header */
      .matches-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding: 24px;
        background: white;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
      }
      
      .header-content h1 {
        margin: 0 0 8px 0;
        color: #1f2937;
        font-size: 28px;
        font-weight: 700;
      }
      
      .header-content p {
        margin: 0;
        color: #6b7280;
        font-size: 16px;
      }
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
      
      .filter-btn, .export-btn, .refresh-btn {
        padding: 10px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #f9fafb;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }
      
      .filter-btn:hover, .export-btn:hover, .refresh-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
      
      /* Stats Overview */
      .stats-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .stat-card.primary { border-left-color: #3b82f6; }
      .stat-card.success { border-left-color: #10b981; }
      .stat-card.error { border-left-color: #ef4444; }
      .stat-card.info { border-left-color: #06b6d4; }
      .stat-card.warning { border-left-color: #f59e0b; }
      .stat-card.purple { border-left-color: #8b5cf6; }
      
      .stat-icon {
        font-size: 28px;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 50%;
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-top: 4px;
      }
      
      /* Filters Panel */
      .filters-panel {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 24px;
        overflow: hidden;
      }
      
      .filters-content {
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        align-items: end;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .filter-group label {
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }
      
      .filter-group select,
      .filter-group input {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        background: white;
      }
      
      .filter-group select:focus,
      .filter-group input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .filter-actions {
        display: flex;
        gap: 8px;
      }
      
      .apply-filters-btn {
        padding: 8px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .clear-filters-btn {
        padding: 8px 16px;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      
      /* Matches Section */
      .matches-section {
        background: white;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        background: #f8fafc;
      }
      
      .section-header h2 {
        margin: 0;
        color: #1f2937;
        font-size: 20px;
      }
      
      .view-toggle {
        display: flex;
        gap: 4px;
      }
      
      .view-btn {
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        background: white;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }
      
      .view-btn:first-child {
        border-radius: 6px 0 0 6px;
      }
      
      .view-btn:last-child {
        border-radius: 0 6px 6px 0;
      }
      
      .view-btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      
      /* Matches Container */
      .matches-container {
        min-height: 400px;
        padding: 24px;
      }
      
      .loading-matches {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #6b7280;
      }
      
      .loading-spinner {
        font-size: 32px;
        margin-bottom: 16px;
        animation: spin 2s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Match Item (List View) */
      .match-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto auto;
        gap: 16px;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
      }
      
      .match-item:hover {
        background: #f8fafc;
      }
      
      .match-item:last-child {
        border-bottom: none;
      }
      
      .match-result {
        font-size: 18px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
      }
      
      .match-result.win {
        background: #dcfce7;
        color: #15803d;
      }
      
      .match-result.loss {
        background: #fee2e2;
        color: #dc2626;
      }
      
      .match-players {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .player {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      
      .player-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
      
      .match-score {
        font-family: monospace;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .match-duration {
        color: #6b7280;
        font-size: 14px;
      }
      
      .match-date {
        color: #6b7280;
        font-size: 14px;
        text-align: right;
      }
      
      /* Match Card (Grid View) */
      .matches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      
      .match-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        transition: all 0.2s;
      }
      
      .match-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }
      
      /* Pagination */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-top: 1px solid #e5e7eb;
        background: #f8fafc;
      }
      
      .page-btn {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .page-btn:hover {
        background: #f3f4f6;
      }
      
      .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .page-info {
        color: #6b7280;
        font-size: 14px;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .matches-header {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
        
        .header-actions {
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .stats-overview {
          grid-template-columns: 1fr;
        }
        
        .filters-content {
          grid-template-columns: 1fr;
        }
        
        .match-item {
          grid-template-columns: 1fr;
          gap: 8px;
          text-align: center;
        }
        
        .section-header {
          flex-direction: column;
          gap: 12px;
        }
      }
    </style>
  `;
  
  // Configurar esdeveniments
  setupMatchesEvents(container);
  
  // Carregar dades inicials
  loadMatchesData();
  
  return container;
}

/**
 * Configurar esdeveniments del dashboard de partides
 */
function setupMatchesEvents(container: HTMLElement): void {
  (window as any).toggleFilters = () => {
    const panel = container.querySelector('#filters-panel') as HTMLElement;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };
  
  (window as any).exportMatches = () => {
    showToast('Exportant dades de partides...', 'info');
    // Implementar exportació
  };
  
  (window as any).refreshMatches = () => {
    loadMatchesData();
  };
  
  (window as any).applyFilters = () => {
    const filters = getFilterValues(container);
    loadMatchesData(filters);
    showToast('Filtres aplicats', 'success');
  };
  
  (window as any).clearFilters = () => {
    clearFilterValues(container);
    loadMatchesData();
    showToast('Filtres netejats', 'info');
  };
  
  (window as any).switchView = (view: string) => {
    const buttons = container.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = container.querySelector(`[data-view="${view}"]`);
    activeBtn?.classList.add('active');
    
    renderMatches(container, currentMatches, view);
  };
  
  (window as any).goToPage = (direction: string) => {
    // Implementar paginació
    showToast(`Anant a la pàgina ${direction}`, 'info');
  };
}

/**
 * Variable global per mantenir les partides actuals
 */
let currentMatches: Match[] = [];

/**
 * Carregar dades de partides
 */
async function loadMatchesData(filters?: any): Promise<void> {
  try {
    showMatchesLoading(true);
    
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await fetch(`/api/matches?${queryParams}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      currentMatches = data.matches;
      updateMatchesStats(data.stats);
      renderMatches(document.querySelector('.matches-dashboard-container')!, data.matches);
    } else {
      showToast('Error carregant partides', 'error');
    }
  } catch (error) {
    showToast('Error de connexió', 'error');
  } finally {
    showMatchesLoading(false);
  }
}

/**
 * Actualitzar estadístiques
 */
function updateMatchesStats(stats: MatchesStats): void {
  const elements = {
    'total-matches': stats.totalMatches.toString(),
    'total-wins': stats.totalWins.toString(),
    'total-losses': stats.totalLosses.toString(),
    'win-rate': `${stats.winRate}%`,
    'avg-duration': formatDuration(stats.averageGameDuration),
    'current-streak': stats.currentStreak.toString()
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

/**
 * Renderitzar partides
 */
function renderMatches(container: HTMLElement, matches: Match[], view: string = 'list'): void {
  const matchesContainer = container.querySelector('#matches-container') as HTMLElement;
  
  if (matches.length === 0) {
    matchesContainer.innerHTML = `
      <div class="no-matches">
        <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
        <h3>No hi ha partides</h3>
        <p>Juga la teva primera partida per veure l'historial aquí!</p>
      </div>
    `;
    return;
  }
  
  if (view === 'grid') {
    matchesContainer.innerHTML = `
      <div class="matches-grid">
        ${matches.map(match => createMatchCard(match)).join('')}
      </div>
    `;
  } else {
    matchesContainer.innerHTML = `
      <div class="matches-list">
        ${matches.map(match => createMatchListItem(match)).join('')}
      </div>
    `;
  }
  
  // Mostrar paginació si cal
  const pagination = container.querySelector('#pagination') as HTMLElement;
  if (matches.length > 20) {
    pagination.style.display = 'flex';
  }
}

/**
 * Crear element de partida per vista de llista
 */
function createMatchListItem(match: Match): string {
  const isWinner = match.winner === getCurrentUserId();
  const opponent = match.player1.id === getCurrentUserId() ? match.player2 : match.player1;
  
  return `
    <div class="match-item">
      <div class="match-result ${isWinner ? 'win' : 'loss'}">
        ${isWinner ? 'V' : 'D'}
      </div>
      
      <div class="match-players">
        <div class="player">
          <div class="player-avatar">👤</div>
          <span>Tu</span>
        </div>
        <div class="player">
          <div class="player-avatar">👤</div>
          <span>${opponent.username}</span>
        </div>
      </div>
      
      <div class="match-score">
        ${match.score.player1} - ${match.score.player2}
      </div>
      
      <div class="match-duration">
        ${formatDuration(match.duration)}
      </div>
      
      <div class="match-date">
        ${formatDate(match.endedAt)}
      </div>
    </div>
  `;
}

/**
 * Crear targeta de partida per vista de graella
 */
function createMatchCard(match: Match): string {
  const isWinner = match.winner === getCurrentUserId();
  const opponent = match.player1.id === getCurrentUserId() ? match.player2 : match.player1;
  
  return `
    <div class="match-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="match-result ${isWinner ? 'win' : 'loss'}">
          ${isWinner ? 'Victòria' : 'Derrota'}
        </span>
        <span style="color: #6b7280; font-size: 12px;">
          ${formatDate(match.endedAt)}
        </span>
      </div>
      
      <div style="text-align: center; margin: 16px 0;">
        <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          ${match.score.player1} - ${match.score.player2}
        </div>
        <div style="color: #6b7280; font-size: 14px;">
          vs ${opponent.username}
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
        <span>⏱️ ${formatDuration(match.duration)}</span>
        <span>🎮 ${match.gameMode}</span>
      </div>
    </div>
  `;
}

/**
 * Obtenir valors dels filtres
 */
function getFilterValues(container: HTMLElement): any {
  return {
    period: (container.querySelector('#period-filter') as HTMLSelectElement)?.value,
    mode: (container.querySelector('#mode-filter') as HTMLSelectElement)?.value,
    result: (container.querySelector('#result-filter') as HTMLSelectElement)?.value,
    opponent: (container.querySelector('#opponent-filter') as HTMLInputElement)?.value
  };
}

/**
 * Netejar valors dels filtres
 */
function clearFilterValues(container: HTMLElement): void {
  (container.querySelector('#period-filter') as HTMLSelectElement).value = 'all';
  (container.querySelector('#mode-filter') as HTMLSelectElement).value = 'all';
  (container.querySelector('#result-filter') as HTMLSelectElement).value = 'all';
  (container.querySelector('#opponent-filter') as HTMLInputElement).value = '';
}

/**
 * Mostrar/amagar loading de partides
 */
function showMatchesLoading(show: boolean): void {
  const loading = document.querySelector('.loading-matches') as HTMLElement;
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
}

/**
 * Formatar durada en minuts i segons
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatar data
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtenir ID de l'usuari actual (mock)
 */
function getCurrentUserId(): number {
  return 1; // En una app real, això vindria del context d'autenticació
}

/**
 * Mostrar toast notification
 */
function showToast(message: string, type: 'success' | 'error' | 'info'): void {
  const toast = document.createElement('div');
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 2000;
    animation: slideIn 0.3s ease-out;
    background: ${colors[type]};
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

export { loadMatchesData, showToast };
