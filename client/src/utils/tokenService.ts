/**
 * In-memory token storage — NOT localStorage (XSS-safe).
 * Refresh tokens are in httpOnly cookies, managed by the server.
 */

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

let accessToken: string | null = null;

/**
 * Store access token in memory
 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * Clear access token from memory
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

/**
 * Decode the JWT payload (typed)
 */
export const decodeToken = (): TokenPayload | null => {
  if (!accessToken) return null;

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * Check if the token is expired (with 30-second buffer)
 */
export const isTokenExpired = (): boolean => {
  const payload = decodeToken();
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000 - 30000;
};

/**
 * Check if user is authenticated (has a valid, non-expired token)
 */
export const isAuthenticated = (): boolean => {
  return !!accessToken && !isTokenExpired();
};

/**
 * Get user role from token
 */
export const getUserRole = (): string | null => {
  const decoded = decodeToken();
  return decoded?.role || null;
};

/**
 * Get user ID from token
 */
export const getUserId = (): string | null => {
  const decoded = decodeToken();
  return decoded?.id || null;
};