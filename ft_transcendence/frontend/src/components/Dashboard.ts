/**
 * Dashboard principal de l'aplicació
 * Pantalla principal després del login amb navegació i estat de l'usuari
 */

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    ranking: number;
  };
}

interface DashboardData {
  user: User;
  recentMatches: any[];
  onlineUsers: number;
  notifications: any[];
}

/**
 * Crear el dashboard principal
 */
export function createDashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dashboard-container';
  
  container.innerHTML = `
    <div class="dashboard-wrapper">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1>🏓 ft_transcendence</h1>
          <div class="user-info">
            <div class="user-avatar" id="user-avatar">👤</div>
            <div class="user-details">
              <span class="username" id="username">Carregant...</span>
              <span class="user-status" id="user-status">Online</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <button class="header-btn" onclick="toggleNotifications()">
            🔔 <span id="notification-count">0</span>
          </button>
          <button class="header-btn" onclick="showSettings()">
            ⚙️ Configuració
          </button>
          <button class="header-btn logout-btn" onclick="logout()">
            🚪 Sortir
          </button>
        </div>
      </header>
      
      <!-- Navigation -->
      <nav class="dashboard-nav">
        <button class="nav-btn active" data-section="home" onclick="showSection('home')">
          🏠 Inici
        </button>
        <button class="nav-btn" data-section="game" onclick="showSection('game')">
          🎮 Jugar
        </button>
        <button class="nav-btn" data-section="matches" onclick="showSection('matches')">
          📊 Partides
        </button>
        <button class="nav-btn" data-section="ranking" onclick="showSection('ranking')">
          🏆 Rànquing
        </button>
        <button class="nav-btn" data-section="profile" onclick="showSection('profile')">
          👤 Perfil
        </button>
      </nav>
      
      <!-- Content Sections -->
      <main class="dashboard-content">
        <!-- Home Section -->
        <section id="home-section" class="content-section active">
          <div class="welcome-card">
            <h2>Benvingut al Dashboard! 🎉</h2>
            <p>Preparat per jugar al millor Pong 3D?</p>
            
            <div class="quick-actions">
              <button class="action-btn primary" onclick="startQuickGame()">
                ⚡ Partida Ràpida
              </button>
              <button class="action-btn secondary" onclick="createPrivateGame()">
                🔒 Partida Privada
              </button>
              <button class="action-btn secondary" onclick="joinGame()">
                🚪 Unir-se a Partida
              </button>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-info">
                <span class="stat-number" id="games-played">0</span>
                <span class="stat-label">Partides Jugades</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <span class="stat-number" id="games-won">0</span>
                <span class="stat-label">Victories</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <span class="stat-number" id="win-rate">0%</span>
                <span class="stat-label">% Victories</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-number" id="ranking">#999</span>
                <span class="stat-label">Posició</span>
              </div>
            </div>
          </div>
          
          <div class="recent-activity">
            <h3>Activitat Recent</h3>
            <div id="recent-matches" class="activity-list">
              <div class="loading">Carregant partides...</div>
            </div>
          </div>
        </section>
        
        <!-- Game Section -->
        <section id="game-section" class="content-section">
          <div class="game-container">
            <h2>🎮 Zona de Joc</h2>
            <div id="game-area" class="game-area">
              <!-- Aquí es carregarà el Pong 3D -->
              <div class="game-placeholder">
                <div class="game-placeholder-content">
                  <div class="game-icon">🏓</div>
                  <h3>Pong 3D</h3>
                  <p>Clica "Començar Partida" per jugar</p>
                  <button class="start-game-btn" onclick="startPongGame()">
                    🚀 Començar Partida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Matches Section -->
        <section id="matches-section" class="content-section">
          <div class="matches-container">
            <h2>📊 Historial de Partides</h2>
            <div id="matches-list" class="matches-list">
              <div class="loading">Carregant historial...</div>
            </div>
          </div>
        </section>
        
        <!-- Ranking Section -->
        <section id="ranking-section" class="content-section">
          <div class="ranking-container">
            <h2>🏆 Rànquing Global</h2>
            <div id="ranking-list" class="ranking-list">
              <div class="loading">Carregant rànquing...</div>
            </div>
          </div>
        </section>
        
        <!-- Profile Section -->
        <section id="profile-section" class="content-section">
          <div class="profile-container">
            <h2>👤 El Meu Perfil</h2>
            <div class="profile-content">
              <div class="profile-info">
                <div class="profile-avatar">👤</div>
                <div class="profile-details">
                  <h3 id="profile-username">Usuari</h3>
                  <p id="profile-email">email@example.com</p>
                </div>
              </div>
              
              <div class="profile-actions">
                <button class="profile-btn" onclick="editProfile()">
                  ✏️ Editar Perfil
                </button>
                <button class="profile-btn" onclick="changePassword()">
                  🔑 Canviar Contrasenya
                </button>
                <div id="security-settings">
                  <!-- Aquí es carregarà el component 2FA -->
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay">
      <div class="loading-spinner">⏳</div>
      <p>Carregant...</p>
    </div>
    
    <style>
      .dashboard-container {
        min-height: 100vh;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .dashboard-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        min-height: 100vh;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      
      /* Header */
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      
      .header-left h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      
      .user-details {
        display: flex;
        flex-direction: column;
      }
      
      .username {
        font-weight: 600;
        font-size: 16px;
      }
      
      .user-status {
        font-size: 12px;
        opacity: 0.8;
      }
      
      .header-right {
        display: flex;
        gap: 8px;
      }
      
      .header-btn {
        padding: 8px 16px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }
      
      .header-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.8) !important;
      }
      
      /* Navigation */
      .dashboard-nav {
        display: flex;
        background: #f8fafc;
        border-bottom: 1px solid #e5e7eb;
        padding: 0 24px;
      }
      
      .nav-btn {
        padding: 16px 24px;
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 3px solid transparent;
        font-weight: 500;
      }
      
      .nav-btn:hover {
        color: #374151;
        background: #f3f4f6;
      }
      
      .nav-btn.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
        background: white;
      }
      
      /* Content */
      .dashboard-content {
        padding: 24px;
      }
      
      .content-section {
        display: none;
      }
      
      .content-section.active {
        display: block;
      }
      
      /* Welcome Card */
      .welcome-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 32px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 24px;
      }
      
      .welcome-card h2 {
        margin: 0 0 8px 0;
        font-size: 28px;
      }
      
      .welcome-card p {
        margin: 0 0 24px 0;
        opacity: 0.9;
        font-size: 18px;
      }
      
      .quick-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .action-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 16px;
      }
      
      .action-btn.primary {
        background: #10b981;
        color: white;
      }
      
      .action-btn.primary:hover {
        background: #059669;
        transform: translateY(-2px);
      }
      
      .action-btn.secondary {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .action-btn.secondary:hover {
        background: rgba(255,255,255,0.3);
      }
      
      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.2s;
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .stat-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 50%;
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
      }
      
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
      
      /* Recent Activity */
      .recent-activity {
        background: white;
        padding: 24px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      
      .recent-activity h3 {
        margin: 0 0 16px 0;
        color: #1f2937;
      }
      
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      /* Game Area */
      .game-area {
        background: #f8fafc;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .game-placeholder-content {
        text-align: center;
        color: #6b7280;
      }
      
      .game-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }
      
      .game-placeholder-content h3 {
        margin: 0 0 8px 0;
        color: #374151;
      }
      
      .start-game-btn {
        margin-top: 16px;
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .start-game-btn:hover {
        background: #2563eb;
        transform: translateY(-2px);
      }
      
      /* Profile */
      .profile-info {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 24px;
        padding: 24px;
        background: #f8fafc;
        border-radius: 8px;
      }
      
      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
      }
      
      .profile-details h3 {
        margin: 0 0 4px 0;
        color: #1f2937;
      }
      
      .profile-details p {
        margin: 0;
        color: #6b7280;
      }
      
      .profile-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .profile-btn {
        padding: 12px 16px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }
      
      .profile-btn:hover {
        background: #e5e7eb;
      }
      
      /* Loading */
      .loading {
        text-align: center;
        color: #6b7280;
        padding: 40px;
      }
      
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        color: white;
        text-align: center;
      }
      
      .loading-spinner {
        font-size: 48px;
        animation: spin 2s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          gap: 16px;
        }
        
        .dashboard-nav {
          flex-wrap: wrap;
          padding: 0 12px;
        }
        
        .nav-btn {
          padding: 12px 16px;
          font-size: 14px;
        }
        
        .dashboard-content {
          padding: 16px;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
        
        .quick-actions {
          flex-direction: column;
        }
        
        .action-btn {
          width: 100%;
        }
      }
    </style>
  `;
  
  // Configurar esdeveniments
  setupDashboardEvents(container);
  
  // Carregar dades inicials
  loadDashboardData();
  
  return container;
}

/**
 * Configurar esdeveniments del dashboard
 */
function setupDashboardEvents(container: HTMLElement): void {
  // Funcions globals per les accions
  (window as any).showSection = (sectionName: string) => {
    // Amagar totes les seccions
    const sections = container.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Mostrar la secció seleccionada
    const targetSection = container.querySelector(`#${sectionName}-section`);
    targetSection?.classList.add('active');
    
    // Actualitzar navegació
    const navBtns = container.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = container.querySelector(`[data-section="${sectionName}"]`);
    activeBtn?.classList.add('active');
    
    // Carregar contingut específic de la secció
    loadSectionContent(sectionName);
  };
  
  (window as any).startQuickGame = () => {
    (window as any).showSection('game');
    setTimeout(() => (window as any).startPongGame(), 100);
  };
  
  (window as any).createPrivateGame = () => {
    showToast('Creant partida privada...', 'info');
  };
  
  (window as any).joinGame = () => {
    showToast('Buscant partides disponibles...', 'info');
  };
  
  (window as any).startPongGame = () => {
    const gameArea = container.querySelector('#game-area');
    if (gameArea) {
      // Aquí es carregaria el GameEngine
      gameArea.innerHTML = '<div style="text-align: center; padding: 40px; color: #059669;"><h3>🚀 Carregant Pong 3D...</h3><p>El joc s\'iniciarà en uns segons...</p></div>';
      
      // Simular càrrega del joc
      setTimeout(() => {
        showToast('Joc carregat! Utilitza W/S o ↑/↓ per moure', 'success');
        // Aquí es carregaria el component GameEngine real
      }, 2000);
    }
  };
  
  (window as any).toggleNotifications = () => {
    showToast('Panel de notificacions en desenvolupament', 'info');
  };
  
  (window as any).showSettings = () => {
    showToast('Configuració en desenvolupament', 'info');
  };
  
  (window as any).logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        showToast('Sessió tancada correctament', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        showToast('Error al tancar sessió', 'error');
      }
    } catch (error) {
      showToast('Error de connexió', 'error');
    }
  };
  
  (window as any).editProfile = () => {
    showToast('Editor de perfil en desenvolupament', 'info');
  };
  
  (window as any).changePassword = () => {
    showToast('Canvi de contrasenya en desenvolupament', 'info');
  };
}

/**
 * Carregar dades del dashboard
 */
async function loadDashboardData(): Promise<void> {
  try {
    showLoading(true);
    
    const response = await fetch('/api/dashboard', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data: DashboardData = await response.json();
      updateDashboardUI(data);
    } else {
      showToast('Error carregant dades del dashboard', 'error');
    }
  } catch (error) {
    showToast('Error de connexió', 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Actualitzar UI amb les dades
 */
function updateDashboardUI(data: DashboardData): void {
  // Actualitzar info d'usuari
  const usernameEl = document.getElementById('username');
  const profileUsernameEl = document.getElementById('profile-username');
  const profileEmailEl = document.getElementById('profile-email');
  
  if (usernameEl) usernameEl.textContent = data.user.username;
  if (profileUsernameEl) profileUsernameEl.textContent = data.user.username;
  if (profileEmailEl) profileEmailEl.textContent = data.user.email;
  
  // Actualitzar estadístiques
  if (data.user.stats) {
    const gamesPlayedEl = document.getElementById('games-played');
    const gamesWonEl = document.getElementById('games-won');
    const winRateEl = document.getElementById('win-rate');
    const rankingEl = document.getElementById('ranking');
    
    if (gamesPlayedEl) gamesPlayedEl.textContent = data.user.stats.gamesPlayed.toString();
    if (gamesWonEl) gamesWonEl.textContent = data.user.stats.gamesWon.toString();
    if (winRateEl) winRateEl.textContent = `${data.user.stats.winRate}%`;
    if (rankingEl) rankingEl.textContent = `#${data.user.stats.ranking}`;
  }
  
  // Actualitzar notificacions
  const notificationCountEl = document.getElementById('notification-count');
  if (notificationCountEl) {
    notificationCountEl.textContent = data.notifications.length.toString();
  }
}

/**
 * Carregar contingut específic d'una secció
 */
function loadSectionContent(sectionName: string): void {
  switch (sectionName) {
    case 'matches':
      loadMatchesHistory();
      break;
    case 'ranking':
      loadRanking();
      break;
    case 'profile':
      loadSecuritySettings();
      break;
  }
}

/**
 * Carregar historial de partides
 */
async function loadMatchesHistory(): Promise<void> {
  const matchesList = document.getElementById('matches-list');
  if (!matchesList) return;
  
  try {
    const response = await fetch('/api/matches/history', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const matches = await response.json();
      // Actualitzar llista de partides
      matchesList.innerHTML = matches.length ? 
        matches.map((match: any) => `
          <div class="match-item">
            <span>Partida vs ${match.opponent}</span>
            <span>${match.result}</span>
            <span>${match.date}</span>
          </div>
        `).join('') :
        '<div class="loading">No hi ha partides encara</div>';
    }
  } catch (error) {
    matchesList.innerHTML = '<div class="loading">Error carregant partides</div>';
  }
}

/**
 * Carregar rànquing
 */
async function loadRanking(): Promise<void> {
  const rankingList = document.getElementById('ranking-list');
  if (!rankingList) return;
  
  try {
    const response = await fetch('/api/ranking', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const ranking = await response.json();
      // Actualitzar rànquing
      rankingList.innerHTML = ranking.map((player: any, index: number) => `
        <div class="ranking-item">
          <span>#${index + 1}</span>
          <span>${player.username}</span>
          <span>${player.winRate}%</span>
        </div>
      `).join('');
    }
  } catch (error) {
    rankingList.innerHTML = '<div class="loading">Error carregant rànquing</div>';
  }
}

/**
 * Carregar configuració de seguretat
 */
function loadSecuritySettings(): void {
  const securitySettings = document.getElementById('security-settings');
  if (securitySettings) {
    // Aquí es carregaria el component AuthenticationForm
    securitySettings.innerHTML = `
      <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 6px;">
        <h4 style="margin: 0 0 12px 0;">🔐 Seguretat del Compte</h4>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
          Configura l'autenticació de dos factors per protegir el teu compte.
        </p>
        <div id="auth-component-container">
          <!-- Aquí es carregaria AuthenticationForm -->
          <button onclick="load2FAComponent()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Gestionar 2FA
          </button>
        </div>
      </div>
    `;
    
    (window as any).load2FAComponent = () => {
      showToast('Component 2FA carregant...', 'info');
      // Aquí es carregaria el component AuthenticationForm real
    };
  }
}

/**
 * Mostrar/amagar loading
 */
function showLoading(show: boolean): void {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
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

export { loadDashboardData, showToast };
