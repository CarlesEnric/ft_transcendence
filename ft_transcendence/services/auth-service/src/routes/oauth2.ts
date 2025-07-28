/**
 * OAuth2 Routes
 * Google OAuth2 authentication using @fastify/oauth2 plugin
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { createUserInDB, findUserByEmail } from '../database/index.js';
import { generateJWTToken } from '../auth/index.js';
import { config } from '../config/index.js';

interface OAuthRouteOptions {
  db: sqlite3.Database;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function registerOAuthRoutes(fastify: FastifyInstance, options: OAuthRouteOptions) {
  const { db } = options;

  /**
   * Manual Google OAuth2 callback handler
   * Handles the authorization code from Google and completes the OAuth2 flow
   */
  fastify.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code, state, error } = request.query as any;
      
      // Check for OAuth2 errors
      if (error) {
        fastify.log.error('OAuth2 error:', error);
        return reply.redirect(`${config.frontend.url}?error=oauth_failed`);
      }
      
      if (!code) {
        return reply.redirect(`${config.frontend.url}?error=no_code`);
      }

      // Exchange authorization code for access token
      const tokenParams = [
        `client_id=${encodeURIComponent(config.oauth.google.clientId)}`,
        `client_secret=${encodeURIComponent(config.oauth.google.clientSecret)}`,
        `code=${encodeURIComponent(code)}`,
        `grant_type=authorization_code`,
        `redirect_uri=${encodeURIComponent(config.oauth.google.redirectUri)}`
      ].join('&');

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams,
      });

      if (!tokenResponse.ok) {
        fastify.log.error('Token exchange failed:', await tokenResponse.text());
        return reply.redirect(`${config.frontend.url}?error=token_exchange_failed`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Fetch user info from Google
      const userInfo = await fetchGoogleUserInfo(accessToken);

      // Find or create user in database
      let user = await findUserByEmail(db, userInfo.email);
      
      if (!user) {
        // Create new user with OAuth2 data
        const userData = {
          username: userInfo.email.split('@')[0], // Use email prefix as username
          email: userInfo.email,
          password_hash: null, // No password for OAuth2 users
          google_id: userInfo.id,
          profile_picture: userInfo.picture || null,
          is_verified: true, // OAuth2 users are pre-verified
        };

        user = await createUserInDB(db, userData);
      } else if (!user.google_id) {
        // Link existing user with Google account
        fastify.log.info('Linking existing user with Google account');
        // TODO: Implement linkUserWithGoogle function if needed
      }

      // Generate JWT token for the user
      const token = generateJWTToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      // Redirect to frontend with JWT token
      return reply.redirect(`${config.frontend.url}?token=${token}`);

    } catch (error) {
      fastify.log.error('OAuth2 callback error:', error);
      return reply.redirect(`${config.frontend.url}?error=callback_failed`);
    }
  });

  /**
   * Get authenticated user profile
   * GET /auth/profile
   */
  fastify.get('/auth/profile', {
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    return reply.send({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email
      }
    });
  });
}

/**
 * Fetch user information from Google API
 */
async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  const userInfo = await response.json() as any;
  return {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture
  };
}

/**
 * Link existing user with Google account
 */
async function linkUserWithGoogle(db: sqlite3.Database, userId: number, googleId: string, profilePicture?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users 
      SET google_id = ?, profile_picture = ?
      WHERE id = ?
    `;
    
    db.run(query, [googleId, profilePicture, userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
