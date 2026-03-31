import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../../models/Order";
import Product from "../../models/Product";
import Cart from "../../models/Cart";
import Coupon from "../../models/Coupon";
import Settings from "../../models/Settings";
import { getNextSequence } from "../../models/Counter";
import { sendOrderNotificationEmail } from "../../utils/sendOrderNotificationEmail";
import { sendCustomerOrderEmail } from "../../utils/sendCustomerOrderEmail";
import { sendLowStockEmail } from "../../utils/sendLowStockEmail";
import logger from "../../config/logger";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

/**
 * Shared helper: validate items, calculate totals, apply coupon (read-only check).
 * Does NOT deduct stock or mark coupon used.
 */
async function buildOrderData(
  items: OrderItemInput[],
  shippingAddress: any,
  paymentMethod: string,
  guestEmail: string | undefined,
  couponId: string | undefined,
  userId: string | undefined,
  session: mongoose.ClientSession
) {
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds }, status: "active" }).session(session);
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems: any[] = [];
  for (const item of items) {
    if (!item.productId || !mongoose.isValidObjectId(item.productId))
      throw Object.assign(new Error(`Invalid product ID: ${item.productId}`), { status: 400 });
    const qty = Math.max(1, parseInt(item.quantity as any) || 1);
    const product = productMap.get(item.productId);
    if (!product) throw Object.assign(new Error("Product not found or unavailable"), { status: 400 });
    if (product.stock < qty)
      throw Object.assign(new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`), { status: 400 });
    orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: qty, image: product.images?.[0] || "" });
  }

  const settings = await Settings.findOne().lean();
  const shippingRate   = settings?.standardShippingRate ?? 50;
  const freeThreshold  = settings?.freeShippingThreshold ?? 999;
  const taxRate        = settings?.taxRate ?? 18;
  const taxInclusive   = settings?.taxInclusive ?? true;
  const orderIdPrefix  = (settings as any)?.orderIdPrefix || "ORD-";

  const subtotal     = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= freeThreshold ? 0 : shippingRate;
  const tax          = taxInclusive ? 0 : Math.round(subtotal * (taxRate / 100) * 100) / 100;

  // Validate coupon (read-only — don't mark used yet)
  let couponDiscount = 0;
  let couponCode: string | undefined;
  if (couponId && userId) {
    const coupon = await Coupon.findById(couponId).session(session);
    if (coupon && coupon.isActive) {
      const now = new Date();
      const ok = (!coupon.expiryDate || coupon.expiryDate > now)
        && (coupon.usageLimit === undefined || coupon.usageCount < coupon.usageLimit)
        && !coupon.usedBy.some((id: any) => id.toString() === userId);
      if (ok) {
        couponDiscount = coupon.discountType === "percentage"
          ? Math.round(subtotal * (coupon.discountValue / 100))
          : Math.min(coupon.discountValue, subtotal);
        couponCode = coupon.code;
      }
    }
  }

  const totalAmount = Math.round((subtotal + shippingCost + tax - couponDiscount) * 100) / 100;

  return { orderItems, productMap, productIds, subtotal, shippingCost, tax, taxRate, taxInclusive, couponDiscount, couponCode, totalAmount, orderIdPrefix };
}

/**
 * POST /api/v1/orders
 * For COD: creates order, deducts stock, clears cart, sends emails — all in one go.
 * For Razorpay: creates a draft order (no stock deduction) and returns _id for payment.
 */
export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, guestEmail, couponId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Order must contain at least one item" });
    }
    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Complete shipping address is required" });
    }
    if (!paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment method is required" });
    }

    let built: Awaited<ReturnType<typeof buildOrderData>>;
    try {
      built = await buildOrderData(items, shippingAddress, paymentMethod, guestEmail, couponId, req.user?.id, session);
    } catch (err: any) {
      await session.abortTransaction();
      return res.status(err.status || 400).json({ message: err.message });
    }

    const { orderItems, productMap, productIds, subtotal, shippingCost, tax, taxRate, taxInclusive, couponDiscount, couponCode, totalAmount, orderIdPrefix } = built;

    const seq     = await getNextSequence("orderId");
    const orderId = `${orderIdPrefix}${String(seq).padStart(6, "0")}`;

    // For Razorpay: create draft order only — no stock deduction, no coupon marking, no cart clear
    if (paymentMethod === "Razorpay") {
      const [order] = await Order.create([{
        orderId,
        customer: req.user?.id || undefined,
        items: orderItems,
        totalAmount,
        paymentMethod,
        shippingAddress,
        status: "Pending",
        timeline: [{ status: "Pending", timestamp: new Date() }],
        ...(guestEmail && !req.user ? { guestEmail } : {}),
        ...(couponCode ? { couponCode, couponDiscount, pendingCouponId: couponId } : {}),
      }], { session });

      await session.commitTransaction();

      return res.status(201).json({
        orderId: order.orderId, _id: order._id,
        totalAmount: order.totalAmount, subtotal, shippingCost, tax, taxRate, taxInclusive,
        couponCode: order.couponCode, couponDiscount: order.couponDiscount,
        status: order.status, paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress, items: order.items,
        timeline: order.timeline, createdAt: order.createdAt,
      });
    }

    // COD: deduct stock, mark coupon used, clear cart — all in transaction
    const stockUpdates = orderItems.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { session })
    );

    if (couponId && req.user?.id && couponCode) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 }, $push: { usedBy: req.user.id } }, { session });
    }

    const [order] = await Order.create([{
      orderId,
      customer: req.user?.id || undefined,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: "Pending",
      timeline: [{ status: "Pending", timestamp: new Date() }],
      ...(guestEmail && !req.user ? { guestEmail } : {}),
      ...(couponCode ? { couponCode, couponDiscount } : {}),
    }], { session });

    await Promise.all(stockUpdates);

    if (req.user?.id) {
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { session });
    }

    await session.commitTransaction();

    // Fire-and-forget post-commit tasks
    orderItems.forEach(item => Product.findByIdAndUpdate(item.product, { $inc: { salesCount: item.quantity } }).catch(() => {}));

    const userRecord = req.user?.id
      ? await import("../../models/User").then(m => m.default.findById(req.user!.id).select("name email").lean())
      : null;
    const customerName  = (userRecord as any)?.name  ?? "A customer";
    const customerEmail = (userRecord as any)?.email ?? guestEmail;

    const enrichedItems = orderItems.map(item => ({ ...item, createdBy: (productMap.get(item.product.toString()) as any)?.createdBy }));
    sendOrderNotificationEmail({ orderId, totalAmount, customerName, items: enrichedItems });

    if (customerEmail) {
      sendCustomerOrderEmail({ to: customerEmail, customerName, orderId, items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })), subtotal, shippingCost, tax, taxRate, taxInclusive, couponCode, couponDiscount: couponDiscount > 0 ? couponDiscount : undefined, totalAmount, paymentMethod, shippingAddress, createdAt: order.createdAt });
    }

    const updatedProducts = await Product.find({ _id: { $in: productIds } }).select("name stock createdBy").lean();
    sendLowStockEmail(updatedProducts as any);

    import("../../utils/autoAssignDelivery").then(({ autoAssignDelivery }) => {
      autoAssignDelivery(order._id.toString());
    }).catch(() => {});

    return res.status(201).json({
      orderId: order.orderId, _id: order._id,
      totalAmount: order.totalAmount, subtotal, shippingCost, tax, taxRate, taxInclusive,
      couponCode: order.couponCode, couponDiscount: order.couponDiscount,
      status: order.status, paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress, items: order.items,
      timeline: order.timeline, createdAt: order.createdAt,
    });

  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  } finally {
    session.endSession();
  }
};

/** POST /api/v1/orders/my/:id/cancel */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user!.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const cancellableStatuses = ["Pending", "Paid", "Processing"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order that is "${order.status}". Only Pending, Paid, or Processing orders can be cancelled.` });
    }

    order.status = "Cancelled";
    order.timeline.push({ status: "Cancelled", timestamp: new Date(), note: "Cancelled by customer" });
    await order.save();

    // Only restore stock if it was actually deducted (COD orders, or Razorpay after payment)
    if (order.paymentMethod !== "Razorpay" || order.status === "Paid") {
      await Promise.allSettled(order.items.map(item =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
      ));
    }

    const userRecord = await import("../../models/User").then(m => m.default.findById(req.user!.id).select("name email").lean());
    const customerEmail = (userRecord as any)?.email;
    const customerName  = (userRecord as any)?.name || "Customer";
    if (customerEmail) {
      const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
      sendOrderStatusEmail({ to: customerEmail, customerName, orderId: order.orderId, newStatus: "Cancelled", note: "Cancelled by customer" }).catch(() => {});
    }

    res.status(200).json({ message: "Order cancelled successfully", status: "Cancelled" });
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};

/** POST /api/v1/orders/my/:id/refund */
export const requestRefund = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user!.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Delivered") return res.status(400).json({ message: "Refund can only be requested for delivered orders." });
    if (order.refundStatus === "pending_refund") return res.status(400).json({ message: "A refund request is already pending for this order." });
    if (order.refundStatus === "refunded") return res.status(400).json({ message: "This order has already been refunded." });

    const { reason } = req.body;
    order.refundStatus = "pending_refund";
    if (reason?.trim()) order.refundReason = reason.trim();
    order.timeline.push({ status: order.status, timestamp: new Date(), note: reason?.trim() ? `Refund requested: ${reason.trim()}` : "Refund requested by customer" });
    await order.save();

    // Create a Return document so it appears in the admin Returns page
    const Return = (await import("../../models/Return")).default;
    await Return.create({
      order:    order._id,
      customer: req.user!.id,
      items:    order.items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price })),
      reason:   reason?.trim() || "Refund requested by customer",
      status:   "requested",
    });

    res.status(200).json({ message: "Refund request submitted. Our team will review it shortly.", refundStatus: "pending_refund" });
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};

/** GET /api/v1/orders/my */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user!.id })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .select("orderId items totalAmount status paymentMethod refundStatus createdAt shippingAddress")
        .lean(),
      Order.countDocuments({ customer: req.user!.id }),
    ]);

    res.status(200).json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};

/** GET /api/v1/orders/my/:id */
export const getMyOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user!.id }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};
