/**
 * OAuth utility functions
 * Helper functions for OAuth2 authentication
 */

/**
 * Validate OAuth provider
 */
export function isValidOAuthProvider(provider: string): boolean {
  const validProviders = ['google', 'github', 'discord'];
  return validProviders.includes(provider.toLowerCase());
}

/**
 * Generate OAuth state parameter
 */
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Extract OAuth error from callback
 */
export function extractOAuthError(query: any): string | null {
  return query.error || null;
}
