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
    .populate("items.product", "createdBy")
    .lean();
  if (!order) return res.status(404).json({ message: "Order not found." });

  // Find the seller (staff user) from the first item's product
  let seller: { storeName?: string; storePhone?: string; storeLocation?: string } | null = null;
  const createdBy = (order.items?.[0]?.product as any)?.createdBy;
  if (createdBy) {
    const staffUser = await User.findById(createdBy).select("storeName storePhone storeLocation").lean();
    if (staffUser) {
      seller = {
        storeName:     (staffUser as any).storeName,
        storePhone:    (staffUser as any).storePhone,
        storeLocation: (staffUser as any).storeLocation,
      };
    }
  }

  res.status(200).json({ ...order, seller });
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

  // Sync order.status and timeline with delivery progress
  const statusMap: Record<string, { orderStatus: "Processing" | "Shipped" | "Delivered"; note: string; emailStatus: string; emailNote: string }> = {
    picked_up:        { orderStatus: "Processing", note: "Order picked up by delivery partner",          emailStatus: "Processing", emailNote: "Your order has been picked up and is on its way." },
    out_for_delivery: { orderStatus: "Shipped",    note: "Out for delivery",                             emailStatus: "Shipped",    emailNote: "Your order is out for delivery and will arrive soon!" },
    delivered:        { orderStatus: "Delivered",  note: "Delivered by delivery partner",                emailStatus: "Delivered",  emailNote: "Your order has been delivered successfully!" },
  };

  const sync = statusMap[deliveryStatus];
  order.status = sync.orderStatus;
  order.timeline.push({ status: sync.orderStatus, timestamp: new Date(), note: sync.note });

  await order.save();

  // Notify customer
  const customerEmail = (order.customer as any)?.email || order.guestEmail;
  const customerName  = (order.customer as any)?.name  || "Customer";
  if (customerEmail) {
    const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
    sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: sync.emailStatus, note: sync.emailNote }).catch(() => {});
  }

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
  const order = await Order.findOne({ _id: req.params.id, deliveryPartnerId: req.user!.id, deliveryStatus: "assigned" })
    .populate("customer", "name email");
  if (!order) return res.status(404).json({ message: "Order not found or not in assigned state." });

  order.deliveryStatus = "picked_up";
  order.status         = "Processing";
  order.timeline.push({ status: "Processing", timestamp: new Date(), note: "Order picked up by delivery partner" });
  await order.save();

  // Notify customer
  const customerEmail = (order.customer as any)?.email || order.guestEmail;
  const customerName  = (order.customer as any)?.name  || "Customer";
  if (customerEmail) {
    const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
    sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: "Processing", note: "Your order has been picked up and is being prepared for delivery." }).catch(() => {});
  }

  res.status(200).json({ message: "Order accepted.", deliveryStatus: order.deliveryStatus, orderStatus: order.status });
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
  const EARNING_PER_ORDER = 50;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [deliveredOrders, todayCount, weekCount] = await Promise.all([
    Order.find({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered" })
      .select("orderId totalAmount updatedAt shippingAddress")
      .sort({ updatedAt: -1 })
      .lean(),
    Order.countDocuments({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered", updatedAt: { $gte: todayStart } }),
    Order.countDocuments({ deliveryPartnerId: req.user!.id, deliveryStatus: "delivered", updatedAt: { $gte: weekStart } }),
  ]);

  const totalCount = deliveredOrders.length;

  res.status(200).json({
    today:      todayCount  * EARNING_PER_ORDER,
    thisWeek:   weekCount   * EARNING_PER_ORDER,
    total:      totalCount  * EARNING_PER_ORDER,
    perOrder:   EARNING_PER_ORDER,
    todayCount,
    totalCount,
    orders: deliveredOrders.map(o => ({
      orderId:   o.orderId,
      earned:    EARNING_PER_ORDER,
      amount:    o.totalAmount,
      city:      (o.shippingAddress as any)?.city || '',
      deliveredAt: o.updatedAt,
    })),
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

/** POST /delivery/report-issue */
export const reportIssue = asyncHandler(async (req: Request, res: Response) => {
  const { category, message } = req.body;
  if (!category || !message) return res.status(400).json({ message: "Category and message are required." });
  // Log it — in production you'd save to DB or send email
  const logger = (await import("../../config/logger")).default;
  logger.info(`Delivery issue report from ${req.user!.id}: [${category}] ${message}`);
  res.status(200).json({ message: "Issue reported successfully." });
});

/** PUT /delivery/profile — update delivery partner's own profile */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, vehicleType, vehicleNumber } = req.body;
  const update: Record<string, unknown> = {};
  if (name)          update.name          = name.trim();
  if (phone)         update.phone         = phone.trim();
  if (vehicleType)   update.vehicleType   = vehicleType.trim();
  if (vehicleNumber) update.vehicleNumber = vehicleNumber.trim();
  if ((req as any).file?.path) update.profilePicture = (req as any).file.path;

  const updated = await User.findByIdAndUpdate(req.user!.id, update, { returnDocument: "after" }).select("-password");
  if (!updated) return res.status(404).json({ message: "User not found." });
  res.status(200).json(updated);
});

/** DELETE /delivery/account — soft delete own account */
export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!.id, { status: "deleted", deletedAt: new Date(), isOnline: false });
  res.status(200).json({ message: "Account deleted." });
});

/** GET /delivery/returns — return pickups assigned to this partner */
export const getMyReturnPickups = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({
    returnDeliveryPartnerId: req.user!.id,
    returnPickupStatus: { $in: ["assigned", "pickup_accepted", "picked_up"] },
  })
    .populate("customer", "name phone")
    .populate("items.product", "createdBy")
    .select("orderId customer shippingAddress totalAmount returnPickupStatus returnAssignedAt items paymentMethod")
    .sort({ returnAssignedAt: -1 })
    .lean();

  // Attach seller info to each order
  const enriched = await Promise.all(orders.map(async order => {
    const createdBy = (order.items?.[0]?.product as any)?.createdBy;
    let seller: { storeName?: string; storePhone?: string; storeLocation?: string } | null = null;
    if (createdBy) {
      const staffUser = await User.findById(createdBy).select("storeName storePhone storeLocation").lean();
      if (staffUser) seller = { storeName: (staffUser as any).storeName, storePhone: (staffUser as any).storePhone, storeLocation: (staffUser as any).storeLocation };
    }
    return { ...order, seller };
  }));

  res.status(200).json({ data: enriched });
});

/** PUT /delivery/returns/:id/accept — accept a return pickup */
export const acceptReturnPickup = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, returnDeliveryPartnerId: req.user!.id, returnPickupStatus: "assigned" });
  if (!order) return res.status(404).json({ message: "Return pickup not found or not in assigned state." });
  order.returnPickupStatus = "pickup_accepted";
  await order.save();
  res.status(200).json({ message: "Return pickup accepted.", returnPickupStatus: order.returnPickupStatus });
});

/** PUT /delivery/returns/:id/reject — reject a return pickup (re-assigns) */
export const rejectReturnPickup = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, returnDeliveryPartnerId: req.user!.id, returnPickupStatus: "assigned" });
  if (!order) return res.status(404).json({ message: "Return pickup not found or not in assigned state." });
  order.returnDeliveryPartnerId = undefined;
  order.returnPickupStatus      = undefined;
  order.returnAssignedAt        = undefined;
  await order.save();
  // Re-assign to another partner
  import("../../utils/autoAssignReturnPickup").then(({ autoAssignReturnPickup }) => {
    autoAssignReturnPickup(order._id.toString());
  }).catch(() => {});
  res.status(200).json({ message: "Return pickup rejected. Reassigning." });
});

/** PUT /delivery/returns/:id/status — update return pickup progress */
export const updateReturnPickupStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["picked_up", "returned_to_store"].includes(status)) {
    return res.status(400).json({ message: "status must be picked_up or returned_to_store" });
  }

  const order = await Order.findOne({ _id: req.params.id, returnDeliveryPartnerId: req.user!.id });
  if (!order) return res.status(404).json({ message: "Return pickup not found." });

  order.returnPickupStatus = status;

  if (status === "returned_to_store") {
    const Return = (await import("../../models/Return")).default;
    await Return.findOneAndUpdate({ order: order._id }, { status: "completed" });
  }

  await order.save();
  res.status(200).json({ message: "Return pickup status updated.", returnPickupStatus: order.returnPickupStatus });
});
