// gameRoom/Scoreboard.ts
import i18n from '../../core/i18n';

export const renderScoreboard = (isGameEnded: boolean, goalsToWin: number): string => `
  <div class="w-full flex justify-center mb-0 sm:mb-2">
    <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 
                shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
      <div class="flex items-center gap-4 sm:gap-8 text-white">
        <div class="text-center">
          <div class="text-xs sm:text-sm text-gray-300">Player 1</div>
          <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
          <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
            <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
        <div class="text-lg sm:text-2xl text-gray-400">:</div>
        <div class="text-center">
          <div class="text-xs sm:text-sm text-gray-300">AI</div>
          <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
          <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
            <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
