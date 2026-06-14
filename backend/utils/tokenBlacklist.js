/**
 * In-memory token blacklist for logout / token revocation.
 * For production at scale, use Redis with TTL matching token expiry.
 */
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Map();
  }

  add(token, expiresAt) {
    this.blacklistedTokens.set(token, expiresAt);
    this.cleanup();
  }

  isBlacklisted(token) {
    const expiresAt = this.blacklistedTokens.get(token);
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [token, expiresAt] of this.blacklistedTokens.entries()) {
      if (now > expiresAt) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}

module.exports = new TokenBlacklist();
