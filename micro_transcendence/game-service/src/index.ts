import Fastify from 'fastify';
import fs from 'fs';
import https from 'https';
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';


const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});


// Certificats per wss
const server = https.createServer({
  key: fs.readFileSync('/app/key.pem'),
  cert: fs.readFileSync('/app/cert.pem'),
});

const wss = new WebSocketServer({ server, path: '/game' });

interface Player {
  id: string;
  ws: WebSocket;
  name: string;
  room: string;
}

const players: Record<string, Player> = {};
const rooms: Record<string, Player[]> = {};

interface UserPayload {
  email: string;
  name: string;
  // afegeix més camps si cal
}

function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as UserPayload;
  } catch {
    return null;
  }
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    if (!req.url) {
    ws.close();
    return;
  }
  const params = new URLSearchParams(req.url?.split('?')[1]);
  const token = params.get('token');
  const user = verifyToken(token || '');
  if (!user) {
    ws.close();
    return;
  }

  const player: Player = { id: user.email, ws, name: user.name, room: '' };
  players[player.id] = player;

  ws.on('message', (data: WebSocket.Data) => {
    const parsed = JSON.parse(data.toString());
    // Aquí reps missatges del client (moviments, xat, etc)
    // Fes broadcast als altres jugadors de la sala
  });

  ws.on('close', () => {
    // Elimina el jugador de la sala i neteja recursos
  });

  // Pots enviar un missatge de benvinguda o estat inicial
  ws.send(JSON.stringify({ type: 'welcome', name: player.name }));
});

server.listen(8000, () => {
  console.log('Game-service wss://localhost:8000/game');
});

const start = async () => {
  try {
    await fastify.listen({ port: 7004, host: "0.0.0.0" });
    fastify.log.info("Game-service running on https://localhost:7004");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


