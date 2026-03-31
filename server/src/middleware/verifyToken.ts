import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IPermissions, IAdminStaffPermissions } from "../models/User";

/**
 * Verify JWT and attach user (with permissions) to request
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
    };

    // For staff and admin_staff, fetch permissions from DB so they're always up-to-date
    if (decoded.role === "staff" || decoded.role === "admin_staff") {
      const user = await User.findById(decoded.id).select("role status permissions adminStaffPermissions");
      if (!user || user.status !== "active") {
        return res.status(401).json({ message: "Account is inactive or not found." });
      }
      req.user = {
        id: decoded.id,
        role: decoded.role,
        permissions: decoded.role === "staff" ? user.permissions : undefined,
        adminStaffPermissions: decoded.role === "admin_staff" ? user.adminStaffPermissions : undefined,
      };
    } else {
      req.user = { id: decoded.id, role: decoded.role };
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Allow superadmin + staff + admin_staff
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (!["superadmin", "staff", "admin_staff"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * Delivery partner only
 */
export const deliveryPartnerOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (!["delivery_partner", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Delivery partner access required" });
  }
  next();
};

/**
 * Superadmin exclusive
 */
export const superAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

/**
 * Permission-based middleware factory.
 * Superadmin always passes. Staff must have the specific permission.
 *
 * Usage: checkPermission('products', 'delete')
 */
export const checkPermission = (
  module: keyof IPermissions | keyof IAdminStaffPermissions,
  action: string
) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  // Superadmin bypasses all permission checks
  if (req.user.role === "superadmin") return next();

  // admin_staff — check adminStaffPermissions
  if (req.user.role === "admin_staff") {
    // dashboard, products, categories always allowed
    if (["dashboard", "products", "categories"].includes(module)) return next();
    const adminPerms = req.user.adminStaffPermissions as Record<string, any> | undefined;
    if (!adminPerms) return next(); // no perms set yet — allow, server data is read-only anyway
    const modulePerms = adminPerms[module] as Record<string, boolean> | undefined;
    if (!modulePerms || !modulePerms[action]) {
      return res.status(403).json({ message: "You don't have permission to perform this action." });
    }
    return next();
  }

  // staff (seller) — check permissions
  const perms = req.user.permissions;
  if (!perms) {
    return res.status(403).json({ message: "No permissions assigned to this account." });
  }

  const modulePerms = perms[module] as Record<string, boolean> | undefined;
  if (!modulePerms || !modulePerms[action]) {
    return res.status(403).json({ message: "You don't have permission to perform this action." });
  }

  next();
};
