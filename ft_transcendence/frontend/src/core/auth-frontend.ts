/**
 * Authentication Manager - Gestió centralitzada d'autenticació i 2FA
 * Migrat de GameEngine.ts per modularitat
 */

import { API_CONFIG } from '../config/api';
import { getState, setState, checkAuth } from './state';
import { TwoFactorComponent } from '../components/Security/AuthenticationForm.js';
import TwoFactorSetupModal from '../components/Security/SecuritySetupModal.js';
import TwoFactorDisableModal from '../components/Security/SecurityDisableModal.js';
import { navigateToView } from './router';

/**
 * Funció per mostrar el modal de configuració de 2FA (migrat de GameEngine.ts)
 */
export const showTwoFactorSetup = async (): Promise<void> => {
  try {
    const response = await fetch(API_CONFIG.AUTH.TWO_FA.SETUP, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.setup) {
      // Mostrar modal de configuració
      const currentUser = getState().user;
      const setupModal = new TwoFactorSetupModal(data.setup, currentUser!);
      setupModal.show();
      setupModal.onSuccess = async () => {
        await checkAuth();
        showToast('2FA configurat correctament', 'success');
      };
    } else {
      console.error('Failed to fetch 2FA setup data');
      showToast(data.error || 'No s\'ha pogut iniciar la configuració 2FA', 'error');
    }
  } catch (error) {
    console.error('Error fetching 2FA setup:', error);
    showToast('Error de connexió. Torneu a intentar-ho més tard.', 'error');
  }
};

/**
 * Funció per mostrar el modal per desactivar 2FA (migrat de GameEngine.ts)
 */
export const showTwoFactorDisable = async (): Promise<void> => {
  try {
    const disableModal = new TwoFactorDisableModal();
    disableModal.show();
    disableModal.onSuccess = async () => {
      await checkAuth();
      showToast('2FA desactivat correctament', 'success');
    };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    showToast('Error al desactivar 2FA', 'error');
  }
};

/**
 * Gestionar enviament de codi 2FA (migrat de GameEngine.ts)
 */
export const handleTwoFactorSubmit = async (e: Event): Promise<void> => {
  e.preventDefault();
  const codeInput = document.getElementById('twofa-code') as HTMLInputElement;
  const code = codeInput.value.trim();
  
  if (!code) {
    showToast('Si us plau, introdueix el codi 2FA', 'error');
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
      
      // 🧹 Netejar cookies de 2FA pendent
      deleteCookie('pending_2fa');
      deleteCookie('pending_user_id');
      
      // If the response includes user data, we're now fully authenticated
      if (data.user) {
        setState({
          user: data.user,
          currentView: 'dashboard',
          loading: false,
          pendingUser: null
        });
        
        //  Assegurar que el tema es manté després del 2FA
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        navigateToView('dashboard');
        showToast(' Verificació 2FA correcta - Benvingut!', 'success');
      } else {
        // Check authentication status
        await checkAuth();
        showToast(' Verificació 2FA correcta', 'success');
      }
    } else {
      console.error(' 2FA verification failed:', data.error);
      showToast(data.error || 'Codi 2FA incorrecte', 'error');
      // Clear the input for retry
      codeInput.value = '';
      codeInput.focus();
    }
  } catch (error) {
    console.error(' 2FA verification error:', error);
    showToast('Error de xarxa. Si us plau, torna-ho a intentar.', 'error');
    // Clear the input for retry
    codeInput.value = '';
    codeInput.focus();
  }
};

/**
 * Gestionar logout (migrat de GameEngine.ts)
 */
export const handleLogout = async (): Promise<void> => {
  try {
    const response = await fetch(API_CONFIG.AUTH.LOGOUT, {
      method: 'POST',
      credentials: 'include'
    });

    // Limpiar estado independientemente de la respuesta
    setState({
      user: null,
      currentView: 'landing',
      loading: false
    });

    navigateToView('landing');
    showToast('Sessió tancada correctament', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    // Aún así limpiar el estado local
    setState({
      user: null,
      currentView: 'landing',
      loading: false
    });
    navigateToView('landing');
    showToast('Error al tancar sessió, però s\'ha netejat l\'estat local', 'info');
  }
};

/**
 * Gestionar Google login (migrat de GameEngine.ts)
 */
export const handleGoogleLogin = (): void => {
  // Mark that we're starting an OAuth flow using a cookie that will persist
  document.cookie = `oauth_flow_started=true; path=/; max-age=600; secure; samesite=lax`;
  // Redirigir a Google OAuth
  window.location.href = API_CONFIG.AUTH.GOOGLE;
};

/**
 * Montar component 2FA (migrat de GameEngine.ts)
 */
export const mount2FAComponent = (containerId: string = 'twofa-container'): void => {
  const container = document.getElementById(containerId);
  const currentState = getState();
  
  if (container && currentState.user) {
    try {
      const twoFAComponent = new TwoFactorComponent(currentState.user, (state) => {
      });
      
      container.innerHTML = '';
      container.appendChild(twoFAComponent.getElement());
    } catch (error) {
      console.error('Error mounting 2FA component:', error);
      container.innerHTML = '<p class="text-red-600">Error loading 2FA component</p>';
    }
  }
};

/**
 * Inicialitzar event listeners d'autenticació (nova funció modular)
 */
export const initAuthEventListeners = (): void => {
  // TwoFactor form
  const twofaForm = document.getElementById('twofa-form');
  if (twofaForm) {
    twofaForm.addEventListener('submit', handleTwoFactorSubmit);
  }

  // Google login
  const googleLogin = document.getElementById('google-login');
  if (googleLogin) {
    googleLogin.addEventListener('click', handleGoogleLogin);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

};

/**
 * Helper function to get cookie value
 */
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

/**
 * Helper function to delete cookie
 */
const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`;
};

/**
 * Funció per detectar i manejar redirecció OAuth amb 2FA (migrat de GameEngine.ts)
 */
export const handleOAuthRedirect = async (): Promise<boolean> => {
  const params = new URLSearchParams(window.location.search);
  
  
  // � PRIMER: Verificar si URL indica 2FA requerit (des del backend)
  if (params.get('twoFactorRequired') === '1') {
    
    // Show 2FA form directly
    setState({ currentView: '2fa', loading: false });
    
    navigateToView('2fa');
    
    // Clear the param from the URL for cleanliness
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Clear OAuth flow marker
    deleteCookie('oauth_flow_started');
    
    return true; // Handled OAuth redirect
  }
  
  //  OAuth 2FA detection now only via URL params (more secure)
  
  // Check if we have OAuth success indicators (like 'code' or 'state' params)
  if (params.get('code') || params.get('state')) {
    // Clear the params from URL first
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Check authentication status to see if OAuth was successful
    try {
      await checkAuth();
      const state = getState();
      if (state.user) {
        
        //  Assegurar que el tema es manté després del login
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        navigateToView('dashboard');
        showToast('Autenticació amb Google exitosa', 'success');
        // Clear OAuth flow marker
        deleteCookie('oauth_flow_started');
        return true;
      } else {
      }
    } catch (error) {
      console.error(' [OAuth] Error checking auth after OAuth:', error);
      showToast('Error en l\'autenticació amb Google', 'error');
    }
    
    // Clear OAuth flow marker
    deleteCookie('oauth_flow_started');
    return true; // Handled OAuth redirect
  }
  
  // Check if we're returning from an OAuth flow (check cookie)
  const oauthFlowStarted = getCookie('oauth_flow_started');
  if (oauthFlowStarted === 'true') {
    
    try {
      await checkAuth();
      const state = getState();
      
      if (state.user) {
        
        //  Assegurar que el tema es manté després del login
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        navigateToView('dashboard');
        showToast('Autenticació amb Google exitosa', 'success');
        // Clear OAuth flow marker
        deleteCookie('oauth_flow_started');
        return true;
      } else {
        showToast('Error en l\'autenticació amb Google', 'error');
      }
    } catch (error) {
      console.error(' [OAuth] Error checking auth after OAuth redirect:', error);
      showToast('Error en l\'autenticació amb Google', 'error');
    }
    
    // Clear OAuth flow marker regardless of success
    deleteCookie('oauth_flow_started');
    return true; // Handled OAuth redirect
  }
  
  return false; // No OAuth redirect detected
};

/**
 * Mostrar notificació toast (migrat de GameEngine.ts)
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
  
  // Aplicar estils segons el tipus
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-600', 'text-white');
      break;
    case 'error':
      toast.classList.add('bg-red-600', 'text-white');
      break;
    case 'info':
    default:
      toast.classList.add('bg-blue-600', 'text-white');
      break;
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};
