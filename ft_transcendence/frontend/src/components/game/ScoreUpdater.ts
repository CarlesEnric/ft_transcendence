interface ScoreUpdaterConfig {
  goalsToWin: number;
  onGameEnded?: () => void; // Optional callback when game ends
}

export const createScoreUpdater = (config: ScoreUpdaterConfig) => {
  const { goalsToWin, onGameEnded } = config;

  return (player1: number, player2: number): void => {
    // Update score displays
    const player1ScoreEl = document.getElementById('player1Score');
    const player2ScoreEl = document.getElementById('player2Score');
    
    if (player1ScoreEl) player1ScoreEl.textContent = player1.toString();
    if (player2ScoreEl) player2ScoreEl.textContent = player2.toString();

    // Update progress bars
    const player1Progress = document.getElementById('player1Progress');
    const player2Progress = document.getElementById('player2Progress');

    if (player1Progress) {
      const progress1 = (player1 / goalsToWin) * 100;
      player1Progress.style.width = `${Math.min(progress1, 100)}%`;
    }

    if (player2Progress) {
      const progress2 = (player2 / goalsToWin) * 100;
      player2Progress.style.width = `${Math.min(progress2, 100)}%`;
    }

    // Check if game has ended
    const gameEnded = player1 >= goalsToWin || player2 >= goalsToWin;
    if (gameEnded && onGameEnded) {
      setTimeout(() => {
        onGameEnded();
      }, 1000);
    }
  };
};

export const getWinnerFromDOM = (goalsToWin: number): 'player1' | 'player2' | null => {
  const player1Score = parseInt(document.getElementById('player1Score')?.textContent || '0');
  const player2Score = parseInt(document.getElementById('player2Score')?.textContent || '0');
  
  if (player1Score >= goalsToWin) return 'player1';
  if (player2Score >= goalsToWin) return 'player2';
  return null;
};
