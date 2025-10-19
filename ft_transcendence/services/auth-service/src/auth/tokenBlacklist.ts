// Simple in-memory blacklist for demonstration. Use Redis or DB for production.
const blacklistedTokens = new Set<string>();

export function blacklistToken(token: string) {
  blacklistedTokens.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}

export function clearBlacklist() {
  blacklistedTokens.clear();
}
