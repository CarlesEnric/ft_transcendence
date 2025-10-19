import { listenSSE } from './sse';
import { getState, setPlayerByRole } from './state';

type ApiPlayer = { userId?: number; id?: number; username: string; ready?: 0 | 1 | boolean };
type ApiRoom =
    | { code: string; status: 'waiting' | 'in_progress' | 'finished' | 'cancelled'; players: ApiPlayer[] }
    | { code: string; status: 'waiting' | 'in_progress' | 'finished' | 'cancelled'; players: { player1?: ApiPlayer | null; player2?: ApiPlayer | null } };

type RoomState = {
    code: string;
    status: 'waiting' | 'in_progress' | 'finished' | 'cancelled';
    players: Array<{ userId: number; username: string; ready: 0 | 1 }>;
    score1?: number;
    score2?: number;
    winnerUserId?: number;
};

let currentUnsub: (() => void) | null = null;
const _postedResults = new Set<string>();
function makeResultKey(s: RoomState) {
    return `${s.code}|${s.score1}|${s.score2}|${s.winnerUserId}`;
}
function amIPlayer1(): boolean {
    const st: any = getState();
    return st?.match?.role === 'player1';
}
async function maybeSubmitMatchResult(base: RoomState) {
    if (!base.code || base.score1 == null || base.score2 == null || base.winnerUserId == null) return;
    if (!amIPlayer1()) return;
    const key = makeResultKey(base);
    if (_postedResults.has(key)) return;

    try {
        const res = await fetch(`/api/matches/rooms/finish`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': `result-${key}`,
            },
            body: JSON.stringify({
                code: base.code,
                score1: base.score1,
                score2: base.score2,
                winnerUserId: base.winnerUserId,
            }),
        });

        if (!res.ok) {
            const errTxt = await res.text().catch(() => '');
            console.warn('[RESULT] Falló el POST de resultado', res.status, errTxt);
            return;
        }
        _postedResults.add(key);
    } catch (e) {
        console.warn('[RESULT] Error posteando resultado', e);
    }
}

function toBool(v: any): boolean {
    return v === true || v === 1 || v === '1';
}

function normalizePlayers(raw: ApiRoom['players']): RoomState['players'] {
    if (!Array.isArray(raw)) {
        const p1 = raw.player1 ? { userId: Number(raw.player1.userId ?? raw.player1.id), username: raw.player1.username, ready: toBool(raw.player1.ready) ? 1 : 0 } : null;
        const p2 = raw.player2 ? { userId: Number(raw.player2.userId ?? raw.player2.id), username: raw.player2.username, ready: toBool(raw.player2.ready) ? 1 : 0 } : null;
        return [p1, p2].filter(Boolean) as RoomState['players'];
    }
    return raw
        .map(p => {
            const uid = p.userId ?? p.id;
            if (uid == null) return null;
            return { userId: Number(uid), username: p.username, ready: toBool(p.ready) ? 1 : 0 };
        })
        .filter(Boolean) as RoomState['players'];
}

function applyPlayersToGlobalState(base: RoomState) {
    const state: any = getState();
    const myId: number | undefined = state?.user?.id;
    const myName: string | undefined = state?.user?.username;
    const myRole: 'player1' | 'player2' | undefined = state?.match?.role;
    if (!myRole) return;
    const me = myId ? (base.players.find(p => p.userId === myId) ?? null) : null;
    const other = myId ? (base.players.find(p => p.userId !== myId) ?? null) : (base.players[0] ?? null);
    const meCard = me || (myId && myName
        ? { userId: myId, username: myName, ready: 0 as 0 | 1 }
        : null);

    const toPub = (p: typeof meCard) => p ? ({
        id: p.userId,
        username: p.username,
        email: '',
        ready: p.ready === 1,
    }) : null;
    if (myRole === 'player1') {
        if (meCard) setPlayerByRole('player1', toPub(meCard)!);
        if (other) setPlayerByRole('player2', toPub(other)!);
    } else {
        if (other) setPlayerByRole('player1', toPub(other)!);
        if (meCard) setPlayerByRole('player2', toPub(meCard)!);
    }
    window.dispatchEvent(new CustomEvent('match:players-updated'));
}

async function fetchRoom(code: string): Promise<RoomState> {
    const res = await fetch(`/api/matches/rooms/${code}`, { credentials: 'include' });
    if (res.status === 404) {
        console.warn('[ROOM] snapshot 404 (aún no existe la sala en match-service). Usando esqueleto y esperando SSE…');
        return { code, status: 'waiting', players: [] };
    }
    if (!res.ok) {
        throw new Error(`Room fetch ${res.status}`);
    }
    const raw = (await res.json()) as ApiRoom;
    return {
        code: raw.code,
        status: raw.status,
        players: normalizePlayers(raw.players),
    };
}

function renderRoom(state: RoomState) {
}

export async function initRoomView(code: string) {
    let base = await fetchRoom(code);
    applyPlayersToGlobalState(base);
    renderRoom(base);
    currentUnsub?.();
    currentUnsub = listenSSE(`/api/matches/sse/rooms/${encodeURIComponent(code)}`, (ev) => {
        if (ev.type === 'status') {
            base.status = ev.status;
        } else if (ev.type === 'joined') {
            if (!base.players.find(p => p.userId === ev.userId)) {
                base.players.push({ userId: ev.userId, username: ev.username, ready: 0 });
            }
        } else if (ev.type === 'ready') {
            const p = base.players.find(x => x.userId === ev.userId);
            if (p) p.ready = ev.ready ? 1 : 0;
        } else if (ev.type === 'left') {
            base.players = base.players.filter(p => p.userId !== ev.userId);
        } else if (ev.type === 'finished') {
            base.status = 'finished';
            base.score1 = ev.score1;
            base.score2 = ev.score2;
            base.winnerUserId = ev.winnerUserId;
            maybeSubmitMatchResult(base);
        }
        applyPlayersToGlobalState(base);
        renderRoom(base);
    });
}

export function destroyRoomView() {
    currentUnsub?.();
    currentUnsub = null;
}