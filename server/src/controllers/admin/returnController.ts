import { Request, Response } from "express";
import Return from "../../models/Return";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendOrderStatusEmail } from "../../utils/sendOrderStatusEmail";
import User from "../../models/User";

export const getReturns = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const status = req.query.status as string | undefined;
  const skip   = (page - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("customer", "name email")
      .populate("order", "orderId totalAmount")
      .lean(),
    Return.countDocuments(filter),
  ]);

  res.status(200).json({ data: returns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const processReturn = asyncHandler(async (req: Request, res: Response) => {
  const { status, adminNote } = req.body;
  if (!["approved","rejected","completed"].includes(status)) {
    return res.status(400).json({ message: "status must be approved, rejected, or completed" });
  }

  const returnRequest = await Return.findById(req.params.id)
    .populate("customer", "name email")
    .populate("order", "orderId");

  if (!returnRequest) return res.status(404).json({ message: "Return request not found" });

  returnRequest.status = status;
  if (adminNote) returnRequest.adminNote = adminNote.trim();
  await returnRequest.save();

  const customerEmail = (returnRequest.customer as any)?.email;
  const customerName  = (returnRequest.customer as any)?.name || "Customer";
  const orderId       = (returnRequest.order as any)?.orderId || "N/A";

  if (customerEmail) {
    const statusLabel = status === "approved" ? "Processing" : status === "rejected" ? "Delivered" : "Refunded";
    const note = status === "approved"
      ? (adminNote || "Your return request has been approved. Please ship the items back.")
      : status === "rejected"
      ? (adminNote || "Your return request could not be approved at this time.")
      : (adminNote || "Your return has been completed and refund processed.");

    sendOrderStatusEmail({ to: customerEmail, customerName, orderId, newStatus: statusLabel, note }).catch(() => {});
  }

  res.status(200).json(returnRequest);
});
