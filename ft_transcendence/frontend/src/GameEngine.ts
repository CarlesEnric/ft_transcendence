/**
 * Main App Class - SPA Router y Estado Global
 */

import { TwoFactorComponent } from './components/AuthenticationForm.js';
import TwoFactorSetupModal from './components/SecuritySetupModal.js';
import TwoFactorDisableModal from './components/SecurityDisableModal.js';
import TwoFactorBackupCodesModal from './components/BackupCodesModal.js';

export interface User {
  userId: number;
  username: string;
  email: string;
}

export interface AppState {
  user: User | null;
  loading: boolean;
  currentView: 'login' | 'dashboard' | 'pong' | 'matches';
  showGame: boolean;
  theme: 'dark' | 'light';
}

export class App {
  private state: AppState = {
    user: null,
    loading: true,
    currentView: 'dashboard',
    showGame: false,
    theme: 'dark'
  };

  private container: HTMLElement | null = null;

  constructor() {
    this.state = {
      user: null,
      loading: true,
      currentView: 'dashboard',
      showGame: false,
      theme: 'dark'
    };
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.init();
  }

  private async init(): Promise<void> {
    await this.checkAuth();
    this.render();
  }

  /**
   * Verificar estado de autenticación
   */
  private async checkAuth(): Promise<void> {
    try {
      const response = await fetch('https://localhost:3000/api/auth/profile', { 
        credentials: 'include' 
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.setState({ user: data.user, loading: false });
      } else {
        this.setState({ user: null, loading: false });
      }
    } catch {
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

    if (!this.state.user) {
      this.container.innerHTML = this.renderLogin();
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

  /**
   * Render login
   */
  private renderLogin(): string {
    return `
      <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">FT Transcendence</h1>
            <p class="text-gray-300">Welcome to the ultimate gaming experience</p>
          </div>
          
          <form id="login-form" class="space-y-6">
            <div>
              <label class="block text-white text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                required
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              >
            </div>
            
            <div>
              <label class="block text-white text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                id="password" 
                required
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              >
            </div>
            
            <button 
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105"
            >
            Sign In
            </button>
          </form>
          
          <!-- Google OAuth Button -->
          <button 
            id="google-login"
            class="w-full mt-4 bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center justify-center space-x-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <div class="mt-6 text-center">
            <button 
              id="show-register"
              class="text-cyan-300 hover:text-cyan-200 text-sm transition-colors"
            >
              Don't have an account? <span class="font-semibold">Register here</span>
            </button>
          </div>
          
          <div id="register-form" class="hidden mt-6 pt-6 border-t border-gray-600">
            <form id="register-form-actual" class="space-y-4">
              <div>
                <input 
                  type="text" 
                  id="reg-username" 
                  required
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Username"
                >
              </div>
              <div>
                <input 
                  type="email" 
                  id="reg-email" 
                  required
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Email"
                >
              </div>
              <div>
                <input 
                  type="password" 
                  id="reg-password" 
                  required
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Password"
                >
              </div>
              <button 
                type="submit"
                class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105"
              >
                ✨ Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

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
      case 'dashboard':
        return this.renderDashboard();
      case 'pong':
        return this.renderPong();
      case 'matches':
        return this.renderMatches();
      default:
        return this.renderDashboard();
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
                <p class="text-white font-semibold">#${this.state.user?.userId}</p>
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
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    // Google login
    const googleLogin = document.getElementById('google-login');
    if (googleLogin) {
      googleLogin.addEventListener('click', this.handleGoogleLogin.bind(this));
    }

    // Register toggle
    const showRegister = document.getElementById('show-register');
    if (showRegister) {
      showRegister.addEventListener('click', () => {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
          registerForm.classList.toggle('hidden');
        }
      });
    }

    // Register form
    const registerForm = document.getElementById('register-form-actual');
    if (registerForm) {
      registerForm.addEventListener('submit', this.handleRegister.bind(this));
    }

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
  private initializePongGame(): void {
    const canvas = document.getElementById('pongCanvas');
    if (canvas && !pongGame) {
      pongGame = new PongGame('pongCanvas');
    }
  }

  /**
   * Configurar event listeners globales
   */
  private setupEventListeners(): void {
    // Los event listeners se configuran en attachEventListeners
  }

  /**
   * Manejar login
   */
  private async handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch('https://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.setState({
          user: data.user,
          currentView: 'dashboard',
          loading: false
        });
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error occurred');
    }
  }

  /**
   * Manejar registro
   */
  /**
   * Manejar logout
   */
  private async handleLogout(): Promise<void> {
    try {
      const response = await fetch('https://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Limpiar estado independientemente de la respuesta
      this.setState({
        user: null,
        currentView: 'login',
        loading: false
      });

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar el estado local
      this.setState({
        user: null,
        currentView: 'login',
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
      window.location.href = 'https://localhost:3000/api/auth/google';
    } catch (error) {
      console.error('Error en Google login:', error);
      this.showToast('Error al conectar con Google', 'error');
    }
  }

  /**
   * Manejar registro
   */
  private async handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (password !== confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    
    try {
      const response = await fetch('https://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        this.showToast('Registro exitoso. Por favor inicia sesión.', 'success');
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
          registerForm.classList.add('hidden');
        }
        form.reset();
      } else {
        const errorData = await response.json();
        this.showToast(errorData.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.showToast('Error de conexión', 'error');
    }
  }

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
class PongGame {
  private canvas: HTMLCanvasElement;
  private engine: any; // BABYLON.Engine
  private scene: any; // BABYLON.Scene
  private ws: WebSocket | null = null;
  private gameState: any = null;
  private isRunning = false;
  private ball: any = null;
  private paddleLeft: any = null;
  private paddleRight: any = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.setupBabylonScene();
    this.setupEventListeners();
  }

  private async setupBabylonScene(): Promise<void> {
    // Dynamically import Babylon.js
    const BABYLON = await import('@babylonjs/core');

    // 1) Configure Babylon.js engine
    this.engine = new BABYLON.Engine(this.canvas, true, { 
      preserveDrawingBuffer: true, 
      stencil: true 
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1);

    // Fixed camera to view the game from above
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 20, 0), this.scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.rotation.x = Math.PI / 2; // Looking down
    
    // Adjust field of view so the field fills the canvas perfectly
    camera.fov = 0.8; // FOV adjusted to see the entire field
    
    // IMPORTANT: Disable camera controls to avoid interference
    camera.inputs.clear();

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;

    // Game field (ground) - exact game dimensions (16x24)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 16, height: 24 }, this.scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.1);
    ground.material = groundMaterial;

    // Center line
    const centerLine = BABYLON.MeshBuilder.CreateBox("centerLine", { width: 0.1, height: 0.1, depth: 24 }, this.scene);
    const centerMaterial = new BABYLON.StandardMaterial("centerMat", this.scene);
    centerMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    centerLine.material = centerMaterial;

    // Ball
    this.ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, this.scene);
    const ballMaterial = new BABYLON.StandardMaterial("ballMat", this.scene);
    ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ballMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    this.ball.material = ballMaterial;
    this.ball.position.y = 0.5;

    // Paddles
    this.paddleLeft = BABYLON.MeshBuilder.CreateBox("paddleL", { width: 0.3, height: 0.5, depth: 2 }, this.scene);
    this.paddleRight = BABYLON.MeshBuilder.CreateBox("paddleR", { width: 0.3, height: 0.5, depth: 2 }, this.scene);
    
    const paddleMaterial = new BABYLON.StandardMaterial("paddleMat", this.scene);
    paddleMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.8, 0.3);
    paddleMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);
    
    this.paddleLeft.material = paddleMaterial;
    this.paddleRight.material = paddleMaterial;
    this.paddleLeft.position.x = -7.5;
    this.paddleLeft.position.y = 0.5;
    this.paddleRight.position.x = 7.5;
    this.paddleRight.position.y = 0.5;

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
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
      this.ws = new WebSocket('wss://localhost:3000/ws/game');

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
    if (!this.gameState || !this.ball) return;

    const { ball, paddles, score } = this.gameState;
    
    // Update 3D object positions
    this.ball.position.x = ball.x;
    this.ball.position.z = ball.z;
    this.paddleLeft.position.z = paddles.left;
    this.paddleRight.position.z = paddles.right;

    // Update score display
    this.updateScoreDisplay(score);
  }

  private updateScoreDisplay(score: any): void {
    // Update score in UI elements outside the canvas
    const scoreLeftEl = document.getElementById('scoreLeft');
    const scoreRightEl = document.getElementById('scoreRight');
    
    if (scoreLeftEl) scoreLeftEl.textContent = score.left.toString();
    if (scoreRightEl) scoreRightEl.textContent = score.right.toString();
  }

  public dispose(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Global Pong game instance
let pongGame: PongGame | null = null;
