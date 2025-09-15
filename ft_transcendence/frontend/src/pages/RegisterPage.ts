import { navigateTo } from '../core/router';
import { setUser } from '../core/state';
import { renderLanguageSelector, initLanguageSelector } from '../components/global/LanguageSelector(A)';
import { renderFooter, initFooter } from '../components/global/Footer(A)';
import i18n from '../core/i18n';

export const renderRegisterPage = (): void => {
  const root = document.getElementById('root');
  if (!root) {
    console.error("No s'ha trobat l'element #root per renderRegisterPage");
    return;
  }
  root.innerHTML = `
    <!-- ✅ Background usando la clase global-bg -->
    <div class="min-h-screen global-bg p-4 relative">
      
      <!-- ✅ Language Selector -->
      <div class="absolute top-4 right-4 z-10">
        ${renderLanguageSelector()}
      </div>

      <!-- ✅ Contenido principal centrado -->
      <div class="min-h-screen flex items-center justify-center">
        <div class="w-full max-w-[1200px] px-10 pt-10 pb-6 flex flex-col justify-between items-center">
          
          <!-- ✅ Contenido principal -->
          <div class="flex-1 flex justify-center items-center">
            
            <!-- ✅ Register Card con estilo Figma -->
            <div class="w-96 p-7 bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-blue-300 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
              
              <!-- ✅ Header Section -->
              <div class="self-stretch flex flex-col justify-start items-center gap-8">
                
                <!-- ✅ Welcome Text -->
                <div class="flex flex-col justify-start items-center gap-3">
                  <div class="flex justify-center items-center gap-2">
                    <div class="text-center text-white text-4xl font-semibold font-['Inter'] leading-loose">
                      ${i18n.t('auth.createAccount') || 'Create Account'}
                    </div>
                  </div>
                  <div class="self-stretch flex justify-center items-center gap-2">
                    <div class="text-center text-white text-base font-light font-['Inter'] leading-loose">
                      ${i18n.t('auth.joinUs') || 'Join us and start playing!'}
                    </div>
                  </div>
                </div>
                
                <!-- ✅ Form Section -->
                <form id="registerForm" class="self-stretch flex flex-col justify-start items-start gap-7">
                  
                  <!-- ✅ Input Fields -->
                  <div class="self-stretch flex flex-col justify-start items-start gap-6">
                    <div class="self-stretch flex flex-col justify-start items-start gap-3">
                      
                      <!-- ✅ Username Field -->
                      <div class="self-stretch flex flex-col justify-start items-start gap-1">
                        <div class="flex justify-start items-center gap-2">
                          <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                            ${i18n.t('auth.username') || 'Username'}
                          </div>
                        </div>
                        <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                          <input 
                            type="text" 
                            id="username" 
                            name="username"
                            required
                            class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                            placeholder="${i18n.t('auth.usernamePlaceholder') || 'Enter your username'}"
                          />
                        </div>
                      </div>
                      
                      <!-- ✅ Email Field -->
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
                            placeholder="${i18n.t('auth.emailPlaceholder') || 'Enter your email'}"
                          />
                        </div>
                      </div>
                      
                      <!-- ✅ Password Field -->
                      <div class="self-stretch flex flex-col justify-start items-start gap-1">
                        <div class="flex justify-start items-center gap-2">
                          <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                            ${i18n.t('auth.password') || 'Password'}
                          </div>
                        </div>
                        <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                          <input 
                            type="password" 
                            id="password" 
                            name="password"
                            required
                            class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                            placeholder="${i18n.t('auth.passwordPlaceholder') || 'Enter your password'}"
                          />
                        </div>
                      </div>
                      
                      <!-- ✅ Confirm Password Field -->
                      <div class="self-stretch flex flex-col justify-start items-start gap-1">
                        <div class="flex justify-start items-center gap-2">
                          <div class="text-center text-white text-sm font-medium font-['Inter'] leading-tight">
                            ${i18n.t('auth.confirmPassword') || 'Confirm Password'}
                          </div>
                        </div>
                        <div class="self-stretch h-10 px-3 py-2 bg-gray-800 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-600 flex justify-start items-center gap-2">
                          <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword"
                            required
                            class="w-full bg-transparent text-white text-sm font-normal font-['Inter'] leading-tight placeholder-gray-400 focus:outline-none"
                            placeholder="${i18n.t('auth.confirmPasswordPlaceholder') || 'Confirm your password'}"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <!-- ✅ Register Button -->
                    <button 
                      type="submit"
                      class="self-stretch h-11 px-6 py-3 bg-cyan-200 hover:bg-cyan-300 rounded-lg flex justify-center items-center gap-1.5 transition-colors"
                    >
                      <div class="text-center text-teal-800 text-lg font-bold font-['Inter'] leading-tight">
                        ${i18n.t('auth.registerButton') || 'REGISTER'}
                      </div>
                    </button>
                  </div>
                  
                  <!-- ✅ Divider OR -->
                  <div class="self-stretch flex justify-center items-center gap-6">
                    <div class="flex-1 h-0.5 bg-white opacity-50"></div>
                    <div class="text-white text-base font-light font-['Inter'] leading-loose tracking-widest">
                      ${i18n.t('auth.or') || 'OR'}
                    </div>
                    <div class="flex-1 h-0.5 bg-white opacity-50"></div>
                  </div>
                  
                  <!-- ✅ Google Register Button -->
                  <button 
                    type="button"
                    id="googleRegister"
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
                      ${i18n.t('auth.googleRegister') || 'Register with Google'}
                    </div>
                  </button>
                </form>
                
                <!-- ✅ Login Link -->
                <div class="flex flex-col justify-start items-center gap-3">
                  <div class="self-stretch flex justify-center items-center gap-2">
                    <div class="text-center text-white text-base font-light font-['Inter'] leading-loose">
                      ${i18n.t('auth.haveAccount') || 'Already have an account?'}
                    </div>
                    <button id="loginLink" class="text-center text-cyan-400 text-base font-semibold font-['Inter'] underline leading-loose hover:text-cyan-300 transition-colors">
                      ${i18n.t('auth.signInHere') || 'Sign in here'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- ✅ Footer -->
          <div class="w-full flex justify-center">
            ${renderFooter()}
          </div>
        </div>
      </div>
      
    </div>
  `;

  // ✅ Initialize components
  initLanguageSelector();
  initFooter();

  // ✅ Event listeners
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      showToast(i18n.t('auth.passwordMismatch') || 'Passwords do not match!', 'error');
      return;
    }

    // Validación adicional de contraseña
    if (password.length < 9) {
      showToast(i18n.t('auth.passwordTooShort') || 'Password must be at least 9 characters long!', 'error');
      return;
    }

    try {
      // Crida real al backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
  setUser({ userId: data.user?.userId || data.userId, username, email });
  showToast(i18n.t('auth.registerSuccess') || 'Registration successful! You can now log in.', 'success');
  setTimeout(() => navigateTo('/login'), 1200);
      } else {
        showToast(data.error || data.message || (i18n.t('auth.registerError') || 'Registration failed. Please try again.'), 'error');
      }
    } catch (error) {
      showToast(i18n.t('auth.registerError') || 'Registration failed. Please try again.', 'error');
    }
  });

  // Toast helper reutilitzat
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

  document.getElementById('loginLink')?.addEventListener('click', () => {
    navigateTo('/login');
  });

  document.getElementById('backToHome')?.addEventListener('click', () => {
    // Utilizar la función pública de la App para cambiar vista
    if ((window as any).app) {
      (window as any).app.setCurrentView('landing');
    } else {
      // Fallback al router si la app no está disponible
      navigateTo('/');
    }
  });

  document.getElementById('googleRegister')?.addEventListener('click', () => {
    console.log('🔍 Google register clicked');
    // Aquí implementarías la lógica de Google OAuth
    alert('Google registration will be implemented soon!');
  });
};