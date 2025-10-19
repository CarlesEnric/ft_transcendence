import { navigateTo } from '../core/router';
import { getState, setMatch } from '../core/state';
import { renderFooter, initFooter } from '../components/global/Footer';
import i18n from '../core/i18n';
//  Importamos los nuevos componentes
import { renderLeaderboard, initializeLeaderboard, updateLeaderboard, createEmptyLeaderboard, createLeaderboardFromResults, type LeaderboardData } from '../components/tournament/Leaderboard';
import { renderMatchupBracket, initializeMatchupBracket, updateMatchupBracket, createEmptyBracket, type BracketData, type Match, type Player } from '../components/tournament/MatchupBracket';
import { mountBracketPlayground, sampleBracket8, sampleBracket4 } from '../components/tournament/BracketPlayground';
//  NUEVO: Importamos el header del torneo
import { renderTournamentHeader, setupTournamentHeaderEvents } from '../components/tournament/TournamentHeader';
import { type Tournament, type Participant } from '../components/tournament/ParticipantsGrid';

//  Tipos para la página de enfrentamientos
type BracketResp = {
    tournament: { id: number; name: string; size: 4 | 8; status: string };
    seeds: { seat: number; user_id: number; username: string }[];
    matches: {
        id: number; round: number; slot: number; status: string;
        player1_seat?: number | null; player2_seat?: number | null;
        winner_username?: string | null; score1?: number | null; score2?: number | null;
        prev_p1_id?: number | null; prev_p2_id?: number | null;
        next_match_id?: number | null; next_is_p1?: number | null;
        room_code?: string | null;
    }[];
};

// Variables para polling
let _pollTimer: number | null = null;
let _currentTid: number | null = null;
let _wentToGame = false;
// Resize handler reference for leaderboard sync
let _syncLeaderboardResizeHandler: (() => void) | null = null;

function stopTournamentPolling() {
    if (_pollTimer) {
        window.clearTimeout(_pollTimer);
        _pollTimer = null;
    }
}

function schedulePoll(tournamentId: number) {
    stopTournamentPolling();
    _pollTimer = window.setTimeout(() => pollOnce(tournamentId), 2000) as unknown as number;
}

async function pollOnce(tournamentId: number) {
    if (_wentToGame) return;
    
    //  NUEVO: Verificar si estamos aún en la página del torneo
    const currentPath = window.location.pathname;
    const tournamentPath = `/tournaments/${tournamentId}`;
    if (!currentPath.includes(tournamentPath)) {
        stopTournamentPolling();
        return;
    }
    
    try {
        await renderTournamentBracketPage(tournamentId, true);
    } finally {
        if (!_wentToGame && _currentTid === tournamentId) {
            schedulePoll(tournamentId);
        }
    }
}

//  NUEVO: Función para renderizar matches (del TournamentLobby)
function renderMatches(bracket: BracketResp, tournament: Tournament, me: any, isParticipant: boolean): string {
    const amCreator = me && tournament.creator_id === me.id;
    const seedsBySeat = new Map(bracket.seeds.map(s => [s.seat, s]));
    
    const pName = (seat?: number | null) => {
        if (!seat) return '—';
        const s = seedsBySeat.get(seat);
        return s ? s.username : '—';
    };
    
    return bracket.matches.map(m => {
        const p1 = pName(m.player1_seat);
        const p2 = pName(m.player2_seat);
        const canAllocate = (m.status === 'pending' && p1 !== '—' && p2 !== '—');
        
        return `
        <div class="p-3 rounded bg-gray-800 flex items-center justify-between">
          <div>
            <div class="text-sm opacity-70">${i18n.t('tournament.round') || 'Ronda'} ${m.round} • Slot ${m.slot}</div>
            <div class="text-lg">${p1} vs ${p2}</div>
            <div class="text-xs opacity-70">${i18n.t('tournament.status') || 'Estado'}: ${m.status}${m.room_code ? ` • ${i18n.t('tournament.room') || 'Sala'}: ${m.room_code}` : ''}</div>
            ${m.status === 'finished' ? `<div class="text-xs">${i18n.t('tournament.result') || 'Resultado'}: ${m.score1 ?? '-'} - ${m.score2 ?? '-'} • ${i18n.t('tournament.winner') || 'Ganador'}: ${m.winner_username ?? '-'}</div>` : ''}
          </div>
          <div class="flex gap-2">
            ${(amCreator && canAllocate) ? `<button data-alloc="${m.id}" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors">${i18n.t('tournament.assignRoom') || 'Asignar sala'}</button>` : ''}
            ${(m.room_code && isParticipant) ? `<button data-play="${m.id}" class="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors">${i18n.t('tournament.enter') || 'Entrar'}</button>` : ''}
          </div>
        </div>`;
    }).join('');
}

//  Función principal para renderizar la página de enfrentamientos
export async function renderTournamentBracketPage(tournamentId: number, fromPoll = false) {
    _currentTid = tournamentId;
    const host = document.getElementById('main-content') || document.getElementById('app');
    if (!host) return;
    
    if (!fromPoll) {
        host.innerHTML = `<div class="p-6 text-white">${i18n.t('tournament.loadingMatches') || 'Cargando enfrentamientos…'}</div>`;
    }
    
    let t: Tournament | null = null;
    let bracket: BracketResp | null = null;
    
    try {
        const [res1, res2] = await Promise.all([
            fetch(`/api/matches/tournaments/${tournamentId}`, { credentials: 'include' }),
            fetch(`/api/matches/tournaments/${tournamentId}/bracket`, { credentials: 'include' })
        ]);
        const d1 = await res1.json();
        const d2 = await res2.json();
        if (!res1.ok) throw new Error(d1?.error || 'Error torneo');
        if (!res2.ok) throw new Error(d2?.error || 'Error bracket');
        t = d1 as Tournament;
        bracket = d2 as BracketResp;
    } catch (e: any) {
        if (!fromPoll) {
            host.innerHTML = `<div class="p-6 text-red-300">${i18n.t('tournament.errorLoading') || 'Error cargando enfrentamientos'}: ${e?.message || e}</div>`;
        }
        return;
    }
    
    //  Detectar si el torneo fue cancelado
    if ((t as any).status === 'cancelled') {
        stopTournamentPolling();
        navigateTo('/dashboard');
        return;
    }
    
    //  Detectar si el torneo terminó
    if ((t as any).status === 'finished') {
        stopTournamentPolling();
        // Aquí podrías redirigir a una página de resultados finales
    }
    
    const me = (getState() as any)?.user;
    const isParticipant = me && bracket?.seeds.some(s => s.user_id === me.id);
    
    //  Preparar datos para los componentes
    const leaderboardData = createLeaderboardData(bracket!);
    // Si el backend no devuelve partidos, crear una estructura vacía (placeholder)
    const bracketData = (bracket && bracket.matches && bracket.matches.length > 0)
        ? createBracketData(bracket!)
        : createEmptyBracket(t!.size as 4 | 8);
    
    //  Convertir seeds a participants para el header
    const participants: Participant[] = bracket!.seeds.map(seed => ({
        userId: seed.user_id,
        username: seed.username,
        avatar_url: `/assets/images/avatar${((seed.user_id - 1) % 4) + 1}.png`, // Avatar basado en user_id
        joinedAt: new Date().toISOString() // Timestamp actual
    }));
    
    host.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      
      <!-- Tournament Header Component -->
      ${renderTournamentHeader(t!, participants, 'bracket')}

            <!-- Main Content -->
            <div class="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
                                <!-- Left Column: Leaderboard (1/4) -->
                                <div class="lg:w-1/4 flex">
                                        <div class="w-full h-full">
                                            ${initializeLeaderboard(leaderboardData)}
                                        </div>
                                </div>

                <!-- Right Column: Matchup Bracket (3/4) -->
                <div class="lg:w-3/4">
                    ${initializeMatchupBracket(bracketData)}
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 sm:mt-6">
                ${renderFooter()}
            </div>
      
    </div>
  `;
    
    // Initialize footer
    initFooter();
    
    //  Setup header events
    setupTournamentHeaderEvents(t!, 'bracket');
    
    //  Setup event listeners
    setupEventListeners(t!, bracket!, isParticipant);

    // Sync leaderboard height to matchup bracket so both columns match visually
    function syncLeaderboardHeight() {
        try {
            const bracketEl = document.querySelector('[data-component="matchup-bracket"]') as HTMLElement | null;
            const lbEl = document.querySelector('[data-component="leaderboard"]') as HTMLElement | null;
            if (!bracketEl || !lbEl) return;
            const h = bracketEl.offsetHeight;
            // apply height to the leaderboard root so its internal `.h-full` content fills correctly
            lbEl.style.height = `${h}px`;
        } catch (e) {
            // ignore
        }
    }

    // Run initial sync and keep in sync on resize
    syncLeaderboardHeight();
    // store handler so we can remove later
    _syncLeaderboardResizeHandler = syncLeaderboardHeight;
    window.addEventListener('resize', _syncLeaderboardResizeHandler);
    
    //  Start polling for updates
    if (!_wentToGame && ((t as any).status === 'in_progress')) {
        schedulePoll(tournamentId);
    }

    // Expose playground helpers to window so they can be used from the browser console
    if (typeof window !== 'undefined') {
        // @ts-ignore
        (window as any).mountBracketPlayground = mountBracketPlayground;
        // @ts-ignore
        (window as any).sampleBracket8 = sampleBracket8;
        // @ts-ignore
        (window as any).sampleBracket4 = sampleBracket4;
        // Console helpers to test mapping and auto-advance
        // @ts-ignore
        (window as any).testBracketMapping = (br: BracketResp) => {
            try {
                const bd = createBracketData(br);
                const ld = createLeaderboardData(br);
                console.group('Bracket Mapping Test');
                console.groupEnd();
                // Update UI components if present
                try { updateMatchupBracket(bd); } catch (e) { /* ignore UI update errors */ }
                try { updateLeaderboard(ld); } catch (e) { /* ignore UI update errors */ }
                try { syncLeaderboardHeight(); } catch (e) { /* ignore */ }
                return { bracketData: bd, leaderboardData: ld };
            } catch (err) {
                console.error('testBracketMapping error:', err);
                return null;
            }
        };

        // Simulate finishing a match in the BracketResp object and then run mapping
        // usage: simulateFinishAndAdvance(bracketResp, matchId, winner_username, score1, score2)
        // This mutates the passed object (intended for dev/testing only)
        // @ts-ignore
        (window as any).simulateFinishAndAdvance = (br: BracketResp, matchId: number, winner_username: string, score1?: number, score2?: number) => {
            try {
                const m = br.matches.find(x => x.id === Number(matchId));
                if (!m) {
                    console.error('simulateFinishAndAdvance: match not found', matchId);
                    return null;
                }
                m.status = 'finished';
                m.winner_username = winner_username;
                if (typeof score1 === 'number') m.score1 = score1;
                if (typeof score2 === 'number') m.score2 = score2;
                // Now run the mapping test which will also update the UI
                const res = (window as any).testBracketMapping(br);
                try { syncLeaderboardHeight(); } catch (e) { /* ignore */ }
                return res;
            } catch (err) {
                console.error('simulateFinishAndAdvance error:', err);
                return null;
            }
        };
    }
}

//  Función para crear datos del leaderboard
function createLeaderboardData(bracket: BracketResp): LeaderboardData {
    // Inicializar todos los jugadores con 0 puntos (aseguramos que aparezcan en el leaderboard)
    const playerScores = new Map<number, {username: string, score: number}>();
    bracket.seeds.forEach(seed => {
        playerScores.set(seed.user_id, { username: seed.username, score: 0 });
    });

    // Sumar puntuaciones basadas en goles/score si están presentes
    bracket.matches.forEach(match => {
        if (typeof match.score1 === 'number' && typeof match.score2 === 'number') {
            // sumar los goles al score total de cada jugador si existen seats
            const p1Seat = match.player1_seat;
            const p2Seat = match.player2_seat;
            if (p1Seat) {
                const seed = bracket.seeds.find(s => s.seat === p1Seat);
                if (seed) {
                    const curr = playerScores.get(seed.user_id);
                    if (curr) curr.score += match.score1 ?? 0;
                }
            }
            if (p2Seat) {
                const seed = bracket.seeds.find(s => s.seat === p2Seat);
                if (seed) {
                    const curr = playerScores.get(seed.user_id);
                    if (curr) curr.score += match.score2 ?? 0;
                }
            }
        } else if (match.status === 'finished' && match.winner_username) {
            // Fallback: si no hay scores, dar puntos por ronda al ganador
            const winnerSeed = bracket.seeds.find(s => s.username === match.winner_username);
            if (winnerSeed) {
                const curr = playerScores.get(winnerSeed.user_id);
                if (curr) curr.score += getPointsForRound(match.round);
            }
        }
    });

    // Convertir a formato del leaderboard
    const results = Array.from(playerScores.entries()).map(([userId, data]) => ({
        userId,
        username: data.username,
        score: data.score
    }));

    return createLeaderboardFromResults(results);
}

//  Función para crear datos del bracket
function createBracketData(bracket: BracketResp): BracketData {
    const seedsBySeat = new Map(bracket.seeds.map(s => [s.seat, s]));
    
    // Primero mapear matches básicos
    const matches: Match[] = bracket.matches.map(m => {
        const player1 = m.player1_seat ? seedsBySeat.get(m.player1_seat) : null;
        const player2 = m.player2_seat ? seedsBySeat.get(m.player2_seat) : null;
        const winner = m.winner_username ? 
            (player1?.username === m.winner_username ? player1 : player2) : null;
        
        return {
            id: m.id,
            round: m.round,
            slot: m.slot,
            status: m.status as 'pending' | 'in_progress' | 'finished',
            player1: player1 ? {
                userId: player1.user_id,
                username: player1.username,
                seat: player1.seat
            } : null,
            player2: player2 ? {
                userId: player2.user_id,
                username: player2.username,
                seat: player2.seat
            } : null,
            winner: winner ? {
                userId: winner.user_id,
                username: winner.username,
                seat: winner.seat
            } : null,
            score1: m.score1,
            score2: m.score2,
            room_code: m.room_code
        };
    });

    // Auto-promote winners into next match slots using next_match_id / next_is_p1
    // Creamos un mapa de matches por id para acceso rápido
    const matchesById = new Map<number, Match>();
    matches.forEach(mm => matchesById.set(mm.id, mm));

    // Iterar sobre las filas originales para disponer de next_match_id y next_is_p1
    bracket.matches.forEach(orig => {
        if (orig.status === 'finished' && orig.winner_username && orig.next_match_id) {
            const winnerSeed = bracket.seeds.find(s => s.username === orig.winner_username);
            if (!winnerSeed) return;

            const winnerPlayer: Player = {
                userId: winnerSeed.user_id,
                username: winnerSeed.username,
                seat: winnerSeed.seat
            };

            const target = matchesById.get(orig.next_match_id);
            if (!target) return;

            const placeAsP1 = Boolean(orig.next_is_p1 && Number(orig.next_is_p1) === 1);
            if (placeAsP1) {
                target.player1 = winnerPlayer;
            } else {
                target.player2 = winnerPlayer;
            }
        }
    });

    // Determinar la ronda actual (si hay partidos en progreso toma esa ronda, si no la mínima pendiente)
    const currentRound = matches.find(m => m.status === 'in_progress')?.round || 
                        Math.min(...matches.filter(m => m.status === 'pending').map(m => m.round)) || 1;

    return {
        matches,
        tournamentSize: bracket.tournament.size as 4 | 8,
        currentRound
    };
}

//  Función para calcular puntos por ronda
function getPointsForRound(round: number): number {
    switch (round) {
        case 1: return 1; // Cuartos de final
        case 2: return 2; // Semifinales
        case 3: return 3; // Final
        default: return 1;
    }
}

//  Función para configurar event listeners
function setupEventListeners(tournament: Tournament, bracket: BracketResp, isParticipant: boolean) {
    const me = (getState() as any)?.user;
    const amCreator = me && tournament.creator_id === me.id;
    
    // Back to lobby
    document.getElementById('backToLobby')?.addEventListener('click', () => {
        stopTournamentPolling();
        navigateTo(`/tournaments/${tournament.id}`);
    });
    
    //  NUEVO: Event listeners para botones de matches (del TournamentLobby)
    const matchesContainer = document.querySelector('#matches-container');
    if (matchesContainer) {
        matchesContainer.addEventListener('click', async (ev) => {
            const btn = ev.target as HTMLElement;
            const allocId = btn?.getAttribute?.('data-alloc');
            const playId = btn?.getAttribute?.('data-play');
            
            if (allocId && amCreator) {
                try {
                    const res = await fetch(`/api/matches/tournaments/${tournament.id}/matches/${allocId}/allocate-room`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || res.statusText);
                    // Refrescar la página para mostrar los cambios
                    await renderTournamentBracketPage(tournament.id, false);
                } catch (e: any) {
                    alert(i18n.t('tournament.assignError') || 'No se pudo asignar sala');
                }
            } else if (playId && isParticipant) {
                try {
                    const r = await fetch(`/api/matches/tournaments/${tournament.id}/bracket`, { credentials: 'include' });
                    const b = await r.json() as BracketResp;
                    const match = b.matches.find(m => m.id === Number(playId));
                    if (!match?.room_code) { 
                        alert(i18n.t('tournament.noRoom') || 'Este partido aún no tiene sala');
                        return; 
                    }
                    _wentToGame = true;
                    stopTournamentPolling();
                    setMatch({ roomCode: match.room_code, role: 'player1' });
                    navigateTo('/game');
                } catch (e: any) {
                    alert(i18n.t('tournament.enterError') || 'No se pudo entrar en la sala');
                }
            }
        });
    }
}

//  Función de limpieza
export function cleanupTournamentBracketPage(): void {
    stopTournamentPolling();
    _currentTid = null;
    _wentToGame = false;
    try {
        // remove resize listener if present
        if (_syncLeaderboardResizeHandler) {
            window.removeEventListener('resize', _syncLeaderboardResizeHandler);
            _syncLeaderboardResizeHandler = null;
        }
    } catch (e) {
        // ignore
    }
}