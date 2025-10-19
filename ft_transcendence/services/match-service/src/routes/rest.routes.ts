import type { FastifyInstance } from 'fastify';
import {
  createTournament, joinTournament, startTournament, getBracket, reportTournamentMatch,
  listTournaments, getTournamentById, allocateRoomForTournamentMatch,
  leaveTournament, cancelTournament, seedInlineTournament
} from '../controllers/tournament.controller.js';
import {
  createRoom, joinRoom, setReady, getRoom, finishRoom, leaveRoom, cancelRoom, quickMatch
} from '../controllers/room.controller.js';
import { listMatches, getDashboard, getLeaderboard, createOfflineMatch } from '../controllers/match.controller.js';
import sseRoutes from './sse.routes.js';

export default async function restRoutes(f: FastifyInstance) {
  // Torneos
  f.post('/tournaments', createTournament);
  f.post('/tournaments/:id/join', joinTournament);
  f.post('/tournaments/:id/start', startTournament);
  f.get('/tournaments/:id/bracket', getBracket);
  f.post('/tournaments/:id/matches/:matchId/report', reportTournamentMatch);
  f.get('/tournaments', listTournaments);
  f.get('/tournaments/:id', getTournamentById);
  f.post('/tournaments/:id/matches/:matchId/allocate-room', allocateRoomForTournamentMatch);
  f.post('/tournaments/:id/leave', leaveTournament);
  f.post('/tournaments/:id/cancel', cancelTournament);
  f.post('/tournaments/:id/seed-inline', seedInlineTournament);
  
  // Salas (partidos fuera/ dentro de torneo)
  f.post('/rooms', createRoom);
  f.post('/rooms/join', joinRoom);
  f.post('/rooms/:code/ready', setReady);
  f.get('/rooms/:code', getRoom);
  f.post('/rooms/quickmatch', quickMatch);
  f.post('/rooms/finish', finishRoom);
  f.post('/rooms/:code/leave', leaveRoom);
  f.post('/rooms/:code/cancel', cancelRoom);

  // Matches (historial offline/local)
  f.post('/', createOfflineMatch);
  
  // Estadísticas

  f.get('/', listMatches);
  f.get('/dashboard', getDashboard);
  f.get('/leaderboard', getLeaderboard);

  // SSE (partidos y torneos)
  await f.register(sseRoutes);
}