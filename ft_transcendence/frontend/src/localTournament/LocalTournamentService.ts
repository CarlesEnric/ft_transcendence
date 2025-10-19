export type LocalParticipant = {
    userId: number;
    username: string;
    avatar_url?: string;
    joinedAt?: string;
};

export type LocalTournament = {
    id: number;
    name: string;
    status: 'planned' | 'open' | 'in_progress' | 'finished' | 'cancelled';
    size: 4 | 8;
    creator_id: number;
    started_at?: string | null;
    finished_at?: string | null;
    winner_username?: string | null;
    participants: LocalParticipant[];
};

export type LocalMatch = {
    id: number;
    round: number;
    slot: number;
    status: 'pending' | 'in_progress' | 'finished';
    player1_seat?: number | null;
    player2_seat?: number | null;
    winner_username?: string | null;
    score1?: number | null;
    score2?: number | null;
    prev_p1_id?: number | null;
    prev_p2_id?: number | null;
    next_match_id?: number | null;
    next_is_p1?: 0 | 1 | null;
    room_code?: string | null;
};

export type LocalBracket = {
    tournament: { id: number; name: string; size: 4 | 8; status: string };
    seeds: { seat: number; user_id: number; username: string }[];
    matches: LocalMatch[];
};

const LS_KEY = 'localTournament.active';
const LS_BRACKET = 'localTournament.bracket';
const LS_PREFS = 'localTournament.prefs';

// util
const save = (t: LocalTournament) => localStorage.setItem(LS_KEY, JSON.stringify(t));
const load = (): LocalTournament | null => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as LocalTournament; } catch { return null; }
};

const saveBracket = (b: LocalBracket) => localStorage.setItem(LS_BRACKET, JSON.stringify(b));
const loadBracket = (): LocalBracket | null => {
    const raw = localStorage.getItem(LS_BRACKET);
    if (!raw) return null;
    try { return JSON.parse(raw) as LocalBracket; } catch { return null; }
};

type LocalPrefs = { name: string; size: 4 | 8 };
const savePrefs = (p: LocalPrefs) => localStorage.setItem(LS_PREFS, JSON.stringify(p));
const loadPrefs = (): LocalPrefs | null => {
    try {
        const raw = localStorage.getItem(LS_PREFS);
        if (!raw) return null;
        return JSON.parse(raw) as LocalPrefs;
    } catch { return null; }
};

export const LocalTournamentService = {
    reset() {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_BRACKET);
    },

    get(): LocalTournament | null { return load(); },

    create(name: string, size: 4 | 8): LocalTournament {
        this.reset();
        // Persist last used settings
        savePrefs({ name, size });
        const t: LocalTournament = {
            id: Date.now(),
            name,
            size,
            status: 'open',
            creator_id: 1,
            started_at: null,
            finished_at: null,
            winner_username: null,
            participants: []
        };
        save(t);
        return t;
    },

    updateMeta(patch: Partial<Pick<LocalTournament, 'name' | 'size'>>) {
        const t = load();
        if (!t) return null;
        if (patch.size && patch.size !== t.size && t.participants.length <= patch.size) {
            t.size = patch.size as 4 | 8;
        }
        if (patch.name) t.name = patch.name;
        save(t);
        // Update prefs
        savePrefs({ name: t.name, size: t.size });
        return t;
    },

    markStarted() {
        const t = load();
        if (!t) return null;
        t.status = 'in_progress';
        t.started_at = new Date().toISOString();
        save(t);
        return t;
    },

    addOrUpdateParticipants(list: LocalParticipant[]) {
        const t = load();
        if (!t) return null;
        t.participants = list.slice(0, t.size);
        save(t);
        return t;
    },

    join(username: string, avatar_url?: string) {
        const t = load();
        if (!t) return null;
        if (t.participants.length >= t.size) return t;
        const newP: LocalParticipant = {
            userId: Date.now(),
            username,
            avatar_url,
            joinedAt: new Date().toISOString()
        };
        t.participants.push(newP);
        save(t);
        return t;
    },

    leave(userId: number) {
        const t = load();
        if (!t) return null;
        t.participants = t.participants.filter(p => p.userId !== userId);
        save(t);
        return t;
    },

    cancel() {
        const t = load();
        if (!t) return null;
        t.status = 'cancelled';
        save(t);
        return t;
    },

    start(): { tournament: LocalTournament; bracket: LocalBracket } | null {
        const t = load();
        if (!t) return null;
        if (t.participants.length !== t.size) return null;

        const seeds = t.participants.map((p, i) => ({
            seat: i + 1, user_id: p.userId, username: p.username
        }));

        const matches: LocalMatch[] = [];
        if (t.size === 4) {
            matches.push({ id: 1, round: 1, slot: 1, status: 'pending', player1_seat: 1, player2_seat: 2 });
            matches.push({ id: 2, round: 1, slot: 2, status: 'pending', player1_seat: 3, player2_seat: 4 });
            matches.push({ id: 3, round: 2, slot: 1, status: 'pending', prev_p1_id: 1, prev_p2_id: 2 });
        } else {
            matches.push({ id: 1, round: 1, slot: 1, status: 'pending', player1_seat: 1, player2_seat: 2 });
            matches.push({ id: 2, round: 1, slot: 2, status: 'pending', player1_seat: 3, player2_seat: 4 });
            matches.push({ id: 3, round: 1, slot: 3, status: 'pending', player1_seat: 5, player2_seat: 6 });
            matches.push({ id: 4, round: 1, slot: 4, status: 'pending', player1_seat: 7, player2_seat: 8 });
            matches.push({ id: 5, round: 2, slot: 1, status: 'pending', prev_p1_id: 1, prev_p2_id: 2 });
            matches.push({ id: 6, round: 2, slot: 2, status: 'pending', prev_p1_id: 3, prev_p2_id: 4 });
            matches.push({ id: 7, round: 3, slot: 1, status: 'pending', prev_p1_id: 5, prev_p2_id: 6 });
        }

        const bracket: LocalBracket = {
            tournament: { id: t.id, name: t.name, size: t.size, status: 'in_progress' },
            seeds,
            matches
        };

        t.status = 'in_progress';
        t.started_at = new Date().toISOString();
        save(t);
        saveBracket(bracket);

        return { tournament: t, bracket };
    },

    getBracket(): LocalBracket | null { return loadBracket(); },

    setMatchResult(matchId: number, score1: number, score2: number) {
        const t = load();
        const b = loadBracket();
        if (!t || !b) return null;

        const m = b.matches.find(mm => mm.id === matchId);
        if (!m) return { t, b };

        m.status = 'finished';
        m.score1 = score1;
        m.score2 = score2;

        const p1 = m.player1_seat ? b.seeds.find(s => s.seat === m.player1_seat)?.username : null;
        const p2 = m.player2_seat ? b.seeds.find(s => s.seat === m.player2_seat)?.username : null;
        m.winner_username = (score1 ?? 0) >= (score2 ?? 0) ? p1 ?? null : p2 ?? null;

        if (m.winner_username && m.prev_p1_id == null && m.prev_p2_id == null) {
            const next = b.matches.find(nx => nx.prev_p1_id === m.id || nx.prev_p2_id === m.id);
            if (next) {
                const winnerSeat = (m.winner_username === p1) ? m.player1_seat : m.player2_seat;
                if (next.prev_p1_id === m.id) next.player1_seat = winnerSeat ?? null;
                if (next.prev_p2_id === m.id) next.player2_seat = winnerSeat ?? null;
            }
        }
        const finalId = t.size === 4 ? 3 : 7;
        const final = b.matches.find(x => x.id === finalId);
        if (final?.status === 'finished' && final.winner_username) {
            t.status = 'finished';
            t.finished_at = new Date().toISOString();
            t.winner_username = final.winner_username;
        }

        save(t);
        saveBracket(b);
        return { tournament: t, bracket: b };
    },
    getPrefs(): LocalPrefs | null { return loadPrefs(); },
};