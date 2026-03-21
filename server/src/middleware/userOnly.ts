import { Request, Response, NextFunction } from "express";

/**
 * Allows only users with role "user".
 * Must be used after verifyToken.
 */
export const userOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "This endpoint is for customers only" });
  }
  next();
};
