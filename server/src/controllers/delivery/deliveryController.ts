import { Request, Response } from "express";
import Order from "../../models/Order";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload, handleUploadErrors } from "../../middleware/upload";

/** GET /delivery/orders — delivery partner sees their assigned orders */
export const getMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
  const status = req.query.deliveryStatus as string | undefined;
  const skip   = (page - 1) * limit;

  const filter: Record<string, unknown> = { deliveryPartnerId: req.user!.id };
  if (status) filter.deliveryStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("customer", "name phone")
      .select("orderId customer items totalAmount shippingAddress status deliveryStatus createdAt"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

/** GET /delivery/orders/:id — full order detail for delivery partner */
export const getDeliveryOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id })
    .populate("customer", "name phone email")
    .lean();

  if (!order) return res.status(404).json({ message: "Order not found." });
  res.status(200).json(order);
});

/** PUT /delivery/orders/:id/status — update delivery status */
export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryStatus } = req.body;
  const validStatuses = ["picked_up", "out_for_delivery", "delivered"];

  if (!validStatuses.includes(deliveryStatus)) {
    return res.status(400).json({ message: "Invalid delivery status." });
  }

  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id });
  if (!order) return res.status(404).json({ message: "Order not found." });

  order.deliveryStatus = deliveryStatus;

  // Auto-update order status when delivered
  if (deliveryStatus === "delivered") {
    order.status = "Delivered";
    order.timeline.push({ status: "Delivered", timestamp: new Date(), note: "Delivered by delivery partner" });

    // Notify customer
    const customerEmail = (order as any).customer?.email || order.guestEmail;
    const customerName  = (order as any).customer?.name  || "Customer";
    if (customerEmail) {
      const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
      sendOrderStatusEmail({
        to: customerEmail,
        customerName,
        orderId: order.orderId,
        newStatus: "Delivered",
        note: "Your order has been delivered successfully!",
      }).catch(() => {});
    }
  }

  await order.save();
  res.status(200).json({ message: "Delivery status updated.", deliveryStatus: order.deliveryStatus, orderStatus: order.status });
});

/** POST /delivery/orders/:id/proof — upload proof of delivery */
export const uploadProofOfDelivery = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id });
  if (!order) return res.status(404).json({ message: "Order not found." });

  if (!req.file) return res.status(400).json({ message: "No image uploaded." });

  order.proofOfDelivery = (req.file as any).path;
  await order.save();

  res.status(200).json({ message: "Proof of delivery uploaded.", proofOfDelivery: order.proofOfDelivery });
});
