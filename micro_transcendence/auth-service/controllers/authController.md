import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import { jwtDecode } from 'jwt-decode';
import { promisify } from 'util';
import bcrypt from 'bcrypt';

// Type for Google user info
interface GoogleUserInfo {
  email: string;
  name: string;
  // Add more fields if needed
}

// --- Helpers ---
function getDb(fastify: FastifyInstance) {
  const db = (fastify as any).db;
  return {
    dbGet: promisify(db.get.bind(db)),
    dbRun: promisify(db.run.bind(db)),
  };
}

function signJwt(fastify: FastifyInstance, payload: { email: string, name: string }) {
  return (fastify as any).jwt.sign(payload);
}

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie('token', token, { path: '/', httpOnly: true, secure: false, sameSite: 'lax' }); // secure: true en prod
}

// --- Main routes ---
export const authRoutes = async (fastify: FastifyInstance) => {
  // Google OAuth2 callback
  fastify.get('/login/google/callback', async (request, reply) => {
    try {
      const token = await (fastify as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      let user: GoogleUserInfo | { error: string; error_description?: string };
      let userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.token.access_token}` }
      });
      user = await userInfoRes.json() as GoogleUserInfo | { error: string; error_description?: string };
      if ('error' in user) {
        userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token.token.access_token}` }
        });
        user = await userInfoRes.json() as GoogleUserInfo | { error: string; error_description?: string };
      }
      if ('error' in user && token.token.id_token) {
        const decoded: any = jwtDecode(token.token.id_token);
        if (decoded.email && decoded.name) user = { email: decoded.email, name: decoded.name };
        else return reply.redirect('/login/failure');
      }
      if ('error' in user) return reply.redirect('/login/failure');

      const { dbGet, dbRun } = getDb(fastify);
      let row = await dbGet('SELECT * FROM users WHERE email = ?', [user.email]);
      if (!row) await dbRun('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
      const jwtToken = signJwt(fastify, { email: user.email, name: user.name });
      setAuthCookie(reply, jwtToken);
      return reply.redirect('https://localhost:8000');
    } catch (err) {
      return reply.redirect('/login/failure');
    }
  });

  // Logout
  fastify.post('/logout', async (_req, reply) => {
    reply.clearCookie('token', { path: '/', httpOnly: true, secure: false });
    reply.send({ ok: true });
  });

  // Check auth status
  fastify.get('/api/me', async (request, reply) => {
    try {
      const user = await (fastify as any).jwt.verify(request.cookies.token);
      reply.send({ email: user.email, name: user.name });
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body as any;
    if (!name || !email || !password || password.length < 6)
      return reply.status(400).send({ error: 'Camps buits o contrasenya massa curta' });

    const { dbGet, dbRun } = getDb(fastify);
    const existing = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return reply.status(400).send({ error: 'Email ja registrat' });

    const hash = await bcrypt.hash(password, 10);
    await dbRun('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    const jwtToken = signJwt(fastify, { email, name });
    setAuthCookie(reply, jwtToken);
    reply.status(201).send({ ok: true, name, email });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;
    const { dbGet } = getDb(fastify);
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return reply.status(401).send({ error: 'Usuari no trobat' });
    if (!user.password) return reply.status(400).send({ error: 'Aquest usuari només pot fer login amb Google' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.status(401).send({ error: 'Contrasenya incorrecta' });

    const jwtToken = signJwt(fastify, { email: user.email, name: user.name });
    setAuthCookie(reply, jwtToken);
    reply.send({ ok: true, name: user.name, email: user.email });
  });
};



