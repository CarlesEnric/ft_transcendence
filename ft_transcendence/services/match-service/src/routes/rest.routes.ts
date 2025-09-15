import type { FastifyInstance } from 'fastify';
import { createTournament, joinTournament, startTournament, getBracket, reportTournamentMatch, listTournaments, getTournamentById } from '../controllers/tournament.controller.js';
import { createRoom, joinRoom, setReady, getRoom, finishRoom, leaveRoom, cancelRoom } from '../controllers/room.controller.js';
import { listMatches, getDashboard, getLeaderboard } from '../controllers/match.controller.js';

export default async function restRoutes(f: FastifyInstance)
{
  // Torneos
  f.post('/tournaments', createTournament);
  f.post('/tournaments/:id/join', joinTournament);
  f.post('/tournaments/:id/start', startTournament);
  f.get('/tournaments/:id/bracket', getBracket);
  f.post('/tournaments/:id/matches/:matchId/report', reportTournamentMatch);
  f.get('/tournaments', listTournaments);
  f.get('/tournaments/:id', getTournamentById);
  // Salas fuera de torneo
  f.post('/rooms', createRoom);
  f.post('/rooms/join', joinRoom);
  f.post('/rooms/:code/ready', setReady);
  f.get('/rooms/:code', getRoom);
  f.post('/rooms/finish', finishRoom);
  f.post('/rooms/:code/leave', leaveRoom);
  f.post('/rooms/:code/cancel', cancelRoom);
  // Estadísticas
  f.get('/', listMatches);
  f.get('/dashboard', getDashboard);
  f.get('/leaderboard', getLeaderboard);
}