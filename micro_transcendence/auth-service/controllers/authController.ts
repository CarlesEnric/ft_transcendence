import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fetch from 'node-fetch';
import { jwtDecode } from 'jwt-decode';
import { promisify } from 'util';
import bcrypt from 'bcrypt';


export const authRoutes = async (fastify: FastifyInstance) => {
  // Manually handle the Google OAuth2 callback for custom config
  fastify.get('/login/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = await (fastify as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      console.log('OAuth2 token:', token);
      // Fetch user info from Google (try both endpoints)
      let user: GoogleUserInfo | { error: string; error_description?: string };
      let userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.token.access_token}` }
      });
      user = await userInfoRes.json() as GoogleUserInfo | { error: string; error_description?: string };
      if ('error' in user) {
        // Try alternative endpoint
        userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token.token.access_token}` }
        });
        user = await userInfoRes.json() as GoogleUserInfo | { error: string; error_description?: string };
      }

      console.log('Before fallback check:', user, 'id_token exists:', !!token.token.id_token);
      // Fallback: If still error, try decoding id_token and use it as user info
      if ('error' in user && token.token.id_token) {
        console.log('Entering fallback: decoding id_token');
        const decoded: any = jwtDecode(token.token.id_token);
        console.log('Decoded user info from id_token:', decoded);
        if (decoded.email && decoded.name) {
          user = { email: decoded.email, name: decoded.name };
          console.log('Using fallback user info from id_token:', user);
        } else {
          console.error('id_token does not contain email and name');
          return reply.redirect('/login/failure');
        }
      }
      console.log('After fallback check, user:', user);
      // Always log the final user object used
      console.log('Final user info used for login:', user);

      // Handle Google error response (after fallback)
      if ('error' in user) {
        console.error('Google userinfo error:', user.error, user.error_description);
        return reply.redirect('/login/failure');
      }

      // Store or update user in the database (promisified)
      if (!(fastify as any).db) {
        console.error('fastify.db is undefined!');
        return reply.redirect('/login/failure');
      }
      const db = (fastify as any).db;
      const dbGet = promisify(db.get.bind(db));
      const dbRun = promisify(db.run.bind(db));
      let row;
      try {
        row = await dbGet('SELECT * FROM users WHERE email = ?', [user.email]);
      } catch (err) {
        console.error('Error checking user in the database:', err);
        return reply.redirect('/login/failure');
      }
      if (!row) {
        try {
          await dbRun('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
        } catch (err) {
          console.error('Error inserting user into the database:', err);
          return reply.redirect('/login/failure');
        }
        // Issue JWT for new user
        const jwtToken = (fastify as any).jwt.sign({ email: user.email, name: user.name });
        reply.setCookie('token', jwtToken, { path: '/', httpOnly: true, secure: false }); // recorda posar secure: true en producció
        // return reply.redirect('/login/success');
        return reply.redirect('https://localhost:8000'); // Redirect to home page
      } else {
        // Issue JWT for existing user
        const jwtToken = (fastify as any).jwt.sign({ email: row.email, name: row.name });
        reply.setCookie('token', jwtToken, { path: '/', httpOnly: true, secure: false }); // recorda posar secure: true en producció
        // return reply.redirect('/login/success');
        return reply.redirect('https://localhost:8000'); // Redirect to home page
      }
    } catch (err) {
      console.error('OAuth2 callback error:', err);
      reply.redirect('/login/failure');
    }
  });

  // fastify.get('/login/success', async (request: FastifyRequest, reply: FastifyReply) => {
  //   // Show a simple HTML page for success
  //   reply.type('text/html').send('<h1>Google OAuth2 login successful!</h1><p>You are now logged in.</p>');
  // });

  // fastify.get('/login/failure', async (request: FastifyRequest, reply: FastifyReply) => {
  //   reply.type('text/html').send('<h1>Google OAuth2 login failed.</h1>');
  // });

  // Endpoint to initiate Google OAuth2 login and logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/', httpOnly: true, secure: false }); // recorda posar secure: true en producció
    reply.send({ ok: true });
  });


  // Optional: Protected route for SPA to check auth status
  fastify.get('/api/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await (fastify as any).jwt.verify(request.cookies.token);
      reply.send({ email: user.email, name: user.name, token: request.cookies.token });
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body as any

    // Validació bàsica
    if (!name || !email || !password || password.length < 6) {
      return reply.status(400).send({ error: 'Camps buits o contrasenya massa curta' });
    }

    const db = (fastify as any).db;
    const dbGet = promisify(db.get.bind(db));
    const dbRun = promisify(db.run.bind(db));

    // Comprova si l'usuari ja existeix
    const existing = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return reply.status(400).send({ error: 'Email ja registrat' });
    }

    const hash = await bcrypt.hash(password, 10);
    await dbRun('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);

    // CREA I ENVIA LA COOKIE JWT
    const jwtToken = (fastify as any).jwt.sign({ email, name });
    reply.setCookie('token', jwtToken, { path: '/', httpOnly: true, secure: false, sameSite: 'lax' }); // recorda posar secure: true en producció

    reply.status(201).send({ ok: true, name, email }) // no enviar la contrasenya mai per seguretat
  })

  fastify.post('/login', async (request, reply) => {

    const { email, password } = request.body as any
    const db = (fastify as any).db;
    const dbGet = promisify(db.get.bind(db));

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return reply.status(401).send({ error: 'Usuari no trobat' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return reply.status(401).send({ error: 'Contrasenya incorrecta' })

    // CREA I ENVIA LA COOKIE JWT
    const jwtToken = (fastify as any).jwt.sign({ email: user.email, name: user.name });
    reply.setCookie('token', jwtToken, { path: '/', httpOnly: true, secure: false, sameSite: 'lax' }); // recorda posar secure: true en producció
    reply.send({ ok: true, name: user.name, email: user.email, token: jwtToken }) // no enviar la contrasenya mai per seguretat
  })
  
};

// Type for Google user info
interface GoogleUserInfo {
  email: string;
  name: string;
  // Add more fields if needed
}
