import crypto from 'crypto';

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get token expiry date (24 hours from now)
 */
export function getTokenExpiry(): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  return expiryDate;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiryDate: Date | undefined): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

/**
 * Generate secure token for email verification
 */
export function generateSecureToken() {
  return {
    token: generateVerificationToken(),
    expiry: getTokenExpiry(),
  };
}
