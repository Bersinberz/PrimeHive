import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Protect Middleware
 * Verifies JWT and attaches user to request
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret not configured"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

/**
 * Admin Only Middleware (superadmin + staff)
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized"
    });
  }

  if (req.user.role !== "superadmin" && req.user.role !== "staff") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

/**
 * Super Admin Only Middleware (superadmin exclusive)
 */
export const superAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized"
    });
  }

  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      message: "Super admin access required"
    });
  }

  next();
};