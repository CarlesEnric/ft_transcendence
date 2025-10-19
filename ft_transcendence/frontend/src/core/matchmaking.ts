import { getState, setMatch, setPlayerByRole, setPlayerReady, clearMatch, clearPlayers } from './state';
import { initRoomView, destroyRoomView } from './roomView';

export type PlayerRole = 'player1' | 'player2';

type ApiQuickMatch = {
  code?: string;
  role?: 'host' | 'guest';
  error?: string;
};

type ApiRoomPlayer = {
  user_id?: number;
  userId?: number;
  id?: number;
  username: string;
  email?: string;
  ready?: boolean | number;
};

type ApiRoomSnapshot = {
  code?: string;
  status?: 'waiting' | 'ready' | 'started' | 'finished' | 'cancelled';
  players?: ApiRoomPlayer[] | {
    player1?: ApiRoomPlayer | null;
    player2?: ApiRoomPlayer | null;
  };
};

let _pollTimer: number | null = null;
let _lastCode: string | null = null;
let _inflightQuickMatch: Promise<{ roomCode: string; role: PlayerRole }> | null = null;

function normReady(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  return false;
}

function toPublic(p?: ApiRoomPlayer | null) {
  if (!p) return null;
  const id = p.user_id ?? p.userId ?? p.id;
  if (id == null) return null;
  return {
    id: Number(id),
    username: String(p.username),
    email: p.email ?? '',
    ready: normReady(p.ready),
  };
}
async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// TEMP: Función para testing - conectar directamente a room específica
export async function joinSpecificRoom(targetRoomCode: string, targetRole: PlayerRole): Promise<{ roomCode: string; role: PlayerRole }> {
  setMatch({ roomCode: targetRoomCode, role: targetRole });
  
  try {
    const meRes = await fetch('/api/auth/profile', { credentials: 'include' });
    const me = await safeJson<any>(meRes);
    
    // Handle both response formats: direct user data or {success: true, user: {...}}
    const userData = me?.user || me;
    
    if (meRes.ok && userData?.id && userData?.username) {
      setPlayerByRole(targetRole, {
        id: Number(userData.id),
        username: String(userData.username),
        email: userData.email ?? '',
        ready: false
      });
      window.dispatchEvent(new CustomEvent('match:players-updated'));
    }
  } catch {
    console.warn('[TEMP] Could not fetch profile for manual join');
  }

  // TEMP: Simulate the other player for testing UI
  const otherRole = targetRole === 'player1' ? 'player2' : 'player1';
  const simulatedPlayer = {
    id: 999,
    username: targetRole === 'player1' ? 'TestPlayer2' : 'TestPlayer1',
    email: 'test@test.com',
    ready: false
  };
  setPlayerByRole(otherRole, simulatedPlayer);
  window.dispatchEvent(new CustomEvent('match:players-updated'));

  await initRoomView(targetRoomCode);
  return { roomCode: targetRoomCode, role: targetRole };
}

export async function quickMatchOnce(): Promise<{ roomCode: string; role: PlayerRole }> {
  if (_inflightQuickMatch) return _inflightQuickMatch;
  const exec = (async () => {
    const res = await fetch('/api/matches/rooms/quickmatch', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Idempotency-Key': `qm-${Date.now()}` },
    });
    const data = await safeJson<ApiQuickMatch>(res);
    
    if (!res.ok || !data?.code) {
      const msg = data?.error || res.statusText || `Quickmatch falló (status ${res.status})`;
      throw new Error(msg);
    }
    const roomCode = String(data.code);
    const rawRole = data.role ?? 'host';
    const role: PlayerRole = rawRole === 'host' ? 'player1' : 'player2';
    
    setMatch({ roomCode, role });
    
    try {
      const meRes = await fetch('/api/auth/profile', { credentials: 'include' });
      
      const me = await safeJson<any>(meRes);
      
      // Handle both response formats: direct user data or {success: true, user: {...}}
      const userData = me?.user || me;
      
      if (meRes.ok && userData?.id && userData?.username) {
        setPlayerByRole(role, {
          id: Number(userData.id),
          username: String(userData.username),
          email: userData.email ?? '',
          ready: false
        });
        window.dispatchEvent(new CustomEvent('match:players-updated'));
        
        // Check the final state
        const finalState = getState() as any;      } else {
      }
    } catch (error) {
    }

    await initRoomView(roomCode);
    return { roomCode, role };
  })();
  _inflightQuickMatch = exec.finally(() => {
    _inflightQuickMatch = null;
  });
  return exec;
}

function mapSnapshotToRoles(raw: ApiRoomSnapshot) {
  const toPub = (p?: ApiRoomPlayer | null) => toPublic(p);
  if (!Array.isArray(raw.players)) {
    return {
      player1: toPub(raw.players?.player1 ?? null),
      player2: toPub(raw.players?.player2 ?? null),
    };
  }
  const cands = [
    toPub(raw.players[0] ?? null),
    toPub(raw.players[1] ?? null),
  ] as const;
  const state: any = getState();
  const myRole: PlayerRole | undefined = state?.match?.role;
  const meId: number | undefined = state?.user?.id;
  
  
  if (meId && myRole) {
    const me = cands.find(p => p && p.id === meId) ?? null;
    const other = cands.find(p => p && p.id !== meId) ?? null;
    
    if (myRole === 'player1') {
      return { player1: me, player2: other };
    } else {
      return { player1: other, player2: me };
    }
  }
  
  return { player1: cands[0] ?? null, player2: cands[1] ?? null };
}


export async function markReady(): Promise<{ ready: boolean }> {
  const state = getState() as any;
  const code: string | undefined = state?.match?.roomCode;
  if (!code) throw new Error('No hay roomCode activo');

  const meId: number | undefined = state?.user?.id;
  const p1 = state?.players?.player1;
  const p2 = state?.players?.player2;
  
  const myCurrentReady =
    (meId && p1?.id === meId ? !!p1?.ready : false) ||
    (meId && p2?.id === meId ? !!p2?.ready : false);
  const desired = !myCurrentReady;
  
  const url = `/api/matches/rooms/${encodeURIComponent(code)}/ready`;
  
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ready: desired }),
  });
  
  let payload: { ok?: boolean; error?: string } | null = null;
  try {
    payload = await res.json();
  } catch {
  }
  if (!res.ok || payload?.error) {
    throw new Error(payload?.error || `READY ${res.status}`);
  }
  try {
    if (meId && p1?.id === meId) setPlayerReady('player1', desired);
    if (meId && p2?.id === meId) setPlayerReady('player2', desired);
    window.dispatchEvent(new CustomEvent('match:players-updated'));
  } catch { }
  return { ready: desired };
}

export function leaveCurrentRoomSync(): void {
  const state = getState() as any;
  const code: string | undefined = state?.match?.roomCode;
  if (!code) {
    clearPlayers();
    clearMatch();
    return;
  }
  try {
    const url = `/api/matches/rooms/${encodeURIComponent(code)}/leave`;
    const payload = JSON.stringify({ reason: 'page_unload' });
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon?.(url, blob);
  } finally {
    clearPlayers();
    clearMatch();
  }
}

export async function leaveCurrentRoom(): Promise<void> {
  const state = getState() as any;
  const code: string | undefined = state?.match?.roomCode;
  if (!code) {
    clearPlayers();
    clearMatch();
    return;
  }
  try {
    await fetch(`/api/matches/rooms/${encodeURIComponent(code)}/leave`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'user_exit' }),
    });
  } catch {
  } finally {
    clearPlayers();
    clearMatch();
  }
}