/**
 * Two-Factor Authentication (2FA) Routes
 * Endpoints for setting up, enabling, disabling, and verifying 2FA
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sqlite3 from 'sqlite3';
import { config } from '../config/auth.config.js';
import { verifyJWTToken } from '../auth/auth.handlers.js';
import { enable2FA, disable2FA, get2FASettings, useBackupCode, findUserByUsername } from '../database/database.connection.js';
import { generate2FASetup, generateQRCode, verifyTOTP, isValidBackupCodeFormat, regenerateBackupCodes } from '../utils/twoFactor.js';

interface Setup2FARequestBody {
  // No body needed - just needs authentication
}

interface Verify2FASetupRequestBody {
  token: string;
  secret: string;
}

interface Verify2FARequestBody {
  token: string;
  isBackupCode?: boolean;
}

interface Disable2FARequestBody {
  password: string;
  token?: string; // TOTP or backup code for verification
}

/**
 * Setup 2FA routes with JWT authentication middleware
 */
export function setup2FARoutes(server: FastifyInstance, db: sqlite3.Database): void {
  
  // Middleware to verify JWT token for all 2FA routes
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
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
          error: 'Authentication required'
        });
      }
      
      const decoded = verifyJWTToken(token, config.jwt.secret);
      (request as any).user = decoded;
    } catch (error) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  };

  /**
   * GET /2fa/setup - Generate 2FA setup data (secret, QR code, backup codes)
   */
  server.get('/2fa/setup', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Check if 2FA is already enabled
      const twoFASettings = await get2FASettings(db, user.userId);
      if (twoFASettings && twoFASettings.two_factor_enabled) {
        return reply.code(400).send({
          success: false,
          error: '2FA is already enabled'
        });
      }
      
      // Generate 2FA setup data
      const setup = generate2FASetup(user.username);
      
      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(setup.qrCodeUrl);
      
      return reply.send({
        success: true,
        setup: {
          secret: setup.secret,
          qrCode: qrCodeDataUrl,
          manualEntryKey: setup.manualEntryKey,
          backupCodes: setup.backupCodes
        }
      });
      
    } catch (error) {
      server.log.error(`2FA setup error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /2fa/verify-setup - Verify and enable 2FA
   */
  server.post('/2fa/verify-setup', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { token, secret } = request.body as Verify2FASetupRequestBody;
      
      if (!token || !secret) {
        return reply.code(400).send({
          success: false,
          error: 'Token and secret are required'
        });
      }
      
      // Verify the TOTP token
      if (!verifyTOTP(token, secret)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid verification code'
        });
      }
      
      // Generate fresh backup codes for final setup
      const backupCodes = regenerateBackupCodes();
      
      // Enable 2FA in database
      await enable2FA(db, user.userId, secret, backupCodes);
      
      return reply.send({
        success: true,
        message: '2FA has been successfully enabled',
        backupCodes: backupCodes
      });
      
    } catch (error) {
      server.log.error(`2FA verify setup error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /2fa/verify - Verify 2FA token during login
   */
  server.post('/2fa/verify', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { token, isBackupCode } = request.body as Verify2FARequestBody;
      
      if (!token) {
        return reply.code(400).send({
          success: false,
          error: 'Verification code is required'
        });
      }
      
      // Get user's 2FA settings
      const twoFASettings = await get2FASettings(db, user.userId);
      if (!twoFASettings || !twoFASettings.two_factor_enabled) {
        return reply.code(400).send({
          success: false,
          error: '2FA is not enabled for this account'
        });
      }
      
      let isValid = false;
      
      if (isBackupCode) {
        // Verify backup code
        if (!isValidBackupCodeFormat(token.replace(/\\s/g, ''))) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid backup code format'
          });
        }
        
        isValid = await useBackupCode(db, user.userId, token.toUpperCase().replace(/\\s/g, ''));
      } else {
        // Verify TOTP
        isValid = verifyTOTP(token, twoFASettings.two_factor_secret);
      }
      
      if (!isValid) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid verification code'
        });
      }
      
      return reply.send({
        success: true,
        message: '2FA verification successful'
      });
      
    } catch (error) {
      server.log.error(`2FA verify error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /2fa/status - Get 2FA status for current user
   */
  server.get('/2fa/status', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      const twoFASettings = await get2FASettings(db, user.userId);
      
      return reply.send({
        success: true,
        enabled: twoFASettings ? twoFASettings.two_factor_enabled : false,
        backupCodesRemaining: twoFASettings && twoFASettings.backup_codes 
          ? JSON.parse(twoFASettings.backup_codes).length 
          : 0
      });
      
    } catch (error) {
      server.log.error(`2FA status error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /2fa/disable - Disable 2FA
   */
  server.post('/2fa/disable', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { password, token } = request.body as Disable2FARequestBody;
      
      // Get user's 2FA settings
      const twoFASettings = await get2FASettings(db, user.userId);
      if (!twoFASettings || !twoFASettings.two_factor_enabled) {
        return reply.code(400).send({
          success: false,
          error: '2FA is not enabled for this account'
        });
      }
      
      // For security, require either password verification or 2FA token
      if (!password && !token) {
        return reply.code(400).send({
          success: false,
          error: 'Password or 2FA token required for disabling 2FA'
        });
      }
      
      // If token provided, verify it
      if (token) {
        const isValid = verifyTOTP(token, twoFASettings.two_factor_secret) ||
                       await useBackupCode(db, user.userId, token.toUpperCase().replace(/\\s/g, ''));
        
        if (!isValid) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid 2FA code'
          });
        }
      }
      
      // Disable 2FA
      await disable2FA(db, user.userId);
      
      return reply.send({
        success: true,
        message: '2FA has been disabled'
      });
      
    } catch (error) {
      server.log.error(`2FA disable error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /2fa/regenerate-backup-codes - Generate new backup codes
   */
  server.post('/2fa/regenerate-backup-codes', {
    preHandler: authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Get user's 2FA settings
      const twoFASettings = await get2FASettings(db, user.userId);
      if (!twoFASettings || !twoFASettings.two_factor_enabled) {
        return reply.code(400).send({
          success: false,
          error: '2FA is not enabled for this account'
        });
      }
      
      // Generate new backup codes
      const newBackupCodes = regenerateBackupCodes();
      
      // Update database
      await enable2FA(db, user.userId, twoFASettings.two_factor_secret, newBackupCodes);
      
      return reply.send({
        success: true,
        message: 'New backup codes generated',
        backupCodes: newBackupCodes
      });
      
    } catch (error) {
      server.log.error(`2FA regenerate backup codes error: ${error instanceof Error ? error.message : String(error)}`);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
}
