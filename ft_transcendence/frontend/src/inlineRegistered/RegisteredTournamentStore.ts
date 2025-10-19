export type RegisteredPlayer = {
  id: number;
  name: string;
  avatar?: string;
};

export type RegisteredConfig = {
  name: string;
  size: 4 | 8;
};

export type RegisteredMatchStatus = 'pending' | 'in_progress' | 'finished';

export type RegisteredMatch = {
  id: number;
  round: number;
  slot: number;
  status: RegisteredMatchStatus;
  player1: RegisteredPlayer | null;
  player2: RegisteredPlayer | null;
  winner: RegisteredPlayer | null;
  score1?: number | null;
  score2?: number | null;
};

export type RegisteredState = {
  config: RegisteredConfig;
  matches: RegisteredMatch[];
  currentRound: number;
  finishedAt?: string;
  tournamentId?: number;
  selectedParticipants?: Array<{ userId: number; username: string; avatar?: string }>;
};

const KEY = 'inlineRegistered.tournament';

export function saveInlineRegistered(state: RegisteredState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getInlineRegistered(): RegisteredState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegisteredState;
  } catch {
    return null;
  }
}

export function clearInlineRegistered(): void {
  localStorage.removeItem(KEY);
}

export function createBracketFromPlayers(
  config: RegisteredConfig,
  players: RegisteredPlayer[]
): RegisteredState {
  const size = config.size;
  const top = players.slice(0, size);
  let nextId = 1;
  const matches: RegisteredMatch[] = [];
  if (size === 4) {
    matches.push({
      id: nextId++, round: 1, slot: 1, status: 'pending',
      player1: top[0] ?? null, player2: top[3] ?? null, winner: null
    });
    matches.push({
      id: nextId++, round: 1, slot: 2, status: 'pending',
      player1: top[1] ?? null, player2: top[2] ?? null, winner: null
    });
    matches.push({
      id: nextId++, round: 2, slot: 1, status: 'pending',
      player1: null, player2: null, winner: null
    });
  } else {
    matches.push({ id: nextId++, round: 1, slot: 1, status: 'pending', player1: top[0] ?? null, player2: top[7] ?? null, winner: null });
    matches.push({ id: nextId++, round: 1, slot: 2, status: 'pending', player1: top[3] ?? null, player2: top[4] ?? null, winner: null });
    matches.push({ id: nextId++, round: 1, slot: 3, status: 'pending', player1: top[2] ?? null, player2: top[5] ?? null, winner: null });
    matches.push({ id: nextId++, round: 1, slot: 4, status: 'pending', player1: top[1] ?? null, player2: top[6] ?? null, winner: null });
    matches.push({ id: nextId++, round: 2, slot: 1, status: 'pending', player1: null, player2: null, winner: null });
    matches.push({ id: nextId++, round: 2, slot: 2, status: 'pending', player1: null, player2: null, winner: null });
    matches.push({ id: nextId++, round: 3, slot: 1, status: 'pending', player1: null, player2: null, winner: null });
  }

  const state: RegisteredState = {
    config,
    matches,
    currentRound: 1
  };
  saveInlineRegistered(state);
  return state;
}

export function initRegisteredTournament(
  size: 4 | 8,
  participants: Array<{ userId: number; username: string; avatar?: string }>
): void {
  const players: RegisteredPlayer[] = participants.map((p, i) => ({
    id: p.userId,
    name: p.username,
    avatar: normalizeAvatar(p.avatar) || `/images/avatar${(p.userId % 4) + 1}.png`,
  }));
  const config: RegisteredConfig = { name: `Inline ${new Date().toLocaleTimeString()}`, size };
  const state = createBracketFromPlayers(config, players);
  state.selectedParticipants = participants.map(p => ({
    userId: p.userId, username: p.username, avatar: normalizeAvatar(p.avatar)
  }));
  saveInlineRegistered(state);
}

export function activateNextMatchIfNeeded(s: RegisteredState): RegisteredState {
  const inProg = s.matches.find(m => m.status === 'in_progress');
  if (inProg) return s;
  const pendingCur = s.matches.some(m => m.round === s.currentRound && m.status === 'pending');
  if (!pendingCur) {
    const maxRound = Math.max(...s.matches.map(m => m.round));
    if (s.currentRound < maxRound) {
      s.currentRound += 1;
    }
  }
  const next = s.matches.find(m => m.round === s.currentRound && m.status === 'pending' && m.player1 && m.player2);
  if (next) next.status = 'in_progress';
  saveInlineRegistered(s);
  return s;
}

export function reportLocalResult(s: RegisteredState, matchId: number, score1: number, score2: number): RegisteredState {
  const m = s.matches.find(mm => mm.id === matchId);
  if (!m || !m.player1 || !m.player2) return s;

  m.status = 'finished';
  m.score1 = score1;
  m.score2 = score2;
  m.winner = (score1 > score2) ? m.player1 : m.player2;
  if (s.config.size === 4) {
    if (m.round === 1) {
      const final = s.matches.find(x => x.round === 2 && x.slot === 1);
      if (final) {
        if (m.slot === 1) final.player1 = m.winner;
        if (m.slot === 2) final.player2 = m.winner;
      }
    }
  } else {
    if (m.round === 1) {
      const semi1 = s.matches.find(x => x.round === 2 && x.slot === 1);
      const semi2 = s.matches.find(x => x.round === 2 && x.slot === 2);
      if (semi1 && (m.slot === 1 || m.slot === 2)) {
        if (m.slot === 1) semi1.player1 = m.winner;
        if (m.slot === 2) semi1.player2 = m.winner;
      }
      if (semi2 && (m.slot === 3 || m.slot === 4)) {
        if (m.slot === 3) semi2.player1 = m.winner;
        if (m.slot === 4) semi2.player2 = m.winner;
      }
    } else if (m.round === 2) {
      const final = s.matches.find(x => x.round === 3 && x.slot === 1);
      if (final) {
        if (m.slot === 1) final.player1 = m.winner;
        if (m.slot === 2) final.player2 = m.winner;
      }
    }
  }
  const anyPending = s.matches.some(x => x.status !== 'finished');
  if (!anyPending) {
    s.finishedAt = new Date().toISOString();
  }

  saveInlineRegistered(s);
  return s;
}

export function setInlineRegisteredState(patch: Partial<RegisteredState>): void {
  const s = getInlineRegistered();
  const merged = { ...(s || { config: { name: 'Inline', size: 4 } as RegisteredConfig, matches: [], currentRound: 1 }), ...patch };
  saveInlineRegistered(merged as RegisteredState);
}

export function normalizeAvatar(src?: string): string | undefined
{
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  if (/^\/images\/https?:\/\//i.test(src)) {
    return src.replace(/^\/images\//i, '');
  }
  if (src.startsWith('/images/')) {
    return src;
  }
  const clean = src.replace(/^\/+/, '');
  return `/images/${clean}`;
}