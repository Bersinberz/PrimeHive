import { Request, Response, NextFunction } from "express";
import AuditLog from "../models/AuditLog";
import User from "../models/User";
import logger from "../config/logger";

interface AuditOptions {
  action: string;   // e.g. "product.create"
  target: string;   // e.g. "Product"
  getTargetId?: (req: Request, res: Response) => string | undefined;
  getMetadata?: (req: Request, res: Response) => Record<string, any>;
}

/**
 * Middleware factory that logs admin actions to AuditLog after the response is sent.
 * Usage: router.post("/create", verifyToken, adminOnly, audit({ action: "product.create", target: "Product" }), controller)
 */
export const audit = (opts: AuditOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Only log successful mutations (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const targetId = opts.getTargetId
          ? opts.getTargetId(req, res)
          : req.params.id || body?._id?.toString();

        const metadata = opts.getMetadata
          ? opts.getMetadata(req, res)
          : undefined;

        // Fire-and-forget
        (async () => {
          try {
            const user = await User.findById(req.user!.id).select("name").lean();
            await AuditLog.create({
              actor:     req.user!.id,
              actorName: (user as any)?.name || "Unknown",
              role:      req.user!.role,
              action:    opts.action,
              target:    opts.target,
              targetId,
              metadata,
              ip: req.ip || req.socket?.remoteAddress || "",
            });
          } catch (err) {
            logger.error("Audit log write failed:", err);
          }
        })();
      }
      return originalJson(body);
    };

    next();
  };
