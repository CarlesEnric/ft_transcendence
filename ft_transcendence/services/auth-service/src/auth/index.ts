/**
 * Authentication utilities for JWT tokens and password hashing
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function hashPassword(password: string, rounds: number = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJWTToken(user: any, secret?: string, expiresIn?: string): string {
  const payload = {
    userId: user.userId || user.id,
    username: user.username,
    email: user.email
  };

  const jwtSecret = secret || process.env.JWT_SECRET || 'default-secret';
  const jwtExpiresIn = expiresIn || '24h';

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
}

export function verifyJWTToken(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function createUserResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email
  };
}
