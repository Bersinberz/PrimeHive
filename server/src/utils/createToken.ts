import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: string;
}

/**
 * Short-lived access token (15 minutes)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });
};

/**
 * Long-lived refresh token (7 days), stored in httpOnly cookie
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not defined");
  }

  return jwt.sign({ ...payload, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });
};