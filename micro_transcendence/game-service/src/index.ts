import Fastify from 'fastify';
import fs from 'fs';
import https from 'https';
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { PongGame } from './game/pong';
import helmet from '@fastify/helmet';


const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});

// Registra Helmet per a seguretat i CSP
async function registerHelmet() {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://localhost:8000"], // Permet scripts inline per a facilitar el desenvolupament
        scriptSrc: ["'self'"], // Permet scripts inline per a facilitar el desenvolupament
        styleSrc: ["'self'", "'unsafe-inline'"], // Permet estils inline per a facilitar el desenvolupament
      }
    }
  });
}

// Serveix fitxers estàtics per a la carpeta /assets i és una capçalera de seguretat Content-Security-Policy(CSP) i és necessari per evitar errors de seguretat
// fastify.addHook('onSend', async (request, reply, payload) => {
//   reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self';");
//   return payload;
// });


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

const game = new PongGame(); // Assegura't que tens la classe PongGame definida i importada correctament

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
  game.addPlayer(ws); // Afegeix el jugador al joc

  ws.on('message', (data: WebSocket.Data) => {
    // Aquí reps missatges del client (moviments, xat, etc)
    // Fes broadcast als altres jugadors de la sala
    try {
      const msg = JSON.parse(data.toString());
      game.handleMessage(ws, msg);
    } catch {}
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
    await registerHelmet();
    await fastify.listen({ port: 7004, host: "0.0.0.0" });
    fastify.log.info("Game-service running on https://localhost:7004");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
