/**
 * Formulari de login amb autenticació OAuth2 i 2FA
 * Component principal per la pantalla d'inici de sessió
 */
import { API_CONFIG } from '../config/api';

interface LoginCredentials {
  username: string;
  password: string;
  twoFactorCode?: string;
}

interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

/**
 * Crear el formulari de login
 */
export function createLoginForm(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'login-form-container';
  
  container.innerHTML = `
    <div class="login-form-wrapper">
      <div class="login-header">
        <h1>🏓 ft_transcendence</h1>
        <p>Entra per jugar al millor Pong 3D</p>
      </div>
      
      <form id="login-form" class="login-form">
        <div class="form-group">
          <label for="username">Usuari:</label>
          <input type="text" id="username" name="username" required autocomplete="username">
        </div>
        
        <div class="form-group">
          <label for="password">Contrasenya:</label>
          <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>
        
        <div id="twofa-group" class="form-group" style="display: none;">
          <label for="twofa-code">Codi 2FA:</label>
          <input type="text" id="twofa-code" name="twofa-code" maxlength="6" placeholder="123456">
        </div>
        
        <button type="submit" class="login-btn">
          <span class="btn-text">Entrar</span>
          <span class="btn-loading" style="display: none;">⏳ Entrant...</span>
        </button>
        
        <div class="login-divider">
          <span>o</span>
        </div>
        
        <button type="button" class="oauth-btn google-btn" onclick="loginWithGoogle()">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar amb Google
        </button>
        
        <button type="button" class="oauth-btn github-btn" onclick="loginWithGitHub()">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Entrar amb GitHub
        </button>
      </form>
      
      <div class="login-footer">
        <p>No tens compte? <a href="#" onclick="showRegisterForm()">Registra't aquí</a></p>
      </div>
    </div>
    
    <style>
      .login-form-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }
      
      .login-form-wrapper {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
        text-align: center;
      }
      
      .login-header h1 {
        margin: 0 0 8px 0;
        color: #1f2937;
        font-size: 28px;
        font-weight: 700;
      }
      
      .login-header p {
        margin: 0 0 32px 0;
        color: #6b7280;
        font-size: 16px;
      }
      
      .login-form {
        text-align: left;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
      }
      
      .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      
      .form-group input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .login-btn {
        width: 100%;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 20px;
      }
      
      .login-btn:hover {
        background: #2563eb;
      }
      
      .login-btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      
      .btn-loading {
        display: none;
      }
      
      .login-divider {
        position: relative;
        text-align: center;
        margin: 24px 0;
      }
      
      .login-divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e5e7eb;
      }
      
      .login-divider span {
        background: white;
        padding: 0 16px;
        color: #6b7280;
        font-size: 14px;
      }
      
      .oauth-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px 20px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        color: #374151;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 12px;
      }
      
      .oauth-btn:hover {
        border-color: #d1d5db;
        background: #f9fafb;
      }
      
      .google-btn:hover {
        border-color: #4285f4;
        background: #f8faff;
      }
      
      .github-btn:hover {
        border-color: #24292e;
        background: #f6f8fa;
      }
      
      .login-footer {
        margin-top: 24px;
        text-align: center;
      }
      
      .login-footer p {
        color: #6b7280;
        margin: 0;
      }
      
      .login-footer a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }
      
      .login-footer a:hover {
        text-decoration: underline;
      }
    </style>
  `;
  
  // Afegir event listeners
  setupLoginFormEvents(container);
  
  return container;
}

/**
 * Configurar esdeveniments del formulari
 */
function setupLoginFormEvents(container: HTMLElement): void {
  const form = container.querySelector('#login-form') as HTMLFormElement;
  const usernameInput = container.querySelector('#username') as HTMLInputElement;
  const passwordInput = container.querySelector('#password') as HTMLInputElement;
  const twofaInput = container.querySelector('#twofa-code') as HTMLInputElement;
  const twofaGroup = container.querySelector('#twofa-group') as HTMLElement;
  const submitBtn = container.querySelector('.login-btn') as HTMLButtonElement;
  const btnText = container.querySelector('.btn-text') as HTMLElement;
  const btnLoading = container.querySelector('.btn-loading') as HTMLElement;
  
  // Format del codi 2FA
  twofaInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/\D/g, '').slice(0, 6);
  });
  
  // Submit del formulari
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const credentials: LoginCredentials = {
      username: usernameInput.value.trim(),
      password: passwordInput.value,
      twoFactorCode: twofaInput.value || undefined
    };
    
    if (!credentials.username || !credentials.password) {
      showToast('Introdueix usuari i contrasenya', 'error');
      return;
    }
    
    // Mostrar loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
      const response = await loginUser(credentials);
      
      if (response.success) {
        showToast('✅ Login exitós!', 'success');
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      } else if (response.requiresTwoFactor) {
        // Mostrar camp 2FA
        twofaGroup.style.display = 'block';
        twofaInput.focus();
        showToast('Introdueix el codi 2FA', 'info');
      } else {
        showToast(response.message || 'Error d\'autenticació', 'error');
      }
    } catch (error) {
      showToast('Error de connexió', 'error');
    } finally {
      // Amagar loading
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
}

/**
 * Autenticar usuari
 */
async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  
  return await response.json();
}

/**
 * Login amb Google OAuth2
 */
function loginWithGoogle(): void {
  // Usar la URL completa amb host IP des de API_CONFIG
  window.location.href = API_CONFIG.AUTH.GOOGLE;
}

/**
 * Login amb GitHub OAuth2
 */
function loginWithGitHub(): void {
  window.location.href = '/api/auth/oauth2/github';
}

/**
 * Mostrar formulari de registre
 */
function showRegisterForm(): void {
  // TODO: Implementar registre real amb crida POST a /api/auth/register
  showToast('Funcionalitat de registre en desenvolupament', 'info');
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
  
  // Afegir animació
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Auto-remove després de 4 segons
  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 4000);
}

// Funcions globals per OAuth (se criden des dels botons)
(window as any).loginWithGoogle = loginWithGoogle;
(window as any).loginWithGitHub = loginWithGitHub;
(window as any).showRegisterForm = showRegisterForm;

export { loginUser, showToast };
