import i18n from '../../core/i18n';

export interface GameEndedButtonsProps {
  getWinner: () => string | null;
}

export function showGameEndedButtons(props: GameEndedButtonsProps): void {
  const { getWinner } = props;
  
  const playAgainBtn = document.getElementById('playAgain');
  const homeBtn = document.getElementById('homeBtn');
  const gameStatus = document.getElementById('gameStatus');

  if (playAgainBtn && homeBtn) {
    playAgainBtn.classList.remove('hidden');
    playAgainBtn.classList.add('flex');
    homeBtn.classList.remove('hidden');
    homeBtn.classList.add('flex');
  }

  if (gameStatus) {
    const winner = getWinner();
    if (winner === 'player1') {
      gameStatus.innerHTML = i18n.t('game.player1Wins') || 'Player 1 wins!';
      gameStatus.className = 'text-green-400 text-xl font-bold text-center animate-bounce';
    } else if (winner === 'player2') {
      gameStatus.innerHTML = i18n.t('game.player2Wins') || 'Player 2 wins!';
      gameStatus.className = 'text-red-400 text-xl font-bold text-center animate-bounce';
    }
  }
}