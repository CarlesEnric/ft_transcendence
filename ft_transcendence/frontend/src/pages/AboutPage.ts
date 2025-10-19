import { navigateTo } from '../core/router';
import i18n from '../core/i18n';

export const renderAboutPage = (): string => {
  return `
    <div class="min-h-screen global-bg flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-white/5 p-6">
      <div class="w-full max-w-4xl">
        <!-- Header -->
        <div class="mb-8">
          <button 
            id="about-back-btn" 
            class="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="text-lg font-medium">${i18n.t('about.back')}</span>
          </button>
        </div>

        <!-- Content Card (scroll inside) -->
        <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                    outline outline-2 outline-cyan-500 p-8 md:p-12 h-[80vh] overflow-y-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-cyan-400 mb-8">${i18n.t('about.title')}</h1>

          <div class="space-y-8 text-gray-300 leading-relaxed">
            <section><p>${i18n.t('about.intro')}</p></section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.mission.title')}</h2>
              <p>${i18n.t('about.mission.text')}</p>
            </section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.features.title')}</h2>
              <ul class="list-disc list-inside ml-4 space-y-2">
                <li><b>${i18n.t('about.features.modes')}:</b> ${i18n.t('about.features.modes.desc')}</li>
                <li><b>${i18n.t('about.features.rank')}:</b> ${i18n.t('about.features.rank.desc')}</li>
                <li><b>${i18n.t('about.features.community')}:</b> ${i18n.t('about.features.community.desc')}</li>
                <li><b>${i18n.t('about.features.realtime')}:</b> ${i18n.t('about.features.realtime.desc')}</li>
              </ul>
            </section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.team.title')}</h2>
              <p>${i18n.t('about.team.text')}</p>
            </section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.tech.title')}</h2>
              <p>${i18n.t('about.tech.text')}</p>
            </section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.community.title')}</h2>
              <p>${i18n.t('about.community.text')}</p>
            </section>
            <section>
              <h2 class="text-2xl font-semibold text-cyan-300 mb-3">${i18n.t('about.contact.title')}</h2>
              <p>${i18n.t('about.contact.text')}</p>
            </section>

            <div class="mt-8 pt-6 border-t border-gray-700">
              <p class="text-sm text-gray-500">${i18n.t('about.version')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const initAboutPage = (): void => {
  document
    .getElementById('about-back-btn')
    ?.addEventListener('click', () => navigateTo('/dashboard'));
};