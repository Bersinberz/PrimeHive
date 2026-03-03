const TOKEN_KEY = "auth_token";

/**
 * Store Token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove Token (Logout)
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if User is Logged In
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Decode Token
 */
export const decodeToken = (): any | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

/**
 * Get User Role from Token
 */
export const getUserRole = (): string | null => {
  const decoded = decodeToken();
  return decoded?.role || null;
};

/**
 * Get User ID from Token
 */
export const getUserId = (): string | null => {
  const decoded = decodeToken();
  return decoded?.id || null;
};