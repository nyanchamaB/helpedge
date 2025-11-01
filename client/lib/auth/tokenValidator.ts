/**
 * Token Validation Utilities
 * Provides secure client-side token validation including expiry checks
 */

export interface TokenPayload {
  sub?: string;
  userId?: string;
  id?: string;
  nameid?: string;
  email?: string;
  Email?: string;
  name?: string;
  username?: string;
  Name?: string;
  unique_name?: string;
  role?: any;
  Role?: any;
  department?: string;
  Department?: string;
  exp?: number; // Expiration timestamp (Unix epoch)
  iat?: number; // Issued at timestamp
  nbf?: number; // Not before timestamp
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: TokenPayload | null;
  error?: string;
}

/**
 * Validates JWT token structure
 */
function isValidJWTStructure(token: string): boolean {
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check if each part is base64 encoded
  try {
    atob(parts[0]); // Header
    atob(parts[1]); // Payload
    // Signature doesn't need to be checked for structure validation
    return true;
  } catch {
    return false;
  }
}

/**
 * Decodes JWT token payload
 */
function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
}

/**
 * Checks if token is expired based on exp claim
 * @param payload - Decoded token payload
 * @param bufferSeconds - Number of seconds before actual expiry to consider token expired (default: 30)
 */
function isTokenExpired(payload: TokenPayload, bufferSeconds: number = 30): boolean {
  if (!payload.exp) {
    // If no expiration claim, consider it suspicious but not expired
    // Let the backend validate it
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = payload.exp;

  // Add buffer to prevent using tokens that are about to expire
  return currentTimestamp >= (expirationTimestamp - bufferSeconds);
}

/**
 * Checks if token is not yet valid based on nbf claim
 */
function isTokenNotYetValid(payload: TokenPayload): boolean {
  if (!payload.nbf) {
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  return currentTimestamp < payload.nbf;
}

/**
 * Validates a JWT token comprehensively
 * Checks structure, expiration, and decodes payload
 */
export function validateToken(token: string | null): TokenValidationResult {
  // Check if token exists
  if (!token || token.trim() === '') {
    return {
      isValid: false,
      isExpired: false,
      payload: null,
      error: 'No token provided',
    };
  }

  // Validate JWT structure
  if (!isValidJWTStructure(token)) {
    return {
      isValid: false,
      isExpired: false,
      payload: null,
      error: 'Invalid token structure',
    };
  }

  // Decode payload
  const payload = decodeTokenPayload(token);
  if (!payload) {
    return {
      isValid: false,
      isExpired: false,
      payload: null,
      error: 'Failed to decode token payload',
    };
  }

  // Check if token is not yet valid
  if (isTokenNotYetValid(payload)) {
    return {
      isValid: false,
      isExpired: false,
      payload,
      error: 'Token not yet valid',
    };
  }

  // Check if token is expired
  if (isTokenExpired(payload)) {
    return {
      isValid: false,
      isExpired: true,
      payload,
      error: 'Token expired',
    };
  }

  // Token is valid
  return {
    isValid: true,
    isExpired: false,
    payload,
  };
}

/**
 * Gets token from localStorage (client-side only)
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('authToken');
}

/**
 * Validates the stored authentication token
 */
export function validateStoredToken(): TokenValidationResult {
  const token = getStoredToken();
  return validateToken(token);
}

/**
 * Clears invalid or expired token from storage
 */
export function clearInvalidToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

/**
 * Gets remaining time until token expiration in seconds
 * Returns null if token is invalid or has no expiration
 */
export function getTokenExpirationTime(token: string | null): number | null {
  const validation = validateToken(token);

  if (!validation.isValid || !validation.payload?.exp) {
    return null;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = validation.payload.exp;
  const remainingSeconds = expirationTimestamp - currentTimestamp;

  return remainingSeconds > 0 ? remainingSeconds : 0;
}
