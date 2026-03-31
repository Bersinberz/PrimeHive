import { Request, Response } from "express";
import Order from "../../models/Order";
import Product from "../../models/Product";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendOrderStatusEmail } from "../../utils/sendOrderStatusEmail";

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
  const search = (req.query.search as string || "").trim();
  const skip  = (page - 1) * limit;

  const filter: any = {};
  if (search) filter.orderId = { $regex: search, $options: "i" };

  if (req.user?.role === "staff") {
    const staffProductIds = await Product.find({ createdBy: new mongoose.Types.ObjectId(req.user.id) })
      .select("_id").lean().then(ps => ps.map(p => p._id));
    if (staffProductIds.length === 0) {
      return res.status(200).json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }
    filter["items.product"] = { $in: staffProductIds };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("customer", "name email phone")
      .select("orderId customer items totalAmount paymentMethod status createdAt refundStatus refundReason"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("items.product", "name images");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.status(200).json(order);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const validStatuses = ["Pending","Paid","Processing","Shipped","Delivered","Cancelled","Refunded"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be one of: " + validStatuses.join(", ") });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === status) return res.status(400).json({ message: `Order is already "${status}".` });
  if (["Cancelled","Refunded","Delivered"].includes(order.status)) {
    return res.status(400).json({ message: `Cannot change status from "${order.status}". This order is finalized.` });
  }

  const previousStatus = order.status;
  order.status = status;
  order.timeline.push({ status, timestamp: new Date(), note: note || undefined });
  await order.save();

  if ((status === "Cancelled" || status === "Refunded") && !["Cancelled","Refunded"].includes(previousStatus)) {
    await Promise.allSettled(order.items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    ));
  }

  const updatedOrder = await Order.findById(order._id).populate("customer", "name email phone");
  res.status(200).json(updatedOrder);

  const customerEmail = (updatedOrder?.customer as any)?.email || order.guestEmail;
  const customerName  = (updatedOrder?.customer as any)?.name  || "Customer";
  if (customerEmail) {
    sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: status, note: note || undefined }).catch(() => {});
  }

  // Auto-assign delivery partner when admin sends order to delivery
  if (status === "Processing" && previousStatus === "Pending") {
    import("../../utils/autoAssignDelivery").then(({ autoAssignDelivery }) => {
      autoAssignDelivery(order._id.toString());
    }).catch(() => {});
  }
});

/** GET /admin/orders/refunds — list all pending_refund orders */
export const getRefundRequests = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
  const skip  = (page - 1) * limit;

  const filter: any = { refundStatus: "pending_refund" };

  if (req.user?.role === "staff") {
    const staffProductIds = await Product.find({ createdBy: new mongoose.Types.ObjectId(req.user.id) })
      .select("_id").lean().then(ps => ps.map(p => p._id));
    if (staffProductIds.length === 0) {
      return res.status(200).json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }
    filter["items.product"] = { $in: staffProductIds };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ updatedAt: -1 }).skip(skip).limit(limit)
      .populate("customer", "name email phone")
      .select("orderId customer items totalAmount status refundStatus refundReason createdAt updatedAt"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

/** POST /admin/orders/:id/refund-decision — approve or reject a refund */
export const processRefundDecision = asyncHandler(async (req: Request, res: Response) => {
  const { decision, note } = req.body; // decision: "approved" | "rejected"
  if (!["approved","rejected"].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
  }

  const order = await Order.findById(req.params.id).populate("customer", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.refundStatus !== "pending_refund") {
    return res.status(400).json({ message: "This order does not have a pending refund request." });
  }

  if (decision === "approved") {
    order.status = "Refunded";
    order.refundStatus = "refunded";
    order.timeline.push({ status: "Refunded", timestamp: new Date(), note: note || "Refund approved by admin" });
    // Restore stock
    await Promise.allSettled(order.items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    ));
  } else {
    order.refundStatus = "rejected";
    order.timeline.push({ status: order.status, timestamp: new Date(), note: note || "Refund request rejected by admin" });
  }

  await order.save();

  const customerEmail = (order.customer as any)?.email || order.guestEmail;
  const customerName  = (order.customer as any)?.name  || "Customer";
  if (customerEmail) {
    const statusLabel = decision === "approved" ? "Refunded" : order.status;
    const emailNote   = decision === "approved"
      ? (note || "Your refund has been approved.")
      : (note || "Your refund request has been reviewed and could not be approved at this time.");
    sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: statusLabel, note: emailNote }).catch(() => {});
  }

  res.status(200).json({ message: `Refund ${decision}`, order });
});

