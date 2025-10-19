import { initializeMatchupBracket, createEmptyBracket } from './MatchupBracket';
import type { BracketData, Match, Player } from './MatchupBracket';

// Small helper to create a sample populated BracketData for size 8
export function sampleBracket8(): BracketData {
  const players: Player[] = Array.from({ length: 8 }, (_, i) => ({
    userId: i + 1,
    username: `Player ${i + 1}`,
    avatar: `/images/avatar${(i % 4) + 1}.png`,
    seat: i + 1
  }));

  const matches: Match[] = [];

  // Round 1 (4 matches)
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: i + 1,
      round: 1,
      slot: i + 1,
      status: 'pending',
      player1: players[2 * i] || null,
      player2: players[2 * i + 1] || null,
      score1: null,
      score2: null
    });
  }

  // Round 2 (2 matches) empty
  matches.push({ id: 5, round: 2, slot: 1, status: 'pending', player1: null, player2: null });
  matches.push({ id: 6, round: 2, slot: 2, status: 'pending', player1: null, player2: null });

  // Round 3 (final) empty
  matches.push({ id: 7, round: 3, slot: 1, status: 'pending', player1: null, player2: null });

  return { matches, tournamentSize: 8, currentRound: 1 };
}

// Small helper for size 4
export function sampleBracket4(): BracketData {
  const players: Player[] = Array.from({ length: 4 }, (_, i) => ({
    userId: i + 1,
    username: `Player ${i + 1}`,
    avatar: `/images/avatar${(i % 4) + 1}.png`,
    seat: i + 1
  }));

  const matches: Match[] = [];
  // Round 1 (2 matches)
  for (let i = 0; i < 2; i++) {
    matches.push({ id: i + 1, round: 1, slot: i + 1, status: 'pending', player1: players[2 * i], player2: players[2 * i + 1], score1: null, score2: null });
  }
  // Final
  matches.push({ id: 3, round: 2, slot: 1, status: 'pending', player1: null, player2: null });

  return { matches, tournamentSize: 4, currentRound: 1 };
}

// Mount bracket data into container
export function mountBracketPlayground(containerId = 'main-content', size: 4 | 8 = 8): void {
  const container = document.getElementById(containerId) || document.getElementById('app');
  if (!container) {
    // If DOM not ready or container missing, try to append to body
    const body = document.body || document.documentElement;
    body.insertAdjacentHTML('beforeend', `<div id="${containerId}"></div>`);
  }

  const target = document.getElementById(containerId) || document.getElementById('app');
  if (!target) return;

  const data = size === 8 ? sampleBracket8() : sampleBracket4();
  target.innerHTML = `<div class="p-6">` + initializeMatchupBracket(data) + `</div>`;
}

// Expose to window for quick console testing
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  (window as any).mountBracketPlayground = mountBracketPlayground;
  // @ts-ignore
  (window as any).sampleBracket8 = sampleBracket8;
  // @ts-ignore
  (window as any).sampleBracket4 = sampleBracket4;
}