import { Request, Response } from "express";
import crypto from "crypto";
import Order from "../../models/Order";
import User from "../../models/User";
import { asyncHandler } from "../../utils/asyncHandler";

/** GET /delivery/orders */
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
      .populate("customer", "name phone email")
      .select("orderId customer items totalAmount shippingAddress status deliveryStatus paymentMethod createdAt assignedAt deliveryOtpVerified"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

/** GET /delivery/orders/:id */
export const getDeliveryOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id })
    .populate("customer", "name phone email")
    .lean();
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.status(200).json(order);
});

/** PUT /delivery/orders/:id/status */
export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryStatus } = req.body;
  const validStatuses = ["picked_up", "out_for_delivery", "delivered"];
  if (!validStatuses.includes(deliveryStatus)) {
    return res.status(400).json({ message: "Invalid delivery status." });
  }

  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id })
    .populate("customer", "name phone email");
  if (!order) return res.status(404).json({ message: "Order not found." });

  // OTP must be verified before marking delivered
  if (deliveryStatus === "delivered" && !order.deliveryOtpVerified) {
    return res.status(400).json({ message: "OTP verification required before marking as delivered." });
  }

  order.deliveryStatus = deliveryStatus;

  if (deliveryStatus === "delivered") {
    order.status = "Delivered";
    order.timeline.push({ status: "Delivered", timestamp: new Date(), note: "Delivered by delivery partner" });
    const customerEmail = (order.customer as any)?.email || order.guestEmail;
    const customerName  = (order.customer as any)?.name  || "Customer";
    if (customerEmail) {
      const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
      sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: "Delivered", note: "Your order has been delivered successfully!" }).catch(() => {});
    }
  }

  await order.save();
  res.status(200).json({ message: "Delivery status updated.", deliveryStatus: order.deliveryStatus, orderStatus: order.status });
});

/** POST /delivery/orders/:id/proof */
export const uploadProofOfDelivery = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (!req.file) return res.status(400).json({ message: "No image uploaded." });
  order.proofOfDelivery = (req.file as any).path;
  await order.save();
  res.status(200).json({ message: "Proof of delivery uploaded.", proofOfDelivery: order.proofOfDelivery });
});

/** POST /delivery/orders/:id/otp/send — send OTP to customer email */
export const sendDeliveryOtp = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id })
    .populate("customer", "name email");
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.deliveryOtpVerified) return res.status(400).json({ message: "OTP already verified." });

  const otp     = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  order.deliveryOtp        = otp;
  order.deliveryOtpExpires = expires;
  await order.save();

  const customerEmail = (order.customer as any)?.email || order.guestEmail;
  const customerName  = (order.customer as any)?.name  || "Customer";

  if (customerEmail) {
    const { sendDeliveryOtpEmail } = await import("../../utils/sendDeliveryOtpEmail");
    sendDeliveryOtpEmail({ to: customerEmail, customerName, orderId: order.orderId, otp }).catch(() => {});
  }

  res.status(200).json({ message: "OTP sent to customer email." });
});

/** POST /delivery/orders/:id/otp/verify — verify OTP entered by delivery partner */
export const verifyDeliveryOtp = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ message: "OTP is required." });

  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.deliveryOtpVerified) return res.status(400).json({ message: "OTP already verified." });
  if (!order.deliveryOtp || !order.deliveryOtpExpires) return res.status(400).json({ message: "No OTP found. Please request a new one." });
  if (new Date() > order.deliveryOtpExpires) return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  if (order.deliveryOtp !== String(otp)) return res.status(400).json({ message: "Incorrect OTP." });

  order.deliveryOtpVerified = true;
  order.deliveryOtp         = undefined;
  order.deliveryOtpExpires  = undefined;
  await order.save();

  res.status(200).json({ message: "OTP verified successfully." });
});

/** PUT /delivery/orders/:id/accept — accept assigned order */
export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id, deliveryStatus: "assigned" });
  if (!order) return res.status(404).json({ message: "Order not found or not in assigned state." });
  order.deliveryStatus = "picked_up";
  await order.save();
  res.status(200).json({ message: "Order accepted.", deliveryStatus: order.deliveryStatus });
});

/** PUT /delivery/orders/:id/reject — reject assigned order (re-assigns to another partner) */
export const rejectOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id, deliveryStatus: "assigned" });
  if (!order) return res.status(404).json({ message: "Order not found or not in assigned state." });

  order.deliveryPartnerId = undefined;
  order.deliveryStatus    = "not_assigned";
  order.assignedAt        = undefined;
  await order.save();

  // Fire-and-forget: try to assign to another partner
  import("../../utils/autoAssignDelivery").then(({ autoAssignDelivery }) => {
    autoAssignDelivery(order._id.toString());
  }).catch(() => {});

  res.status(200).json({ message: "Order rejected. Reassigning to another partner." });
});

/** PUT /delivery/status/online — toggle online/offline */
export const toggleOnlineStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isOnline } = req.body;
  if (typeof isOnline !== "boolean") return res.status(400).json({ message: "isOnline must be a boolean." });
  await User.findByIdAndUpdate(req.user!.id, { isOnline });
  res.status(200).json({ isOnline });
});

/** GET /delivery/earnings — today's earnings based on delivered orders */
export const getMyEarnings = asyncHandler(async (req: Request, res: Response) => {
  const EARNING_PER_ORDER = 50; // ₹50 per delivery

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayCount, totalCount, weekCount] = await Promise.all([
    Order.countDocuments({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered", updatedAt: { $gte: todayStart } }),
    Order.countDocuments({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered" }),
    Order.countDocuments({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered", updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  res.status(200).json({
    today:      todayCount  * EARNING_PER_ORDER,
    thisWeek:   weekCount   * EARNING_PER_ORDER,
    total:      totalCount  * EARNING_PER_ORDER,
    perOrder:   EARNING_PER_ORDER,
    todayCount,
    totalCount,
  });
});

/** GET /delivery/notifications — real notifications derived from order events */
export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

  const recentOrders = await Order.find({
    deliveryPartnerId: req.user!.id,
    updatedAt: { $gte: since },
  })
    .select("orderId deliveryStatus assignedAt updatedAt customer")
    .populate("customer", "name")
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();

  const notifications: { id: string; title: string; body: string; dot: string; time: string }[] = [];

  for (const order of recentOrders) {
    const customerName = (order.customer as any)?.name || "Customer";

    if (order.deliveryStatus === "assigned" && order.assignedAt) {
      notifications.push({
        id:    `${order._id}-assigned`,
        title: "New order assigned",
        body:  `${order.orderId} · ${customerName}`,
        dot:   "#ff8c42",
        time:  (order.assignedAt as Date).toISOString(),
      });
    }

    if (order.deliveryStatus === "delivered") {
      notifications.push({
        id:    `${order._id}-delivered`,
        title: "Delivery confirmed",
        body:  `${order.orderId} · ${customerName}`,
        dot:   "#10b981",
        time:  (order.updatedAt as Date).toISOString(),
      });
    }

    if (order.deliveryStatus === "picked_up") {
      notifications.push({
        id:    `${order._id}-picked`,
        title: "Order picked up",
        body:  `${order.orderId} · ${customerName}`,
        dot:   "#d97706",
        time:  (order.updatedAt as Date).toISOString(),
      });
    }
  }

  res.status(200).json(notifications);
});
