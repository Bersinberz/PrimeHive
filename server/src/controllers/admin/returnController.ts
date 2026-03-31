import { Request, Response } from "express";
import Return from "../../models/Return";
import Order from "../../models/Order";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendOrderStatusEmail } from "../../utils/sendOrderStatusEmail";

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
      .populate("order", "orderId totalAmount shippingAddress")
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
    .populate("order", "orderId totalAmount shippingAddress items");

  if (!returnRequest) return res.status(404).json({ message: "Return request not found" });

  returnRequest.status = status;
  if (adminNote) returnRequest.adminNote = adminNote.trim();
  await returnRequest.save();

  const customerEmail = (returnRequest.customer as any)?.email;
  const customerName  = (returnRequest.customer as any)?.name || "Customer";
  const orderId       = (returnRequest.order as any)?.orderId || "N/A";
  const orderDbId     = (returnRequest.order as any)?._id;

  // Sync order.refundStatus
  if (orderDbId) {
    if (status === "approved") {
      await Order.findByIdAndUpdate(orderDbId, {
        refundStatus: "refunded",
        status: "Refunded",
        $push: { timeline: { status: "Refunded", timestamp: new Date(), note: adminNote || "Refund approved by admin" } },
      });

      // Restore stock
      const order = await Order.findById(orderDbId);
      if (order) {
        const Product = (await import("../../models/Product")).default;
        await Promise.allSettled(order.items.map(item =>
          Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
        ));

        // Auto-assign a delivery partner for return pickup
        import("../../utils/autoAssignReturnPickup").then(({ autoAssignReturnPickup }) => {
          autoAssignReturnPickup(order._id.toString());
        }).catch(() => {});
      }
    } else if (status === "rejected") {
      await Order.findByIdAndUpdate(orderDbId, { refundStatus: "rejected" });
    }
  }

  // Email customer
  if (customerEmail) {
    const emailNote = status === "approved"
      ? (adminNote || "Your refund has been approved. A delivery partner will pick up the item from your address.")
      : status === "rejected"
      ? (adminNote || "Your return request could not be approved at this time.")
      : (adminNote || "Your return has been completed and refund processed.");

    const statusLabel = status === "approved" ? "Refunded" : status === "rejected" ? "Delivered" : "Refunded";
    sendOrderStatusEmail({ to: customerEmail, customerName, orderId, newStatus: statusLabel, note: emailNote }).catch(() => {});
  }

  res.status(200).json(returnRequest);
});
