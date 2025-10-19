import { navigateTo, navigateToView } from '../core/router';
import { setUser, User } from '../core/state';
import { renderLanguageSelector, initLanguageSelector } from '../components/global/LanguageSelector';
import { renderFooter, initFooter } from '../components/global/Footer';
import i18n from '../core/i18n';
import { setupSpaCleanupListeners } from '../utils/spaCleanupListeners';

export const renderLoginPage = (): void => {
  
  // --- Detecta si ve de Google OAuth amb 2FA ---
  const params = new URLSearchParams(window.location.search);
  let pending2FA = false;
  if (params.get('twoFactorRequired') === '1') {
    pending2FA = true;
    setTimeout(() => {
      const twofaGroup = document.getElementById('twofa-group') as HTMLElement;
      const twofaInput = document.getElementById('twofa-code') as HTMLInputElement;
      if (twofaGroup && twofaInput) {
        twofaGroup.style.display = 'block';
        twofaInput.focus();
        showToast('Introdueix el codi 2FA per completar el login', 'info');
      }
      // Bloqueja el formulari normal
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      if (emailInput) emailInput.disabled = true;
      if (passwordInput) passwordInput.disabled = true;
    }, 100);
  }
  const app = document.getElementById('app');
  if (!app) {
    console.error("No s'ha trobat l'element #app per renderLoginPage");
    return;
  }
  app.innerHTML = `
    <!--  Background usando la clase global-bg -->
    <div class="min-h-screen global-bg p-1/2 relative">
      
      <!--  Language Selector -->
      <div class="absolute top-4 right-4 z-10">
        ${renderLanguageSelector()}
      </div>

      <!--  Contenido principal centrado -->
      <div class="min-h-screen flex items-center justify-center overflow-hidden">
        <div class="w-full min-w-[320px] max-w-[1000px] px-6 py-4 flex flex-col justify-between items-center">
          
          <!--  Contenido principal -->
          <div class="w-full flex-1 py-7 flex flex-col justify-center items-center gap-10">
            <div class="flex-1 flex justify-center items-center">
              <!--  Login Card con estilo Figma -->
              <div class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-7 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-blue-300 flex flex-col justify-start items-start gap-2.5 overflow-hidden">

                
                <!--  Header Section -->
                <div class="self-stretch flex flex-col justify-start items-center gap-8">
                  
                  <!--  Welcome Text -->
                  <div class="flex flex-col justify-start items-center gap-3">
                    <div class="flex justify-center items-center gap-2">
                      <div class="text-center text-white text-4xl font-semibold font-['Inter'] leading-loose">
                        ${i18n.t('auth.welcome') || '¡Bienvenido!'}
                      </div>
                    </div>
                    <div class="self-stretch flex justify-center items-center gap-2">
                      <div class="text-center text-white text-base font-light font-['Inter'] leading-loose">
                        ${i18n.t('auth.pleaseLogin') || 'Por favor inicia sesión para entrar.'}
                      </div>
                    </div>
                  </div>
                  
                  <!--  Form Section -->
                  <form id="loginForm" class="self-stretch flex flex-col justify-start items-start gap-7">
                    <!-- Missatge d'error -->
                    <div id="login-error" class="w-full text-red-400 text-sm font-medium mb-2" style="display:none;"></div>
                    
                    <!--  Input Fields -->
                    <div class="self-stretch flex flex-col justify-start items-start gap-6">
                      <div class="self-stretch flex flex-col justify-start items-start gap-3">
                        
                        <!--  Email Field -->
                        <div class="self-stretch flex flex-col justify-start items-start gap-1">
                          <div class="flex justify-start items-center gap-2">
                            <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                              ${i18n.t('auth.email') || 'Email'}
                            </div>
                          </div>
                          <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                            <input 
                              type="email" 
                              id="email" 
                              name="email"
                              required
                              class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                              placeholder="${i18n.t('auth.emailPlaceholder') || 'Email'}"
                            />
                          </div>
                        </div>
                        
                        <!--  Password Field -->
                        <div class="self-stretch flex flex-col justify-start items-start gap-1">
                          <div class="flex justify-start items-center gap-2">
                            <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                              ${i18n.t('auth.password') || 'Contraseña'}
                            </div>
                          </div>
                          <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                            <input 
                              type="password" 
                              id="password" 
                              name="password"
                              required
                              class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                              placeholder="${i18n.t('auth.passwordPlaceholder') || 'Contraseña'}"
                            />
                          </div>
                        </div>
                        <!-- 2FA Field (ocult per defecte) -->
                        <div id="twofa-group" class="self-stretch flex flex-col justify-start items-start gap-1" style="display:none;">
                          <div class="flex justify-start items-center gap-2">
                            <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                              ${i18n.t('auth.twofa') || 'Codi 2FA'}
                            </div>
                          </div>
                          <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                            <input 
                              type="text" 
                              id="twofa-code" 
                              name="twofa-code"
                              maxlength="6"
                              class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                              placeholder=" • • • • • • "
                            />
                          </div>
                        </div>
                      </div>
                      
                      <!--  Login Button -->
                      <button 
                        type="submit"
                        class="self-stretch h-11 px-6 py-3 bg-cyan-200 hover:bg-cyan-300 rounded-lg flex justify-center items-center gap-1.5 transition-colors"
                      >
                        <div class="text-center text-teal-800 text-lg font-bold font-['Inter'] leading-tight">
                          ${i18n.t('auth.loginButton') || 'LOGIN'}
                        </div>
                      </button>
                    </div>
                    
                    <!--  Divider OR -->
                    <div class="self-stretch flex justify-center items-center gap-6">
                      <div class="flex-1 h-0.5 bg-white opacity-50"></div>
                      <div class="text-white text-base font-light font-['Inter'] leading-loose tracking-widest">
                        ${i18n.t('auth.or') || 'OR'}
                      </div>
                      <div class="flex-1 h-0.5 bg-white opacity-50"></div>
                    </div>
                    
                    <!--  Google Login Button -->
                    <button 
                      type="button"
                      id="googleLogin"
                      class="self-stretch p-2 bg-cyan-50/10 hover:bg-cyan-50/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-cyan-100/40 flex justify-start items-center gap-6 transition-colors"
                    >
                      <div class="p-2 bg-cyan-950 rounded-lg flex justify-start items-center gap-2">
                        <svg class="w-10 h-10" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div class="text-white text-xs font-light font-['Inter'] leading-loose">
                        ${i18n.t('auth.googleLogin') || 'Inicia sesión con Google'}
                      </div>
                    </button>
                  </form>
                  
                  <!--  Register Link -->
                  <div class="flex flex-col justify-start items-center gap-3">
                    <div class="self-stretch flex justify-center items-center gap-2">
                      <div class="text-center text-white text-base font-light font-['Inter'] leading-loose">
                        ${i18n.t('auth.noAccount') || '¿No tienes cuenta?'}
                      </div>
                      <button id="registerLink" class="text-center text-cyan-400 text-base font-semibold font-['Inter'] underline leading-loose hover:text-cyan-300 transition-colors">
                        ${i18n.t('auth.registerFree') || 'Regístrate gratis'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!--  Footer -->
           <div class="w-full flex justify-center">
            ${renderFooter()}
          </div>
 

        </div>
      </div>
      
      <!--  Back to Home Button -->
      <button id="backToHome" class="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span class="text-sm font-medium">${i18n.t('common.backToHome') || 'Back to Home'}</span>
      </button>
      
    </div>
  `;

  //  Initialize components
  initLanguageSelector();
  initFooter();

  //  Event listeners

  // --- LOGIN LOGIC MIGRADA DE LoginForm.ts ---
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const twofaInput = document.getElementById('twofa-code') as HTMLInputElement;
  const twofaGroup = document.getElementById('twofa-group') as HTMLElement;
  const errorDiv = document.getElementById('login-error') as HTMLElement;
  const loginBtn = loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
  const btnText = loginBtn.querySelector('div');
  let btnLoading: HTMLSpanElement | null = loginBtn.querySelector('.btn-loading');
  // Si no existeix, el creem (per compatibilitat)
  if (!btnLoading) {
    btnLoading = document.createElement('span');
    btnLoading.className = 'btn-loading';
    btnLoading.style.display = 'none';
    btnLoading.textContent = '⏳ Entrant...';
    loginBtn.appendChild(btnLoading);
  }

  // Format del codi 2FA
  twofaInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/\D/g, '').slice(0, 6);
  });

  // 2FA state
  let lastCredentials: any = null;

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Loading
    loginBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    try {
      if (!pending2FA) {
        // Primer pas: login normal
        const userInput = emailInput.value.trim();
        const password = passwordInput.value;
        if (!userInput || !password) {
          showToast('Introdueix email/usuari i contrasenya', 'error');
          return;
        }
        // Decideix si és email o username
        const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userInput);
        const credentials: any = { password };
        if (isEmail) {
          credentials.email = userInput;
        } else {
          credentials.username = userInput;
        }
        lastCredentials = credentials;
        const response = await loginUser(credentials);
        
        if (response && (response.requiresTwoFactor || response.twoFactorRequired)) {
          // Si es requereix 2FA, mostra el camp 2FA
          pending2FA = true;
          twofaGroup.style.display = 'block';
          twofaInput.focus();
          showToast('🔒 Introdueix el codi 2FA', 'info');
          return;
        } else if (response && response.success && !response.requiresTwoFactor && !response.twoFactorRequired) {
          //  Després de login, fem fetch del perfil complet (inclou avatar_url)
          const { checkAuth } = await import('../core/state');
          await checkAuth();
          showToast(' Login correcte!', 'success');
          //  FIXAT: Utilitzar el mateix sistema que Google OAuth per consistència
          navigateToView('dashboard');
        } else {
          showToast((response && response.message) || "Error d'autenticació", 'error');
        }
      } else {
        // Segon pas: verificar 2FA
        const code = twofaInput.value.trim();
        if (!code || code.length !== 6) {
          showToast('Codi 2FA invàlid', 'error');
          return;
        }
        // POST a /api/auth/2fa/verify
        const verifyRes = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: code })
        });
        const verifyData = await verifyRes.json();
        if (verifyData && verifyData.success) {
          //  Després de 2FA, fem fetch del perfil complet (inclou avatar_url)
          const { checkAuth } = await import('../core/state');
          await checkAuth();
          showToast(' 2FA verificat!', 'success');
          //  FIXAT: Utilitzar el mateix sistema que Google OAuth per consistència
          navigateToView('dashboard');
        } else {
          showToast((verifyData && verifyData.message) || 'Codi 2FA incorrecte', 'error');
          pending2FA = false;
          twofaInput.value = '';
          twofaGroup.style.display = 'none';
        }
      }
    } catch (err) {
      showToast('Error de connexió', 'error');
      pending2FA = false;
      twofaInput.value = '';
      twofaGroup.style.display = 'none';
    } finally {
      loginBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  });

  // OAuth buttons
  document.getElementById('googleLogin')?.addEventListener('click', () => {
    window.location.href = '/api/auth/google'; // Ruta correcta segons backend
  });


  // Toast helper (copiat de LoginForm.ts)
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
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 4000);
  }

  // --- API loginUser ---
  async function loginUser(credentials: { username: string; password: string; twoFactorCode?: string }) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    const result = await response.json();
    return result;
  }

  document.getElementById('registerLink')?.addEventListener('click', () => {
    // Per ara seguim utilitzant el router per register, ja que no hem definit una vista 'register' en l'App
    navigateTo('/register');
  });

  document.getElementById('backToHome')?.addEventListener('click', () => {
    //  MIGRAT: Utilitzar navegació centralitzada del router
    navigateTo('/');
  });

  // Utilitza la utilitat centralitzada per listeners SPA (fletxes externes)
  const cleanup = () => {};
  const rerenderLogin = () => { renderLoginPage(); };
  setupSpaCleanupListeners(cleanup, rerenderLogin);

};

// Noves interfícies per millorar la robustesa i claredat
interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  twoFactorCode?: string;
}

interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  message?: string;
  user?: {
    userId?: number;
    id?: number;
    username: string;
    email: string;
  };
}