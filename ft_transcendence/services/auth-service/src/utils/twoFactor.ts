/**
 * Two-Factor Authentication (2FA) utilities
 * TOTP (Time-based One-Time Password) implementation using speakeasy
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

/**
 * Generate a new 2FA secret and setup data
 */
export function generate2FASetup(username: string, serviceName: string = 'ft_transcendence'): TwoFactorSetup {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${serviceName}:${username}`,
    issuer: serviceName,
    length: 32
  });

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url || '',
    manualEntryKey: secret.base32
  };
}

/**
 * Generate QR code as data URL for 2FA setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token
 */
export function verifyTOTP(token: string, secret: string, window: number = 2): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: window // Allow some time drift (default ±2 steps = ±60 seconds)
  });
}

/**
 * Generate backup codes for 2FA
 */
// Backup code functions removed
