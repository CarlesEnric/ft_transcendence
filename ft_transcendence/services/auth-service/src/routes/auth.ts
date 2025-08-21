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

      // Set JWT as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === 'production', // Only secure in production
        sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
      
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

      // Create user response object
      const userResponse = createUserResponse(user);

      // Generate JWT token
      const token = generateJWTToken(user, config.jwt.secret, config.jwt.expiresIn);

      // Set JWT as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === 'production', // Only secure in production
        sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
      
      reply.setCookie('jwt', token, cookieOptions);

      return reply.code(200).send({
        success: true,
        message: 'Login successful',
        user: userResponse
        // No token in body
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
      // Try to get token from Authorization header, else from cookie
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
      // Extract and verify token
      let decodedToken;
      try {
        decodedToken = verifyJWTToken(token, config.jwt.secret);
      } catch (error) {
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
          userId: user.id,
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
        secure: config.nodeEnv === 'production', // Only secure in production
        sameSite: config.nodeEnv === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
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
