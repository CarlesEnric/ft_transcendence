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
import fs from 'fs';
import path from 'path';

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
   * Funció auxiliar per gestionar les URL de redirecció
   * Garanteix que sempre utilitzem la URL correcta basada en l'origen
   */
  function getFrontendRedirectUrl(request: FastifyRequest): string {
    // Recuperem l'origen de la petició original si existeix (comprovem ambdues cookies)
    const originalOrigin = request.cookies && (request.cookies.original_origin || request.cookies.ip_origin);
    
    // També podem obtenir l'origen de la configuració
    const envHostIP = config.frontend.url.replace('https://', '').replace(':3000', '');
    
    // Si tenim un origen guardat i no és intern, l'utilitzem
    if (originalOrigin && !['localhost', '127.0.0.1', 'auth', 'api-gateway'].includes(originalOrigin)) {
      fastify.log.info(`Utilitzant origen original per redirecció: ${originalOrigin}`);
      return `https://${originalOrigin}:3000`;
    }
    
    // Si tenim una IP a l'env, la utilitzem com a backup
    if (envHostIP && envHostIP !== 'localhost' && envHostIP !== '127.0.0.1') {
      fastify.log.info(`Utilitzant HOST_IP de l'env per redirecció: ${envHostIP}`);
      return `https://${envHostIP}:3000`;
    }
    
    // Si no, utilitzem la URL configurada
    fastify.log.info(`Utilitzant URL configurada per redirecció: ${config.frontend.url}`);
    return config.frontend.url;
  }

  /**
   * Initiate Google OAuth2 flow
   * Redirects user to Google's authorization server
   */
  fastify.get('/google', async (request: FastifyRequest, reply: FastifyReply) => {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Guardem l'origen de la petició per utilitzar-lo després
    const host = request.headers.host || '';
    const hostname = host.split(':')[0]; // Eliminem el port si existeix
    
    // Detectem si la petició ve d'una IP externa o de localhost
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isInternalHost = ['auth', 'api-gateway', 'auth-service'].includes(hostname);
    
    // Si és una IP externa o localhost (no interna), la guardem en una cookie
    if ((isIP || isLocalhost) && !isInternalHost) {
      fastify.log.info(`Guardant origen de la petició: ${hostname}`);
      reply.setCookie('original_origin', hostname, {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // Permetem cookies cross-site per funcionar amb redirects
        path: '/',
        maxAge: 600000 // 10 minuts (augmentat per donar més temps)
      });
      
      // També guardem en una segona cookie amb domain específic per major compatibilitat
      if (isIP) {
        fastify.log.info(`Guardant origen amb domini específic: ${hostname}`);
        reply.setCookie('ip_origin', hostname, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          // No domain restriction to work with any hostname
          maxAge: 600000 // 10 minuts
        });
      }
    }
    
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
      
      // Recuperem l'origen original guardat en la cookie (si existeix)
      const originalOrigin = request.cookies && request.cookies.original_origin;
      fastify.log.info(`Origen original recuperat de cookie: ${originalOrigin || 'no definit'}`);
      
      // Check for OAuth2 errors
      if (error) {
        fastify.log.error('OAuth2 error:', error);
        return reply.redirect(`${getFrontendRedirectUrl(request)}?error=oauth_failed`);
      }
      if (!code) {
        return reply.redirect(`${getFrontendRedirectUrl(request)}?error=no_code`);
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
        return reply.redirect(`${getFrontendRedirectUrl(request)}?error=network_error`);
      }
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        fastify.log.error(`Token exchange failed with status ${tokenResponse.status}: ${errorText}`);
        return reply.redirect(`${getFrontendRedirectUrl(request)}?error=token_exchange_failed`);
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
        // Redirect to frontend with 2FA required flag, utilitzant la URL correcta
        const redirectUrl = getFrontendRedirectUrl(request);
        fastify.log.info(`Redirigint a 2FA: ${redirectUrl}`);
        return reply.redirect(`${redirectUrl}?twoFactorRequired=1`);
      }
      // Generate JWT token for the user
      const token = generateJWTToken({
        id: user.id,
        username: user.username,
        email: user.email
      });
      // Get request origin domain for cookie
      const host = request.headers.host || '';
      const hostname = host.split(':')[0]; // Remove port if exists
      
      // Set JWT as HTTP-only cookie
      // Important: Sempre utilitzem 'secure: true' perquè utilitzem HTTPS
      // i 'sameSite: none' per permetre l'accés des de qualsevol origen
      reply.setCookie('jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/',
        // No domain property - works better with cross-site cookies
      });
      
      // Netegem la cookie d'origen original, ja no la necessitem
      reply.clearCookie('original_origin', { path: '/' });
      
      // Redirect to frontend WITHOUT token in URL, utilitzant la URL correcta
      const redirectUrl = getFrontendRedirectUrl(request);
      fastify.log.info(`Autenticació exitosa, redirigint a: ${redirectUrl}`);
      return reply.redirect(redirectUrl);
    } catch (error) {
      fastify.log.error(`OAuth2 callback error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.redirect(`${getFrontendRedirectUrl(request)}?error=callback_failed`);
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
async function linkUserWithGoogle(db: sqlite3.Database, id: number, googleId: string, profilePicture?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users 
      SET google_id = ?, profile_picture = ?
      WHERE id = ?
    `;
    
    db.run(query, [googleId, profilePicture, id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
