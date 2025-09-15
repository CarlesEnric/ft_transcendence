import i18n from '../../core/i18n';

export const renderFooter = (): string => {
  return `
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-3 bg-gray-900 rounded-[20px] flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-10 overflow-hidden">
      <button id="footer-terms" class="flex-shrink-0 p-2 sm:p-3 text-cyan-400 text-sm sm:text-lg lg:text-xl font-medium font-['Inter'] hover:text-cyan-300 transition-colors duration-200 whitespace-nowrap">
        ${i18n.t('footer.terms')}
      </button>
      <button id="footer-privacy" class="flex-shrink-0 p-2 sm:p-3 text-cyan-400 text-sm sm:text-lg lg:text-xl font-medium font-['Inter'] hover:text-cyan-300 transition-colors duration-200 whitespace-nowrap">
        ${i18n.t('footer.privacy')}
      </button>
      <button id="footer-about" class="flex-shrink-0 p-2 sm:p-3 text-cyan-400 text-sm sm:text-lg lg:text-xl font-medium font-['Inter'] hover:text-cyan-300 transition-colors duration-200 whitespace-nowrap">
        ${i18n.t('footer.about')}
      </button>
    </div>
  `;
};

// ✅ Función separada para inicializar los event listeners
export const initFooter = (): void => {
  document.getElementById('footer-terms')?.addEventListener('click', () => {
    alert(`${i18n.t('footer.terms')} - Coming soon!`);
  });

  document.getElementById('footer-privacy')?.addEventListener('click', () => {
    alert(`${i18n.t('footer.privacy')} - Coming soon!`);
  });

  document.getElementById('footer-about')?.addEventListener('click', () => {
    alert(`${i18n.t('footer.about')} - Coming soon!`);
  });
};