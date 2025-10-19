/**
 * Authentication Routes
 * User registration, login, and token validation endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
import { config } from '../config/auth.config.js';
import { parseRegistrationData, parseLoginData, isEmailDomainAllowed, parseProfileUpdateData } from '../validation/auth.validation.js';
import { createUserInDB, findUserByUsername, findUserByEmail } from '../database/database.connection.js';
import { hashPassword, verifyPassword, generateJWTToken, createUserResponse, verifyJWT } from '../auth/auth.handlers.js';
import { blacklistToken } from '../auth/tokenBlacklist.js';
import fetch from 'node-fetch';

// '?' significa que no es obligatori o opcional
interface RegistrationRequestBody {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


interface LoginRequestBody {
  username?: string;
  email?: string;
  password: string;
}

/**
 * Setup authentication routes
 */
export function setupAuthRoutes(server: FastifyInstance, db: sqlite3.Database): void {
  // User Registration Endpoint
  server.post('/register', async (request: FastifyRequest<{ Body: RegistrationRequestBody }>, reply: FastifyReply) => {
    try {
      // Validate input data
      const validationResult = parseRegistrationData(request.body);
      if (!validationResult.success) {
        return reply.code(400).send({ 
          success: false, 
          error: validationResult.error 
        });
      }

      const { username, email, password, firstName, lastName } = validationResult.data;

      // Check if user already exists
      const existingUserByUsername = await findUserByUsername(db, username);
      if (existingUserByUsername) {
        return reply.code(409).send({ 
          success: false, 
          error: 'Username already exists' 
        });
      }

      const existingUserByEmail = await findUserByEmail(db, email);
      if (existingUserByEmail) {
        return reply.code(409).send({ 
          success: false, 
          error: 'Email already exists' 
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password, config.bcrypt.rounds);

      // Create user in database
      const user = await createUserInDB(db, {
        username,
        email,
        firstName,
        lastName,
        password_hash: passwordHash,
      });

      // Create user response object
      const userResponse = createUserResponse(user);

      // Generate JWT token
      const token = generateJWTToken(user);

      // Get request origin domain for cookie
      const host = request.headers.host || '';
      const hostname = host.split(':')[0]; // Remove port if exists
      
      // Log de la request i headers per debugging
      server.log.info(`[DEBUG] Host a auth.ts (register): ${host}, hostname: ${hostname}`);
      server.log.info(`[DEBUG] Headers a auth.ts: ${JSON.stringify(request.headers)}`);
      server.log.info(`[DEBUG] Origin a auth.ts: ${request.headers.origin || 'no-origin'}`);

      // Set JWT as HTTP-only cookie with strict security settings
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
      
      // Log cookie options
      server.log.info(`[DEBUG] Setting JWT cookie with options: ${JSON.stringify(cookieOptions)}`);
      
      reply.setCookie('jwt', token, cookieOptions);

      return reply.code(201).send({
        success: true,
        message: 'User registered successfully',
        user: userResponse
        // No token in body
      });

    } catch (error) {
      server.log.error(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({ 
        success: false, 
        error: 'Internal server error during registration',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // User Login Endpoint
  server.post('/login', async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
    try {
      // Validate input data
      const validationResult = parseLoginData(request.body);
      if (!validationResult.success) {
        return reply.code(400).send({ 
          success: false, 
          error: validationResult.error 
        });
      }

      const { username, email, password } = validationResult.data;

      // Find user by username or email
      let user;
      if (email) {
        user = await findUserByEmail(db, email);
      } else if (username) {
        user = await findUserByUsername(db, username);
      }

      if (!user) {
        return reply.code(401).send({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return reply.code(401).send({ 
          success: false, 
          error: 'Invalid username or password' 
        });
      }

      // Check if user has 2FA enabled
      if (user.two_factor_enabled === 1 || user.two_factor_enabled === true) {
        // Set cookies to indicate pending 2FA with user information
        //  SECURE: Keep httpOnly true for security, detect 2FA from response
        reply.setCookie('pending_2fa', '1', {
          httpOnly: true, //  SECURE: Keep httpOnly true
          secure: true,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 600 // 10 minutes
        });
        // Keep user ID secure (httpOnly: true)
        reply.setCookie('pending_user_id', user.id.toString(), {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 600 // 10 minutes
        });
        
        // Return response indicating 2FA is required
        return reply.code(200).send({
          success: true,
          message: 'Two-factor authentication required',
          twoFactorRequired: true,
          //  SECURE: Explicit flag for frontend detection
          requiresTwoFactor: true
        });
      }

      // Create user response object
      const userResponse = createUserResponse(user);

      // Generate JWT token
      const token = generateJWTToken(user, config.jwt.secret, config.jwt.expiresIn);

      // Get request origin domain for cookie
      const host = request.headers.host || '';
      const hostname = host.split(':')[0]; // Remove port if exists
      
      // Log de la request i headers per debugging
      server.log.info(`[DEBUG] Host a auth.ts (login): ${host}, hostname: ${hostname}`);
      server.log.info(`[DEBUG] Headers a auth.ts: ${JSON.stringify(request.headers)}`);
      server.log.info(`[DEBUG] Origin a auth.ts: ${request.headers.origin || "no-origin"}`);

      // Set JWT as HTTP-only cookie with strict security settings
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
      
      // Log cookie options
      server.log.info(`[DEBUG] Setting JWT cookie with options: ${JSON.stringify(cookieOptions)}`);
      
      reply.setCookie('jwt', token, cookieOptions);

      // Return successful login without 2FA
      return reply.code(200).send({
        success: true,
        message: 'Login successful',
        user: userResponse
      });

    } catch (error) {
      server.log.error(`Login error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({ 
        success: false, 
        error: 'Internal server error during login' 
      });
    }
  });

  // Token Validation Endpoint
  server.get('/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Try to get token from Authorization header, else from cookie
      let token;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
      }
      if (!token) {
        return reply.code(401).send({ 
          success: false, 
          error: 'Missing or invalid authorization header' 
        });
      }
      // Verify JWT token (this will throw if invalid)
      const decoded = verifyJWT(token, config.jwt.secret);
      return reply.code(200).send({
        success: true,
        message: 'Token is valid',
        user: decoded
      });

    } catch (error) {
      return reply.code(401).send({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
  });

  // User Profile Endpoint
  server.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Log all request headers and cookies for debugging
      server.log.info(`[DEBUG] Profile request headers: ${JSON.stringify(request.headers)}`);
      server.log.info(`[DEBUG] Profile request cookies: ${JSON.stringify(request.cookies)}`);
      
      // Try to get token from Authorization header, else from cookie
      let token;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        server.log.info(`[DEBUG] Found token in Authorization header`);
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
        server.log.info(`[DEBUG] Found token in jwt cookie`);
      }
      
      if (!token) {
        server.log.error(`[DEBUG] No token found in request`);
        return reply.code(401).send({
          success: false,
          error: 'Authorization token required'
        });
      }
      
      // Extract and verify token
      let decodedToken;
      try {
        decodedToken = verifyJWT(token, config.jwt.secret);
        server.log.info(`[DEBUG] Successfully verified JWT token for user ID: ${decodedToken.userId}`);
      } catch (error) {
        server.log.error(`[DEBUG] JWT token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Get user data from database
      const user = await new Promise<any>((resolve, reject) => {
        db.get(
          'SELECT id, username, email, firstName, lastName, display_name, provider, avatar_url FROM users WHERE id = ?',
          [decodedToken.userId],
          (err: Error | null, row: any) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }

      // Return user profile
      return reply.send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          display_name: user.display_name,
          provider: user.provider,
          avatar_url: user.avatar_url
        }
      });

    } catch (error) {
      server.log.error(`Profile error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Logout route: revoke token
  server.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    let token;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (request.cookies && request.cookies.jwt) {
      token = request.cookies.jwt;
    }
    if (!token) {
      return reply.code(400).send({ error: 'No token provided' });
    }
    // Blacklist the token
    blacklistToken(token);
    // Revoke Google OAuth2 token if present
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `token=${encodeURIComponent(token)}`,
      });
    } catch (error) {
      // Log error but continue logout
      request.log?.error?.(`Google token revoke failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Remove cookie
    reply.clearCookie('jwt');
    return reply.send({ message: 'Logged out and token revoked' });
  });

  // Update Profile Endpoint
  server.put('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from cookie or Authorization header
      let token;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
      }
      
      if (!token) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token required'
        });
      }
      
      // Verify token
      let decodedToken;
      try {
        decodedToken = verifyJWT(token, config.jwt.secret);
      } catch (error) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Get request body
      const body = request.body as any;
      // Validate request data with Zod
      const validation = parseProfileUpdateData(body);
      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: validation.error
        });
      }

      const { username, email, password, firstName, lastName } = validation.data;

      // Check if user exists and get current data
      const currentUser = await new Promise<any>((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE id = ?',
          [decodedToken.userId],
          (err: Error | null, row: any) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!currentUser) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }

      // Check if it's a Google account (cannot be modified)
      if (currentUser.provider === 'google') {
        return reply.code(403).send({
          success: false,
          error: 'Google accounts cannot be modified'
        });
      }

      // Check if username is already taken by another user
      if (username && username !== currentUser.username) {
        const existingUser = await findUserByUsername(db, username);
        if (existingUser && existingUser.id !== currentUser.id) {
          return reply.code(409).send({
            success: false,
            error: 'Username already exists'
          });
        }
      }

      // Check if email is already taken by another user
      if (email && email !== currentUser.email) {
        const existingUser = await findUserByEmail(db, email);
        if (existingUser && existingUser.id !== currentUser.id) {
          return reply.code(409).send({
            success: false,
            error: 'Email already exists'
          });
        }
      }

      // Update user data
      let updateQuery;
      let updateParams;
      // Check if password needs to be updated (only for regular accounts)
      if (password && currentUser.provider !== 'google') {
        const hashedPassword = await hashPassword(password);
        updateQuery = 'UPDATE users SET username = ?, email = ?, firstName = ?, lastName = ?, display_name = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        updateParams = [
          username || currentUser.username,
          email || currentUser.email,
          firstName || currentUser.firstName,
          lastName || currentUser.lastName,
          body.display_name || currentUser.display_name,
          hashedPassword,
          decodedToken.userId
        ];
      } else {
        updateQuery = 'UPDATE users SET username = ?, email = ?, firstName = ?, lastName = ?, display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        updateParams = [
          username || currentUser.username,
          email || currentUser.email,
          firstName || currentUser.firstName,
          lastName || currentUser.lastName,
          body.display_name || currentUser.display_name,
          decodedToken.userId
        ];
      }

      await new Promise<void>((resolve, reject) => {
        db.run(updateQuery, updateParams, function(err: Error | null) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Get updated user data
      const updatedUser = await new Promise<any>((resolve, reject) => {
        db.get(
          'SELECT id, username, email, firstName, lastName, display_name, provider FROM users WHERE id = ?',
          [decodedToken.userId],
          (err: Error | null, row: any) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      return reply.send({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      server.log.error(`Update profile error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Delete Account Endpoint  
  server.delete('/account', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from cookie or Authorization header
      let token;
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
      }
      
      if (!token) {
        return reply.code(401).send({
          success: false,
          error: 'Authorization token required'
        });
      }
      
      // Verify token
      let decodedToken;
      try {
        decodedToken = verifyJWT(token, config.jwt.secret);
      } catch (error) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Get user data before deletion
      const user = await new Promise<any>((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE id = ?',
          [decodedToken.userId],
          (err: Error | null, row: any) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }

      // Delete user from database
      await new Promise<void>((resolve, reject) => {
        db.run(
          'DELETE FROM users WHERE id = ?',
          [decodedToken.userId],
          function(err: Error | null) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Blacklist the current token
      blacklistToken(token);

      // Clear cookie
      reply.clearCookie('jwt');

      server.log.info(`User account deleted: ${user.username} (ID: ${user.id})`);

      return reply.send({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      server.log.error(`Delete account error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // User Profile Endpoint (GET /user)
  server.get('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from header or cookie
      let token;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
      }
      if (!token) return reply.code(401).send({ error: 'Authorization token required' });
      // Verify token
      let decodedToken;
      try {
        decodedToken = verifyJWT(token, config.jwt.secret);
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
      }
      // Query user data from database
      db.get('SELECT username, email, avatar_url, provider FROM users WHERE id = ?', [decodedToken.userId], (err, row) => {
        if (err || !row) return reply.code(404).send({ error: 'User not found' });
        // Return user data
        return reply.send({ success: true, user: row });
      });
    } catch (error) {
      server.log.error(`Get user profile error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Delete User Endpoint (DELETE /user)
  server.delete('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get token from header or cookie
      let token;
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (request.cookies && request.cookies.jwt) {
        token = request.cookies.jwt;
      }
      if (!token) return reply.code(401).send({ error: 'Authorization token required' });
      // Verify token
      let decodedToken;
      try {
        decodedToken = verifyJWT(token, config.jwt.secret);
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
      }
      // Delete user from database
      db.run('DELETE FROM users WHERE id = ?', [decodedToken.userId], function (err) {
        if (err) return reply.code(500).send({ error: 'Failed to delete account' });
        // Clear JWT cookie
        reply.clearCookie('jwt');
        return reply.send({ success: true, message: 'Account deleted' });
      });
    } catch (error) {
      server.log.error(`Delete user error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Update User Profile Endpoint (PUT /user)
  server.put('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    // Get token from header or cookie
    let token;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.cookies && request.cookies.jwt) {
      token = request.cookies.jwt;
    }
    if (!token) return reply.code(401).send({ error: 'Authorization token required' });
    // Verify token
    let decodedToken;
    try {
      decodedToken = verifyJWT(token, config.jwt.secret);
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
    const { username, email, avatar_url } = request.body as any;
    // Opcional: bloquejar update si és compte Google
    db.get('SELECT username, email, avatar_url, provider FROM users WHERE id = ?', [decodedToken.userId], (err, row: any) => {
      if (err || !row) return reply.code(404).send({ error: 'User not found' });
      if (row.provider === 'google') return reply.code(403).send({ error: 'Google accounts cannot be updated' });
      db.run(
        'UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?',
        [username, email, avatar_url, decodedToken.userId],
        function (err) {
          if (err) return reply.code(500).send({ error: 'Failed to update profile' });
          db.get('SELECT username, email, avatar_url, provider FROM users WHERE id = ?', [decodedToken.userId], (err, updatedRow: any) => {
            if (err || !updatedRow) return reply.code(500).send({ error: 'Failed to fetch updated profile' });
            return reply.send({ success: true, user: updatedRow });
          });
        }
      );
    });
  });
}