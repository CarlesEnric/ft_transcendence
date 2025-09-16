/**
 * Authentication Routes
 * User registration, login, and token validation endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
import { config } from '../config/auth.config.js';
import { parseRegistrationData, parseLoginData } from '../validation/auth.validation.js';
import { createUserInDB, findUserByUsername, findUserByEmail } from '../database/database.connection.js';
import { hashPassword, verifyPassword, generateJWTToken, createUserResponse, verifyJWTToken } from '../auth/auth.handlers.js';

interface RegistrationRequestBody {
  username: string;
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

      const { username, email, password } = validationResult.data;

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
        password_hash: passwordHash,
        is_verified: false
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
        sameSite: 'none' as const,
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
        reply.setCookie('pending_2fa', '1', {
          httpOnly: true,
          secure: true,
          sameSite: 'none' as const,
          path: '/',
          maxAge: 600 // 10 minutes
        });
        reply.setCookie('pending_user_id', user.id.toString(), {
          httpOnly: true,
          secure: true,
          sameSite: 'none' as const,
          path: '/',
          maxAge: 600 // 10 minutes
        });
        
        // Return response indicating 2FA is required
        return reply.code(200).send({
          success: true,
          message: 'Two-factor authentication required',
          twoFactorRequired: true
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
        sameSite: 'none' as const,
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
      const decoded = verifyJWTToken(token, config.jwt.secret);
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
        decodedToken = verifyJWTToken(token, config.jwt.secret);
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
          'SELECT id, username, email FROM users WHERE id = ?',
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
          email: user.email
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

  // User Logout Endpoint
  server.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Cookie options should match exactly those used when setting the cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        domain: process.env.HOST_IP // IP del host
      };

      // Clear the JWT cookie
      reply.clearCookie('jwt', cookieOptions);

      // Alternative: Set the cookie to expire immediately as a fallback
      reply.setCookie('jwt', '', {
        ...cookieOptions,
        expires: new Date(0) // Set to past date to expire immediately
      });

      return reply.code(200).send({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      server.log.error(`Logout error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error during logout'
      });
    }
  });
}
