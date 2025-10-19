import i18n from '../../core/i18n';

export class HowToPlay {
  public render(): string {
    return `
      <div id="howto-container" class="relative inline-block">
        <button id="howto-toggle"
          class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold
                 transition-all duration-200 hover:scale-105 transform">
          ${i18n.t('header.howToPlay') || 'How to Play'}
        </button>

        <div id="howto-panel"
          class="absolute left-0 mt-2 w-72 z-50 bg-gray-900 text-cyan-50 rounded-lg shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                 outline outline-2 outline-offset-[-2px] outline-cyan-500 p-4 opacity-0 scale-95 pointer-events-none 
				         transform transition-all duration-300 origin-top">
          
          <h3 class="text-lg font-bold text-cyan-300 mb-2">
            ${i18n.t('howto.title')}
          </h3>

          <ul class="text-sm space-y-2">
            <li><b>${i18n.t('howto.goal').split(':')[0]}:</b> ${i18n.t('howto.goal').split(':')[1]}</li>
            <li><b>${i18n.t('howto.controls').split(':')[0]}:</b> ${i18n.t('howto.controls').split(':')[1]}</li>
            <li><b>${i18n.t('howto.win').split(' ')[0]}:</b> ${i18n.t('howto.win').split(' ').slice(1).join(' ')}</li>
          </ul>
        </div>
      </div>
    `;
  }
}