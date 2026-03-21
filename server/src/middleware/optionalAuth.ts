import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Optionally attaches user to req if a valid Bearer token is present.
 * Does NOT reject the request if no token is provided (for guest support).
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // guest — no token
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
    };

    req.user = { id: decoded.id, role: decoded.role };
  } catch {
    // Invalid token — treat as guest
  }

  next();
};
