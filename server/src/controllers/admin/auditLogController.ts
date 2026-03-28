import { Request, Response } from "express";
import AuditLog from "../../models/AuditLog";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const skip   = (page - 1) * limit;

  const filter: any = {};
  if (req.query.action) filter.action = { $regex: req.query.action, $options: "i" };
  if (req.query.actor)  filter.actor  = req.query.actor;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from as string);
    if (req.query.to)   filter.createdAt.$lte = new Date(req.query.to as string);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({ data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
