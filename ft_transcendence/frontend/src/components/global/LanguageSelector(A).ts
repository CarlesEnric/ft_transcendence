import { navigateTo } from '../../core/router';
import i18n from '../../core/i18n';

export const renderLanguageSelector = (): string => {
  const currentLang = i18n.language;
  
  return `
    <div class="relative btn-electric">
      <button id="languageToggle" class="flex items-center space-x-2 px-3 py-2 rounded transition-colors bg-gray-700 hover:bg-gray-600 text-white">
        <span class="text-lg">${getFlagEmoji(currentLang)}</span>
        <span class="text-sm">${currentLang.toUpperCase()}</span>
        <span class="text-xs">▼</span>
      </button>
      
      <div id="languageDropdown" class="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-600 hidden z-10">
        <div class="py-2">
          <button class="language-option w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center space-x-3" data-lang="en">
            <span class="text-lg">🇺🇸</span>
            <span>${i18n.t('language.english')}</span>
          </button>
          <button class="language-option w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center space-x-3" data-lang="es">
            <span class="text-lg">🇪🇸</span>
            <span>${i18n.t('language.spanish')}</span>
          </button>
          <button class="language-option w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center space-x-3" data-lang="fr">
            <span class="text-lg">🇫🇷</span>
            <span>${i18n.t('language.french')}</span>
          </button>
          <button class="language-option w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center space-x-3" data-lang="ca">
            <span class="text-lg"><svg width="20" height="20" viewBox="0 0 20 20" style="border-radius: 50%; vertical-align: middle;"><rect width="20" height="20" fill="#FCDD09"/><rect width="20" height="2.5" y="2.5" fill="#DA020E"/><rect width="20" height="2.5" y="7.5" fill="#DA020E"/><rect width="20" height="2.5" y="12.5" fill="#DA020E"/><rect width="20" height="2.5" y="17.5" fill="#DA020E"/></svg></span>
            <span>${i18n.t('language.catalan')}</span>
          </button>
        </div>
      </div>
    </div>
  `;
};

export const initLanguageSelector = (): void => {
  const toggleButton = document.getElementById('languageToggle');
  const dropdown = document.getElementById('languageDropdown');
  const options = document.querySelectorAll('.language-option');

  // Toggle dropdown
  toggleButton?.addEventListener('click', () => {
    dropdown?.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!toggleButton?.contains(event.target as Node) && 
        !dropdown?.contains(event.target as Node)) {
      dropdown?.classList.add('hidden');
    }
  });

  // Handle language change
  options.forEach(option => {
    option.addEventListener('click', (event) => {
      const newLang = (event.currentTarget as HTMLElement).dataset.lang;
      if (newLang) {
        changeLanguage(newLang);
        dropdown?.classList.add('hidden');
      }
    });
  });
};

const getFlagEmoji = (lang: string): string => {
  const flags: { [key: string]: string } = {
    'en': '🇺🇸',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'ca': '<svg width="20" height="20" viewBox="0 0 20 20" style="border-radius: 50%; vertical-align: middle;"><rect width="20" height="20" fill="#FCDD09"/><rect width="20" height="2.5" y="2.5" fill="#DA020E"/><rect width="20" height="2.5" y="7.5" fill="#DA020E"/><rect width="20" height="2.5" y="12.5" fill="#DA020E"/><rect width="20" height="2.5" y="17.5" fill="#DA020E"/></svg>'
  };
  return flags[lang] || '🌐';
};

const changeLanguage = (language: string): void => {
  i18n.changeLanguage(language);
  localStorage.setItem('preferredLanguage', language);
  
  // Recargar la página actual para aplicar los cambios
  const currentPath = window.location.pathname;
  //window.location.reload(); or simply re-render the current page
  navigateTo(currentPath);
};