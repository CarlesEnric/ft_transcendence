// components/HeaderCard.ts
import { navigateTo } from '../../core/router';
import { getState, setUser } from '../../core/state';
import i18n from '../../core/i18n';
import { API_CONFIG } from '../../config/api';

// Referències globals (definides per GameEngine)
declare global {
  interface Window {
    app: any;
  }
}

let is2FAEnabled = false; // estado inicial

export const renderHeaderCard = (): string => {
  const { user } = getState();

  return `
  <section id="header-card"
    class="self-stretch p-6 bg-gray-900 rounded-[20px]
           shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
           outline outline-2 outline-offset-[-2px] outline-cyan-500
           flex flex-col lg:flex-row justify-start items-end gap-8">

    <!-- Col: Avatar + Info -->
    <div class="flex items-center gap-6">
      <img class="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full
                  shadow-[0px_2px_8px_0px_rgba(0,240,255,0.20)]"
           src="/assets/images/avatar1.png" alt="avatar"/>
      <div class="p-2 flex flex-col justify-center items-start gap-4">
        <div class="px-3 py-2 bg-teal-600 rounded-lg outline outline-1 outline-teal-600 inline-flex justify-center items-center gap-2">
          <div class="text-center text-white text-base font-semibold leading-none">
            ${user?.username || 'User name'}
          </div>
        </div>

        <!-- 🔐 2FA Switch -->
        <div class="flex flex-col items-start gap-2 cursor-pointer" id="twoFASwitch">
          <div id="twoFASwitchTrack"
               class="w-11 h-6 p-0.5 bg-red-600/70 rounded-full flex justify-start items-center transition-colors duration-300">
            <div id="twoFASwitchThumb"
                 class="w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 transform translate-x-0"></div>
          </div>
          <div id="twoFASwitchLabel" class="text-red-400 text-sm font-semibold">${i18n.t('header.twoFADisabled')}</div>
        </div>

        <div class="px-2 py-2 bg-blue-300 rounded-lg outline outline-1 outline-blue-300 inline-flex justify-center items-center gap-2">
          <div class="text-gray-950 text-sm font-medium">${i18n.t('header.level')}</div>
        </div>
      </div>
    </div>

    <!-- Col: Buddies -->
    <div class="w-full lg:w-80 flex flex-col items-center gap-10">
      <div class="w-full inline-flex justify-start items-start gap-4">
        <img class="w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 avatar-hover" src="/assets/images/avatar2.png" />
        <img class="w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 avatar-hover" src="/assets/images/avatar3.png" />
        <img class="w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 avatar-hover" src="/assets/images/avatar4.png" />
      </div>

      <div class="w-full px-3 py-2 bg-slate-900 rounded-lg outline outline-1 outline-blue-300 inline-flex justify-center items-center gap-2">
        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
        <span class="text-blue-300 text-base font-medium">${i18n.t('header.buddiesOnline')}</span>
      </div>
    </div>

    <!-- Col: Actions -->
    <div class="w-full lg:flex-1 flex flex-col justify-between items-end gap-6">
      <div class="w-full inline-flex justify-end items-start gap-4">
        <button id="settingsBtn"
          class="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 rounded-full grid place-items-center"> 
          <img src="/assets/icons/settings.png" alt="Settings" class="w-10 h-10"/>
        </button>
        
        <button id="logoutIconBtn"
          class="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 rounded-full grid place-items-center">
          <img src="/assets/icons/logout.png" alt="Logout" class="w-10 h-10"/>
        </button>
      </div>

      <div class="flex flex-col items-start gap-3">
        <div class="text-2xl">
          <span class="text-blue-300 font-bold tracking-widest">${i18n.t('header.selectMode')}</span>
          <span class="text-cyan-200 font-black tracking-widest">${i18n.t('header.play')} </span>
        </div>

        <div class="w-full sm:w-[26rem] inline-flex justify-center items-start gap-3">
          <div class="w-40 relative inline-flex flex-col gap-1">
            <select id="modeSelect"
              class="h-11 px-3 py-2 bg-gray-800 text-white rounded-md outline outline-1 outline-gray-600">
              <option>1 vs 1</option>
              <option>1 vs Computer</option>
              <option>1 vs Online</option>
            </select>
          </div>

          <button id="playNowBtn"
            class="flex-1 px-6 py-3 bg-stone-300 rounded-lg font-bold text-gray-700">
            ${i18n.t('header.playNow')}
          </button>
        </div>
      </div>
    </div>
  </section>`;
};

export const initHeaderCard = (): void => {
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    navigateTo('/settings');
  });

  document.getElementById('logoutIconBtn')?.addEventListener('click', () => {
    setUser(null);
    navigateTo('/');
  });

  document.getElementById('playNowBtn')?.addEventListener('click', () => {
    const mode = (document.getElementById('modeSelect') as HTMLSelectElement)?.value || '1 vs 1';
    console.log('PLAY NOW -> mode:', mode);
    navigateTo('/game');
  });

  // 🔐 Toggle 2FA Switch
  const switchEl = document.getElementById('twoFASwitch');
  const track = document.getElementById('twoFASwitchTrack');
  const thumb = document.getElementById('twoFASwitchThumb');
  const label = document.getElementById('twoFASwitchLabel');

  // Check if 2FA is already enabled via API
  fetch(API_CONFIG.AUTH.TWO_FA.STATUS, { 
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    console.log('2FA Status:', data);
    is2FAEnabled = data.enabled || false;
    update2FASwitch(is2FAEnabled);
  })
  .catch(err => {
    console.error('Error checking 2FA status:', err);
  });

  switchEl?.addEventListener('click', () => {
    if (!is2FAEnabled) {
      // Obrir modal de configuració 2FA mitjançant GameEngine
      if (window.app && typeof window.app.showTwoFactorSetup === 'function') {
        window.app.showTwoFactorSetup();
      } else {
        console.error('GameEngine app or showTwoFactorSetup not available');
        // Mostrem un missatge simple
        alert('Per activar 2FA, feu clic a Configuració del vostre perfil');
      }
    } else {
      // Obrir modal per desactivar 2FA mitjançant GameEngine
      if (window.app && typeof window.app.showTwoFactorDisable === 'function') {
        window.app.showTwoFactorDisable();
      } else {
        console.error('GameEngine app or showTwoFactorDisable not available');
        // Mostrem un missatge simple
        alert('Per desactivar 2FA, feu clic a Configuració del vostre perfil');
      }
    }
  });

  function update2FASwitch(enabled: boolean) {
    if (enabled) {
      track?.classList.remove('bg-red-600/70', 'justify-start');
      track?.classList.add('bg-teal-600', 'justify-end');
      thumb?.classList.add('translate-x-0');
      label!.textContent = i18n.t('header.twoFAEnabled');
      label!.classList.remove('text-red-400');
      label!.classList.add('text-teal-300');
    } else {
      track?.classList.remove('bg-teal-600', 'justify-end');
      track?.classList.add('bg-red-600/70', 'justify-start');
      thumb?.classList.remove('translate-x-0');
      label!.textContent = i18n.t('header.twoFADisabled');
      label!.classList.remove('text-teal-300');
      label!.classList.add('text-red-400');
    }
  }
};