import { navigateTo } from '../core/router';
import i18n from '../core/i18n';

export const renderPrivacyPage = (): string => {
  // Función auxiliar para formatear listas traducidas
  const formatList = (key: string): string => {
    const translation = i18n.t(key, { returnObjects: true });
    if (Array.isArray(translation)) {
      return translation.map(item => `<li>${item}</li>`).join('');
    }
    return `<li>${translation}</li>`;
  };

  // Render principal
  return `
    <div class="min-h-screen global-bg flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-white/5 p-6">
      <div class="w-full max-w-4xl">
        <!-- Header -->
        <div class="mb-8">
          <button 
            id="privacy-back-btn"
            class="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="text-lg font-medium">${i18n.t('privacy.back')}</span>
          </button>
        </div>
        
        <!-- Content Card (scroll inside) -->
        <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                    outline outline-2 outline-offset-[-2px] outline-cyan-500 
                    p-8 md:p-12 h-[80vh] overflow-y-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-cyan-400 mb-8">
            ${i18n.t('privacy.title')}
          </h1>

          <div class="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <p class="mb-6 text-lg">${i18n.t('privacy.intro')}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.collect.title')}</h2>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-medium text-cyan-200 mb-2">${i18n.t('privacy.collect.personal')}</h3>
                  <ul class="list-disc list-inside ml-4 space-y-2">
                    ${formatList('privacy.collect.personal.list')}
                  </ul>
                </div>
                <div>
                  <h3 class="text-xl font-medium text-cyan-200 mb-2">${i18n.t('privacy.collect.game')}</h3>
                  <ul class="list-disc list-inside ml-4 space-y-2">
                    ${formatList('privacy.collect.game.list')}
                  </ul>
                </div>
                <div>
                  <h3 class="text-xl font-medium text-cyan-200 mb-2">${i18n.t('privacy.collect.tech')}</h3>
                  <ul class="list-disc list-inside ml-4 space-y-2">
                    ${formatList('privacy.collect.tech.list')}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.use.title')}</h2>
              <ul class="list-disc list-inside ml-4 space-y-2">
                ${formatList('privacy.use.list')}
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.share.title')}</h2>
              <p class="mb-4">${i18n.t('privacy.share.text')}</p>
              <ul class="list-disc list-inside ml-4 space-y-2">
                ${formatList('privacy.share.list')}
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.security.title')}</h2>
              <p>${i18n.t('privacy.security.text')}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.rights.title')}</h2>
              <ul class="list-disc list-inside ml-4 space-y-2">
                ${formatList('privacy.rights.list')}
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.cookies.title')}</h2>
              <p>${i18n.t('privacy.cookies.text')}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.children.title')}</h2>
              <p>${i18n.t('privacy.children.text')}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.updates.title')}</h2>
              <p>${i18n.t('privacy.updates.text')}</p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('privacy.contact.title')}</h2>
              <p>${i18n.t('privacy.contact.text')}</p>
            </section>

            <div class="mt-8 pt-6 border-t border-gray-700">
              <p class="text-sm text-gray-500">
                ${i18n.t('privacy.lastUpdated')} 
                ${new Date().toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Inicialización del botón "Volver"
export const initPrivacyPage = (): void => {
  document
    .getElementById('privacy-back-btn')
    ?.addEventListener('click', () => navigateTo('/dashboard'));
};