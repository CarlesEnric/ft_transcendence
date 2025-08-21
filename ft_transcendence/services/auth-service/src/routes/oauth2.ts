/**
 * OAuth2 Routes
 * Google OAuth2 authentication using @fastify/oauth2 plugin
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { getUserByOAuth, createOAuthUser } from '../database/database.connection.js';
import { generateJWTToken } from '../auth/auth.handlers.js';
import { config } from '../config/auth.config.js';

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
   * Initiate Google OAuth2 flow
   * Redirects user to Google's authorization server
   */
  fastify.get('/google', async (request: FastifyRequest, reply: FastifyReply) => {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const authUrl = [
      'https://accounts.google.com/o/oauth2/v2/auth?',
      `client_id=${encodeURIComponent(config.oauth.google.clientId)}`,
      `redirect_uri=${encodeURIComponent(config.oauth.google.redirectUri)}`,
      'response_type=code',
      'scope=' + encodeURIComponent('openid email profile'),
      `state=${state}`
    ].join('&');

    fastify.log.info(`Redirecting to Google OAuth: ${authUrl}`);
    return reply.redirect(authUrl);
  });

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

      fastify.log.info(`Attempting token exchange with Google OAuth2 API`);
      
      let tokenResponse;
      try {
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams,
        });
      } catch (fetchError: any) {
        fastify.log.error(`Token fetch request failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        fastify.log.error(`Fetch error details:`, fetchError);
        return reply.redirect(`${config.frontend.url}?error=network_error`);
      }

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        fastify.log.error(`Token exchange failed with status ${tokenResponse.status}: ${errorText}`);
        return reply.redirect(`${config.frontend.url}?error=token_exchange_failed`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Fetch user info from Google
      const userInfo = await fetchGoogleUserInfo(accessToken);


      // Cerca per provider/provider_id
      let user = await getUserByOAuth(db, 'google', userInfo.id);
      if (!user) {
        user = await createOAuthUser(db, {
          provider: 'google',
          provider_id: userInfo.id,
          username: userInfo.email.split('@')[0],
          email: userInfo.email,
          display_name: userInfo.name,
          avatar_url: userInfo.picture
        });
      }

      // Generate JWT token for the user

      const token = generateJWTToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      // Set JWT as HTTP-only cookie
      reply.setCookie('jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      // Redirect to frontend WITHOUT token in URL
      return reply.redirect(`${config.frontend.url}`);

    } catch (error) {
      fastify.log.error(`OAuth2 callback error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.redirect(`${config.frontend.url}?error=callback_failed`);
    }
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
