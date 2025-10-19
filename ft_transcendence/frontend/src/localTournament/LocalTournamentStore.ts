export type LocalPlayer = {
  id: number;
  name: string;
  avatar: string;
  seat?: number;
};

export type LocalMatch = {
  id: number;
  round: number;
  slot: number;
  status: 'pending' | 'in_progress' | 'finished';
  player1?: LocalPlayer | null;
  player2?: LocalPlayer | null;
  winner?: LocalPlayer | null;
  score1?: number | null;
  score2?: number | null;
};

export type LocalTournamentConfig = {
  name: string;
  size: 4 | 8;
};

export type LocalTournamentState = {
  config: LocalTournamentConfig;
  players: LocalPlayer[];
  matches: LocalMatch[];
  currentRound: number;
  createdAt: string;
  finishedAt?: string | null;
  winner?: LocalPlayer | null;
};

const STORAGE_KEY = 'localTournament';

export function getLocalTournament(): LocalTournamentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveLocalTournament(s: LocalTournamentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function clearLocalTournament(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createBracketFromPlayers(config: LocalTournamentConfig, playersIn: LocalPlayer[]): LocalTournamentState {
  if (playersIn.length !== config.size) {
    throw new Error(`Se esperaban ${config.size} jugadores`);
  }
  const players = shuffle(playersIn).map((p, idx) => ({ ...p, seat: idx + 1 }));
  const matches: LocalMatch[] = [];
  let idCounter = 1;
  if (config.size === 4) {
    matches.push({
      id: idCounter++, round: 1, slot: 1, status: 'pending',
      player1: players[0], player2: players[1], score1: null, score2: null
    });
    matches.push({
      id: idCounter++, round: 1, slot: 2, status: 'pending',
      player1: players[2], player2: players[3], score1: null, score2: null
    });
    matches.push({
      id: idCounter++, round: 2, slot: 1, status: 'pending',
      player1: null, player2: null, score1: null, score2: null
    });
    return {
      config,
      players,
      matches,
      currentRound: 1,
      createdAt: new Date().toISOString(),
      finishedAt: null,
      winner: null
    };
  }
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: idCounter++, round: 1, slot: i + 1, status: 'pending',
      player1: players[2 * i], player2: players[2 * i + 1], score1: null, score2: null
    });
  }
  matches.push({ id: idCounter++, round: 2, slot: 1, status: 'pending', player1: null, player2: null, score1: null, score2: null });
  matches.push({ id: idCounter++, round: 2, slot: 2, status: 'pending', player1: null, player2: null, score1: null, score2: null });
  matches.push({ id: idCounter++, round: 3, slot: 1, status: 'pending', player1: null, player2: null, score1: null, score2: null });

  return {
    config,
    players,
    matches,
    currentRound: 1,
    createdAt: new Date().toISOString(),
    finishedAt: null,
    winner: null
  };
}

export function activateNextMatchIfNeeded(state: LocalTournamentState): LocalTournamentState {
  if (state.finishedAt) {
    saveLocalTournament(state);
    return state;
  }
  const maxRound = Math.max(...state.matches.map(m => m.round));
  if (state.currentRound < 1) state.currentRound = 1;
  if (state.currentRound > maxRound) {
    saveLocalTournament(state);
    return state;
  }
  const inProgress = state.matches.find(m => m.status === 'in_progress');
  if (inProgress) {
    saveLocalTournament(state);
    return state;
  }
  const pendingInRound = state.matches
    .filter(m => m.round === state.currentRound && m.status === 'pending' && m.player1 && m.player2)
    .sort((a, b) => a.slot - b.slot);

  if (pendingInRound.length) {
    pendingInRound[0].status = 'in_progress';
    saveLocalTournament(state);
    return state;
  }
  const stillOpen = state.matches.some(m => m.round === state.currentRound && m.status !== 'finished');
  if (!stillOpen) {
    if (state.currentRound < maxRound) {
      state.currentRound += 1;
      saveLocalTournament(state);
      return activateNextMatchIfNeeded(state);
    } else {
      saveLocalTournament(state);
      return state;
    }
  }
  saveLocalTournament(state);
  return state;
}

export function recordMatchResult(state: LocalTournamentState, matchId: number, s1: number, s2: number): LocalTournamentState {
  const match = state.matches.find(m => m.id === matchId);
  if (!match) return state;
  match.score1 = s1;
  match.score2 = s2;
  match.status = 'finished';
  const winner = (s1 > s2) ? match.player1! : match.player2!;
  match.winner = winner;
  const size = state.config.size;
  if (size === 4) {
    if (match.round === 1) {
      const final = state.matches.find(m => m.round === 2 && m.slot === 1)!;
      if (!final.player1) final.player1 = winner;
      else if (!final.player2) final.player2 = winner;
    }
  } else {
    if (match.round === 1) {
      const targetSemiSlot = match.slot <= 2 ? 1 : 2;
      const semi = state.matches.find(m => m.round === 2 && m.slot === targetSemiSlot)!;
      if (!semi.player1) semi.player1 = winner;
      else if (!semi.player2) semi.player2 = winner;
    } else if (match.round === 2) {
      const final = state.matches.find(m => m.round === 3 && m.slot === 1)!;
      if (!final.player1) final.player1 = winner;
      else if (!final.player2) final.player2 = winner;
    }
  }
  const finalRound = size === 4 ? 2 : 3;
  const finalMatch = state.matches.find(m => m.round === finalRound && m.slot === 1)!;
  if (finalMatch.status === 'finished') {
    state.finishedAt = new Date().toISOString();
    state.winner = finalMatch.winner!;
  }
  saveLocalTournament(state);
  return state;
}