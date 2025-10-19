import { navigateTo } from '../core/router';
import i18n from '../core/i18n';

export const renderTermsPage = (): string => {
  const formatList = (key: string): string => {
    const translation = i18n.t(key, { returnObjects: true });
    if (Array.isArray(translation)) {
      return translation.map(item => `<li>${item}</li>`).join('');
    }
    return `<li>${translation}</li>`;
  };

  return `
    <div class="min-h-screen global-bg flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-white/5 p-6">
      <div class="w-full max-w-4xl">
        <!-- Header -->
        <div class="mb-8">
          <button 
            id="terms-back-btn" 
            class="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="text-lg font-medium">${i18n.t('terms.back')}</span>
          </button>
        </div>

        <!-- Content Card (scroll inside) -->
        <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                    outline outline-2 outline-cyan-500 p-8 md:p-12 h-[80vh] overflow-y-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-cyan-400 mb-8">${i18n.t('terms.title')}</h1>

          <div class="space-y-6 text-gray-300 leading-relaxed">
            ${[1,2,3,4,5,6,7,8].map(n => `
              <section>
                <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t(`terms.${n}.title`)}</h2>
                <p class="mb-4">${i18n.t(`terms.${n}.text`)}</p>
                ${i18n.exists(`terms.${n}.list`)
                  ? `<ul class="list-disc list-inside ml-4 space-y-2">${formatList(`terms.${n}.list`)}</ul>`
                  : ''}
              </section>
            `).join('')}
          </div>

          <div class="mt-8 pt-6 border-t border-gray-700">
            <p class="text-sm text-gray-500">
              ${i18n.t('terms.lastUpdated')} 
              ${new Date().toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const initTermsPage = (): void => {
  document
    .getElementById('terms-back-btn')
    ?.addEventListener('click', () => navigateTo('/dashboard'));
};