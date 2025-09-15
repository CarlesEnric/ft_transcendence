/*
 * Main App Class - SPA Router y Estado Global
*/

import { renderLoginPage } from './pages/LoginPage';
import { renderLandingPage } from './pages/LandingPage';
import { renderHomePage } from './pages/HomePage';
import { TwoFactorComponent } from './components/AuthenticationForm';
import TwoFactorSetupModal from './components/SecuritySetupModal';
import TwoFactorDisableModal from './components/SecurityDisableModal';
import TwoFactorBackupCodesModal from './components/BackupCodesModal';
import { API_CONFIG } from './config/api';

export interface User {
  id: number;
  username: string;
  email: string;
}

/*
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
*/

export interface AppState {
  user: User | null;
  loading: boolean;
  currentView: 'landing' | 'login' | '2fa' | 'dashboard' | 'pong' | 'matches';
  showGame: boolean;
  theme: 'dark' | 'light';
  pendingUser?: User | null;
}

export class App {
  private state: AppState = {
    user: null,
    loading: true,
    currentView: 'landing',
    showGame: false,
    theme: 'dark'
  };

  private container: HTMLElement | null = null;

  constructor() {
  }

  /**
   * Función pública para cambiar la vista actual
   */
  public setCurrentView(view: AppState['currentView']): void {
    this.setState({ currentView: view });
    
    // Mantenim sincronitzada la URL amb la vista
    if (view === 'dashboard') {
      window.history.pushState({}, '', '/home');
    } else if (view !== '2fa') { // Evitem canviar la URL per a vistes especials com 2fa
      window.history.pushState({}, '', '/' + view);
    }
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.init();
  }
  
  /**
   * Funció pública per mostrar el modal de configuració de 2FA
   */
  public showTwoFactorSetup(): void {
    // Cridar a l'API per iniciar el procés de configuració
    fetch(API_CONFIG.AUTH.TWO_FA.SETUP, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.setup) {
        // Mostrar modal de configuració
        const setupModal = new TwoFactorSetupModal(data.setup, this.state.user!);
        setupModal.show();
        setupModal.onSuccess = () => {
          // Actualitzar l'estat global
          console.log('2FA setup successful');
          // Recarregar la pàgina per actualitzar l'estat
          window.location.reload();
        };
      } else {
        console.error('Failed to fetch 2FA setup data');
        alert(data.error || 'No s\'ha pogut iniciar la configuració 2FA');
      }
    })
    .catch(error => {
      console.error('Error fetching 2FA setup:', error);
      alert('Error de connexió. Torneu a intentar-ho més tard.');
    });
  }
  
  /**
   * Funció pública per mostrar el modal per desactivar 2FA
   */
  public showTwoFactorDisable(): void {
    // Cridar a l'API per desactivar 2FA
    const disableModal = new TwoFactorDisableModal();
    disableModal.show();
    disableModal.onSuccess = () => {
      console.log('2FA disabled successfully');
      // Recarregar la pàgina per actualitzar l'estat
      window.location.reload();
    };
  }

  private async init(): Promise<void> {
    // Detect if redirected from Google OAuth with 2FA required
    const params = new URLSearchParams(window.location.search);
    if (params.get('twoFactorRequired') === '1') {
      // Show 2FA form directly
      this.setState({ currentView: '2fa', loading: false });
      // Optionally, clear the param from the URL for cleanliness
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    await this.checkAuth();
    this.render();
  }

  /**
   * Verificar estado de autenticación
   */
  private async checkAuth(): Promise<void> {
    console.log("Running checkAuth() - Checking authentication status");
    
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("Found user data in localStorage:", userData);
        
        // If we have localStorage user data, we can use it instead of API call
        this.setState({ user: userData, loading: false, currentView: 'dashboard' });
        console.log("Set user from localStorage, redirecting to dashboard");
        return;
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }
    
    // If no localStorage data, try to get profile from API
    try {
      console.log("Calling profile API:", API_CONFIG.AUTH.PROFILE);
      
      const response = await fetch(API_CONFIG.AUTH.PROFILE, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("Profile API response status:", response.status);
      
      const data = await response.json();
      console.log("Profile API response data:", data);
      
      if (response.ok && data.success) {
        // Store user data in localStorage for future use
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Stored user data in localStorage");
        
        this.setState({ user: data.user, loading: false, currentView: 'dashboard' });
        console.log("Authentication successful, redirecting to dashboard");
      } else {
        this.setState({ user: null, loading: false });
        console.log("Authentication failed, staying on current view");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      this.setState({ user: null, loading: false });
    }
  }

  /**
   * Actualizar estado
   */
  private setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * Render principal
   */
  private render(): void {
    if (!this.container) return;

    if (this.state.loading) {
      this.container.innerHTML = this.renderLoading();
      return;
    }

    // Si estem en vista 2FA, mostrar el formulari 2FA independentment de l'estat d'usuari
    if (this.state.currentView === '2fa') {
      this.container.innerHTML = this.renderTwoFactorForm();
      this.attachEventListeners();
      return;
    }

    if (!this.state.user) {
      // Si no hi ha usuari autenticat, comprovar la vista actual
      if (this.state.currentView === 'landing') {
        renderLandingPage();
      } else {
        // Per a vistes 'login' o qualsevol altra vista quan no hi ha usuari
        renderLoginPage();
      }
    } else {
      this.container.innerHTML = this.renderApp();
    }

    this.attachEventListeners();
  }

  /**
   * Render loading
   */
  private renderLoading(): string {
    return `
      <div class="min-h-screen bg-gray-900 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mx-auto mb-6"></div>
          <h2 class="text-white text-2xl font-bold">Loading FT Transcendence...</h2>
          <p class="text-gray-400 mt-2">Initializing gaming experience</p>
        </div>
      </div>
    `;
  }

  // ...eliminada la funció renderLogin: ara es crida directament renderLoginPage()...

  /**
   * Render aplicación principal
   */
  private renderApp(): string {
    return `
      <div class="min-h-screen bg-gray-900">
        <!-- Header -->
        <header class="bg-gray-800 shadow-lg border-b border-gray-700">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center">
                <h1 class="text-xl font-bold text-white">🏓 FT Transcendence</h1>
              </div>
              
              <nav class="flex space-x-4">
                <button class="px-4 py-2 rounded-lg font-medium transition-all duration-300 ${this.state.currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}" data-view="dashboard">
                  🏠 Dashboard
                </button>
                <button class="px-4 py-2 rounded-lg font-medium transition-all duration-300 ${this.state.currentView === 'pong' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}" data-view="pong">
                  🏓 Pong Game
                </button>
                <button class="px-4 py-2 rounded-lg font-medium transition-all duration-300 ${this.state.currentView === 'matches' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}" data-view="matches">
                  📊 Matches
                </button>
              </nav>
              
              <div class="flex items-center space-x-4">
                <div class="text-white flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    👋
                  </div>
                  <span class="font-medium">${this.state.user?.username}</span>
                </div>
                <button id="logout-btn" class="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition duration-300 text-sm">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div id="main-content">
            ${this.renderCurrentView()}
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Render vista actual
   */
  private renderCurrentView(): string {
    switch (this.state.currentView) {
      case 'landing':
        renderLandingPage();
        return '';
      case 'login':
        renderLoginPage();
        return '';
      case '2fa':
        return this.renderTwoFactorForm();
      case 'dashboard':
        renderHomePage(); // Utilitzem la funció renderHomePage en comptes de renderDashboard
        return '';
      case 'pong':
        return this.renderPong();
      case 'matches':
        return this.renderMatches();
      default:
        renderHomePage(); // Utilitzem la funció renderHomePage en comptes de renderDashboard
        return '';
    }
  }

  /**
   * Renderitzar formulari de codi 2FA
   */
  private renderTwoFactorForm(): string {
    return `
      <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">🔐</div>
            <h1 class="text-3xl font-bold text-white mb-2">Verificació 2FA</h1>
            <p class="text-gray-300">Introdueix el codi de l'aplicació d'autenticació</p>
          </div>
          
          <form id="twofa-form" class="space-y-6">
            <div>
              <label class="block text-white text-sm font-medium mb-2">Codi de verificació</label>
              <input 
                type="text" 
                id="twofa-code" 
                maxlength="6"
                pattern="[0-9]{6}"
                required
                autocomplete="one-time-code"
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
                autofocus
              >
              <p class="text-gray-400 text-xs mt-2">Introdueix el codi de 6 dígits de la teva aplicació d'autenticació</p>
            </div>
            
            <button 
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105"
            >
              Verificar
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-gray-400 text-sm">
              No pots accedir? 
              <a href="#" class="text-cyan-300 hover:text-cyan-200 transition-colors" onclick="alert('Contacta amb l\'administrador per obtenir ajuda.')">
                Necessites ajuda?
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gestionar enviament de codi 2FA
   */
  private async handleTwoFactorSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const codeInput = document.getElementById('twofa-code') as HTMLInputElement;
    const code = codeInput.value.trim();
    
    if (!code) {
      alert('Si us plau, introdueix el codi 2FA');
      return;
    }
    
    try {
      const response = await fetch(API_CONFIG.AUTH.TWO_FA.VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('2FA verification successful', data);
        
        // If the response includes user data, we're now fully authenticated
        if (data.user) {
          this.setState({
            user: data.user,
            currentView: 'dashboard',
            loading: false,
            pendingUser: null
          });
        } else {
          // Check authentication status
          await this.checkAuth();
        }
      } else {
        console.error('2FA verification failed:', data.error);
        alert(data.error || 'Codi 2FA incorrecte');
        // Clear the input for retry
        codeInput.value = '';
        codeInput.focus();
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      alert('Error de xarxa. Si us plau, torna-ho a intentar.');
      // Clear the input for retry
      codeInput.value = '';
      codeInput.focus();
    }
  }

  /**
   * Render Dashboard con 2FA
   */
  private renderDashboard(): string {
    return `
      <div class="space-y-8">
        <!-- Welcome Card -->
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <div class="text-center mb-6">
            <h2 class="text-3xl font-bold text-white mb-3">Welcome back, Gamer! 🎮</h2>
            <p class="text-gray-300">Ready to dominate the pong arena?</p>
          </div>
          
          <!-- Gaming Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center hover:scale-105 transition-transform backdrop-blur-lg border border-gray-600">
              <div class="text-4xl mb-2">🎯</div>
              <h3 class="font-bold text-white text-lg">Games Played</h3>
              <p class="text-3xl font-bold text-cyan-400">0</p>
              <p class="text-gray-400 text-sm">Start your journey</p>
            </div>
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center hover:scale-105 transition-transform backdrop-blur-lg border border-gray-600">
              <div class="text-4xl mb-2">🏆</div>
              <h3 class="font-bold text-white text-lg">Victories</h3>
              <p class="text-3xl font-bold text-emerald-400">0</p>
              <p class="text-gray-400 text-sm">Climb the ladder</p>
            </div>
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center hover:scale-105 transition-transform backdrop-blur-lg border border-gray-600">
              <div class="text-4xl mb-2">⭐</div>
              <h3 class="font-bold text-white text-lg">Rank</h3>
              <p class="text-3xl font-bold text-purple-400">Rookie</p>
              <p class="text-gray-400 text-sm">Prove yourself</p>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex flex-wrap gap-4 justify-center">
            <button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105" data-view="pong">
              🏓 Play Pong
            </button>
            <button class="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105" data-view="matches">
              📊 View Stats
            </button>
            <button class="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition duration-300 transform hover:scale-105" onclick="this.showProfile()">
              👤 Profile
            </button>
          </div>
        </div>
        
        <!-- Security Section -->
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <div class="flex items-center mb-6">
            <h3 class="text-2xl font-bold text-white">🔐 Security Center</h3>
            <div class="ml-auto">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500 bg-opacity-20 text-emerald-400">
                🛡️ Protected
              </span>
            </div>
          </div>
          <p class="text-gray-300 mb-6">
            Secure your gaming account with military-grade two-factor authentication.
          </p>
          
          <div id="twofa-container" class="bg-gray-900 bg-opacity-60 p-6 rounded-xl border border-gray-600">
            <div class="text-center text-gray-400">
              <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading security module...</p>
            </div>
          </div>
        </div>
        
        <!-- Profile Info -->
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h3 class="text-2xl font-bold text-white mb-6">👤 Gamer Profile</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-600">
              <div>
                <label class="block text-sm font-medium text-gray-400">Username</label>
                <p class="text-white font-semibold">${this.state.user?.username}</p>
              </div>
              <div class="text-2xl">🎮</div>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-600">
              <div>
                <label class="block text-sm font-medium text-gray-400">Email</label>
                <p class="text-white font-semibold">${this.state.user?.email}</p>
              </div>
              <div class="text-2xl">📧</div>
            </div>
            <div class="flex justify-between items-center py-3">
              <div>
                <label class="block text-sm font-medium text-gray-400">Player ID</label>
                <p class="text-white font-semibold">#${this.state.user?.id}</p>
              </div>
              <div class="text-2xl">🆔</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Pong Game with Babylon.js 3D
   */
  private renderPong(): string {
    return `
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-4">🏓 Pong Arena 3D</h2>
          <p class="text-gray-300">Experience ultimate retro gaming in stunning 3D with Babylon.js</p>
        </div>
        
        <div class="text-center py-8">
          <!-- Score Display -->
          <div class="flex justify-between items-center w-full max-w-6xl mx-auto mb-4">
            <div class="text-2xl font-bold text-white">Player 1 (Left): <span id="scoreLeft" class="text-cyan-400">0</span></div>
            <div id="connectionStatus" class="px-4 py-2 rounded bg-gray-600 text-gray-300">
              🔴 Disconnected
            </div>
            <div class="text-2xl font-bold text-white">Player 2 (Right): <span id="scoreRight" class="text-purple-400">0</span></div>
          </div>
          
          <div class="w-full max-w-6xl mx-auto h-96 bg-black bg-opacity-30 backdrop-blur-md rounded-xl border border-gray-600 relative overflow-hidden">
            <!-- 3D Game Canvas -->
            <canvas id="pongCanvas" width="1400" height="900" 
                    class="w-full h-full border-2 border-green-500 bg-gray-800 focus:outline-none focus:border-blue-500"
                    style="image-rendering: auto;" tabindex="0"></canvas>
            
            <!-- Game Controls -->
            <div id="gameControls" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button id="startGameBtn" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105">
                🚀 Start 3D Game
              </button>
              <button id="stopGameBtn" class="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300 transform hover:scale-105" style="display: none;">
                ⏹️ Stop Game
              </button>
            </div>
          </div>
          
          <!-- Game Controls Info -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl backdrop-blur-lg border border-gray-600">
              <h4 class="text-white font-bold mb-3">🎮 Player 1 Controls</h4>
              <div class="space-y-2 text-gray-300">
                <p><kbd class="bg-gray-600 bg-opacity-50 px-2 py-1 rounded">↑</kbd> Move Up</p>
                <p><kbd class="bg-gray-600 bg-opacity-50 px-2 py-1 rounded">↓</kbd> Move Down</p>
              </div>
            </div>
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl backdrop-blur-lg border border-gray-600">
              <h4 class="text-white font-bold mb-3">🎯 Player 2 Controls</h4>
              <div class="space-y-2 text-gray-300">
                <p><kbd class="bg-gray-600 bg-opacity-50 px-2 py-1 rounded">W</kbd> Move Up</p>
                <p><kbd class="bg-gray-600 bg-opacity-50 px-2 py-1 rounded">S</kbd> Move Down</p>
              </div>
            </div>
          </div>
          
          <!-- 3D Features Info -->
          <div class="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-opacity-20 p-6 rounded-xl border border-purple-400">
            <h4 class="text-white font-bold mb-2">✨ 3D Gaming Features</h4>
            <div class="text-gray-300 text-sm">
              <p>• Stunning 3D graphics powered by Babylon.js engine</p>
              <p>• Real-time lighting and material effects</p>
              <p>• Smooth 60 FPS rendering with WebGL acceleration</p>
              <p>• Immersive top-down camera perspective</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Matches
   */
  private renderMatches(): string {
    return `
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-4">📊 Match History</h2>
          <p class="text-gray-300">Track your gaming journey and achievements</p>
        </div>
        
        <div class="text-center py-20">
          <div class="mb-8">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-2xl font-bold text-white mb-2">No Matches Yet</h3>
            <p class="text-gray-400 mb-6">Start playing to build your legendary match history!</p>
            <button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105" data-view="pong">
              🏓 Play Your First Game
            </button>
          </div>
          
          <!-- Future Stats Preview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center backdrop-blur-lg border border-gray-600">
              <div class="text-3xl mb-2">⚡</div>
              <h4 class="text-white font-bold">Win Streak</h4>
              <p class="text-2xl font-bold text-yellow-400">0</p>
            </div>
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center backdrop-blur-lg border border-gray-600">
              <div class="text-3xl mb-2">🎯</div>
              <h4 class="text-white font-bold">Best Score</h4>
              <p class="text-2xl font-bold text-cyan-400">0</p>
            </div>
            <div class="bg-gray-700 bg-opacity-50 p-6 rounded-xl text-center backdrop-blur-lg border border-gray-600">
              <div class="text-3xl mb-2">⏱️</div>
              <h4 class="text-white font-bold">Total Time</h4>
              <p class="text-2xl font-bold text-purple-400">0m</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Estilos CSS
   */
  private renderStyles(): string {
    return `
      <style>
        .nav-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
          color: #6b7280;
        }
        
        .nav-btn:hover {
          color: #374151;
          background-color: #f3f4f6;
        }
        
        .nav-btn.active {
          color: #2563eb;
          background-color: #dbeafe;
        }
      </style>
    `;
  }

  /**
   * Adjuntar event listeners
   */
  private attachEventListeners(): void {
  // ...eliminat login-form antic: ara la SPA s'encarrega del login...
    // TwoFactor form
    const twofaForm = document.getElementById('twofa-form');
    if (twofaForm) {
      twofaForm.addEventListener('submit', this.handleTwoFactorSubmit.bind(this));
    }

    // Google login
    const googleLogin = document.getElementById('google-login');
    if (googleLogin) {
      googleLogin.addEventListener('click', this.handleGoogleLogin.bind(this));
    }

  // ...eliminat registre antic: ara la SPA s'encarrega del registre...

    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn-gaming');
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = (e.target as HTMLElement).getAttribute('data-view') as 'dashboard' | 'pong' | 'matches';
        if (view) {
          this.setState({ currentView: view });
          
          // Mount specific components based on view
          if (view === 'dashboard') {
            setTimeout(() => this.mount2FAComponent(), 100);
          } else if (view === 'pong') {
            setTimeout(() => this.initializePongGame(), 100);
          }
        }
      });
    });

    // Quick action buttons in dashboard
    const quickActions = document.querySelectorAll('[data-view]');
    quickActions.forEach(btn => {
      if (!btn.classList.contains('nav-btn-gaming')) {
        btn.addEventListener('click', (e) => {
          const view = (e.target as HTMLElement).getAttribute('data-view') as 'dashboard' | 'pong' | 'matches';
          if (view) {
            this.setState({ currentView: view });
            
            // Mount specific components based on view
            if (view === 'pong') {
              setTimeout(() => this.initializePongGame(), 100);
            }
          }
        });
      }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    // Montar componente 2FA si estamos en dashboard
    if (this.state.currentView === 'dashboard' && this.state.user) {
      setTimeout(() => this.mount2FAComponent(), 100);
    }
  }

  /**
   * Montar componente 2FA
   */
  private mount2FAComponent(): void {
    const container = document.getElementById('twofa-container');
    if (container && this.state.user) {
      try {
        const twoFAComponent = new TwoFactorComponent(this.state.user, (state) => {
          console.log('2FA state updated:', state);
        });
        
        container.innerHTML = '';
        container.appendChild(twoFAComponent.getElement());
      } catch (error) {
        console.error('Error mounting 2FA component:', error);
        container.innerHTML = '<p class="text-red-600">Error loading 2FA component</p>';
      }
    }
  }

  /**
   * Initialize Pong Game
   */
  private async initializePongGame(): Promise<void> {
    const canvas = document.getElementById('pongCanvas');
    if (canvas && !pongGame) {
      pongGame = await PongGame.create('pongCanvas');
    }
  }

  /**
   * Configurar event listeners globales
   */
  private setupEventListeners(): void {
    // Los event listeners se configuran en attachEventListeners
  }

  // ...eliminat handler de login antic: ara la SPA s'encarrega del login...

  /**
   * Manejar registro
   */
  /**
   * Manejar logout
   */
  private async handleLogout(): Promise<void> {
    try {
      const response = await fetch(API_CONFIG.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });

      // Limpiar estado independientemente de la respuesta
      this.setState({
        user: null,
        currentView: 'landing',
        loading: false
      });

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar el estado local
      this.setState({
        user: null,
        currentView: 'landing',
        loading: false
      });
    }
  }

  /**
   * Manejar login con Google
   */
  private async handleGoogleLogin(): Promise<void> {
    try {
      // Redirigir a Google OAuth
      window.location.href = API_CONFIG.AUTH.GOOGLE;
    } catch (error) {
      console.error('Error en Google login:', error);
      this.showToast('Error al conectar con Google', 'error');
    }
  }

  // ...eliminat handler de registre antic: ara la SPA s'encarrega del registre...

  /**
   * Mostrar notificación toast
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}

/**
 * Pong Game Class with Babylon.js 3D Rendering
 * Handles WebSocket connection and 3D game rendering
 */

import { PongRenderer } from './components/PongRenderer.js';
import { RoomManager, Room } from './components/RoomManager.js';
import { PhysicsEngine, GamePhysicsState } from './components/PhysicsEngine.js';

class PongGame {
  private canvas: HTMLCanvasElement;
  private renderer: PongRenderer | null = null;
  private ws: WebSocket | null = null;
  private gameState: any = null;
  private isRunning = false;

  // Motor de física modular (preparat per a ús incremental)
  private physics: PhysicsEngine | null = null;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public static async create(canvasId: string): Promise<PongGame> {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const game = new PongGame(canvas);
    game.renderer = await PongRenderer.create(canvas);
    game.setupEventListeners();
    // Inicialització real de la física (sincronitzada amb el renderitzat)
    // Ajustem el tauler perquè tot sigui visible (marge visual de 40px a dalt/baix)
    const canvasWidth = 1400;
    const canvasHeight = 900;
    const margin = 40;
    const bounds = { width: canvasWidth, height: canvasHeight - margin * 2 };
    const initialPhysicsState: GamePhysicsState = {
      ball: {
        position: { x: canvasWidth / 2, y: bounds.height / 2 },
        velocity: { x: 0.2, y: 0.15 },
        radius: 20,
      },
      paddles: {
        left: { position: bounds.height / 2, height: 180, width: 30 },
        right: { position: bounds.height / 2, height: 180, width: 30 },
      },
      bounds,
    };
    game.physics = new PhysicsEngine(initialPhysicsState);
    return game;
  }

  private setupEventListeners(): void {
    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      let message = null;
      
      switch(event.key) {
        case 'w':
        case 'W':
          message = { type: 'move', player: 'right', direction: 'up' };
          break;
        case 's':
        case 'S':
          message = { type: 'move', player: 'right', direction: 'down' };
          break;
        case 'ArrowUp':
          message = { type: 'move', player: 'left', direction: 'up' };
          break;
        case 'ArrowDown':
          message = { type: 'move', player: 'left', direction: 'down' };
          break;
      }

      if (message) {
        this.ws.send(JSON.stringify(message));
        console.log("✅ Sent:", message);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Game control buttons
    const startBtn = document.getElementById('startGameBtn');
    const stopBtn = document.getElementById('stopGameBtn');

    startBtn?.addEventListener('click', () => this.startGame());
    stopBtn?.addEventListener('click', () => this.stopGame());
  }

  public startGame(): void {
    if (this.isRunning) return;

    this.connectWebSocket();
    this.isRunning = true;

    // Update UI
    const startBtn = document.getElementById('startGameBtn');
    const stopBtn = document.getElementById('stopGameBtn');
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
  }

  public stopGame(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.disconnectWebSocket();

    // Update UI
    const startBtn = document.getElementById('startGameBtn');
    const stopBtn = document.getElementById('stopGameBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
  }

  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(API_CONFIG.GAME.WS);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected to game service');
        this.updateConnectionStatus('🟢 Connected', 'text-green-400');
      };

      this.ws.onmessage = (event) => {
        try {
          this.gameState = JSON.parse(event.data);
          this.updateGameObjects();
        } catch (error) {
          console.error('Error parsing game state:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.updateConnectionStatus('🔴 Disconnected', 'text-red-400');
        if (this.isRunning) {
          setTimeout(() => this.connectWebSocket(), 2000);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('🟡 Error', 'text-yellow-400');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.updateConnectionStatus('🔴 Failed', 'text-red-400');
    }
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateConnectionStatus('🔴 Disconnected', 'text-red-400');
  }

  private updateConnectionStatus(text: string, className: string): void {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = `absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${className} bg-gray-800 bg-opacity-75`;
    }
  }

  private updateGameObjects(): void {
    // Si tenim estat del servidor, prioritzem-lo (multiplayer)
    if (this.gameState && this.renderer) {
      const { ball, paddles, score } = this.gameState;
      if (this.renderer.ball) {
        this.renderer.ball.position.x = ball.x;
        this.renderer.ball.position.z = ball.z;
      }
      if (this.renderer.paddleLeft) this.renderer.paddleLeft.position.z = paddles.left;
      if (this.renderer.paddleRight) this.renderer.paddleRight.position.z = paddles.right;
      this.updateScoreDisplay(score);
      return;
    }
    // Si no, simulem física local (singleplayer/demo)
    if (this.physics && this.renderer) {
      this.physics.update(16); // 16 ms ~ 60 FPS
      const state = this.physics.getState();
      // Sincronitza el renderitzat amb la física
      if (this.renderer.ball) {
        this.renderer.ball.position.x = state.ball.position.x;
        this.renderer.ball.position.z = state.ball.position.y;
      }
      if (this.renderer.paddleLeft) this.renderer.paddleLeft.position.z = state.paddles.left.position;
      if (this.renderer.paddleRight) this.renderer.paddleRight.position.z = state.paddles.right.position;
    }
  }

  private updateScoreDisplay(score: any): void {
    // Update score in UI elements outside the canvas
    const scoreLeftEl = document.getElementById('scoreLeft');
    const scoreRightEl = document.getElementById('scoreRight');
    
    if (scoreLeftEl) scoreLeftEl.textContent = score.left.toString();
    if (scoreRightEl) scoreRightEl.textContent = score.right.toString();
  }

  public dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Global Pong game instance
let pongGame: PongGame | null = null;

// RoomManager singleton per gestionar sales de joc multiplayer
export const roomManager = new RoomManager();

// Exemple d'ús bàsic (per a futures funcionalitats):
// const myRoom = roomManager.createRoom('player1');
// roomManager.joinRoom(myRoom.id, 'player2');
// const allRooms = roomManager.listRooms();
