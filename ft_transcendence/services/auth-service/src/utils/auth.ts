/**
 * Authentication helper utilities
 * Additional auth-related helper functions
 */

import { FastifyRequest } from 'fastify';

/**
 * Extract user from JWT token in request
 */
export function getUserFromRequest(request: any): any | null {
  return request.user || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: FastifyRequest): boolean {
  return !!(request as any).user;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: any, role: string): boolean {
  return user?.role === role || user?.roles?.includes(role);
}

/**
 * Generate secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
