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
 * POST /api/v1/orders
 * Place an order. Works for both authenticated users and guests.
 * Body: { items, shippingAddress, paymentMethod, guestEmail? }
 */
export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, guestEmail, couponId, couponDiscount: clientCouponDiscount } = req.body;

    // Basic validation
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

    // Validate and fetch products
    const productIds = items.map((i: OrderItemInput) => i.productId).filter(Boolean);
    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    }).session(session);

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Validate stock and build order items
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
      if (!item.productId || !mongoose.isValidObjectId(item.productId)) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const product = productMap.get(item.productId);

      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Product not found or unavailable` });
      }

      if (product.stock < qty) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.images?.[0] || "",
      });

      stockUpdates.push(
        Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -qty } },
          { session }
        )
      );
    }

    // Fetch settings for shipping/tax calculation
    const settings = await Settings.findOne().lean();
    const shippingRate = settings?.standardShippingRate ?? 50;
    const freeThreshold = settings?.freeShippingThreshold ?? 999;
    const taxRate = settings?.taxRate ?? 18;
    const taxInclusive = settings?.taxInclusive ?? true;

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= freeThreshold ? 0 : shippingRate;
    const tax = taxInclusive ? 0 : Math.round(subtotal * (taxRate / 100) * 100) / 100;

    // Apply coupon discount if provided
    let couponDiscount = 0;
    let couponCode: string | undefined;
    let resolvedCouponId: string | undefined;

    if (couponId && req.user?.id) {
      const coupon = await Coupon.findById(couponId).session(session);
      if (coupon && coupon.isActive) {
        const now = new Date();
        const notExpired = !coupon.expiryDate || coupon.expiryDate > now;
        const withinLimit = coupon.usageLimit === undefined || coupon.usageCount < coupon.usageLimit;
        const notUsed = !coupon.usedBy.some(id => id.toString() === req.user!.id);
        if (notExpired && withinLimit && notUsed) {
          couponDiscount = coupon.discountType === "percentage"
            ? Math.round(subtotal * (coupon.discountValue / 100))
            : Math.min(coupon.discountValue, subtotal);
          couponCode = coupon.code;
          resolvedCouponId = coupon._id.toString();
          // Track usage
          await Coupon.findByIdAndUpdate(couponId, {
            $inc: { usageCount: 1 },
            $push: { usedBy: req.user.id },
          }, { session });
        }
      }
    }

    const totalAmount = Math.round((subtotal + shippingCost + tax - couponDiscount) * 100) / 100;

    // Generate order ID
    const prefix = settings?.orderIdPrefix || "ORD-";
    const seq = await getNextSequence("orderId");
    const orderId = `${prefix}${String(seq).padStart(6, "0")}`;

    // Create order
    const [order] = await Order.create(
      [
        {
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
        },
      ],
      { session }
    );

    // Deduct stock
    await Promise.all(stockUpdates);

    // Clear server cart if user is logged in
    if (req.user?.id) {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [] },
        { session }
      );
    }

    await session.commitTransaction();

    // Increment salesCount (fire-and-forget with logging)
    const salesIncrements = orderItems.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { salesCount: item.quantity } })
    );
    Promise.all(salesIncrements).catch(err => logger.warn("salesCount update failed:", err));

    // Fire-and-forget: notify staff whose products were ordered + check low stock
    const userRecord = req.user?.id
      ? await import("../../models/User").then(m => m.default.findById(req.user!.id).select("name email").lean())
      : null;
    const customerName = (userRecord as any)?.name ?? "A customer";
    const customerEmail = (userRecord as any)?.email ?? guestEmail;

    // Build enriched items with createdBy for notification routing
    const enrichedItems = orderItems.map(item => {
      const product = productMap.get(item.product.toString());
      return { ...item, createdBy: (product as any)?.createdBy };
    });

    sendOrderNotificationEmail({ orderId, totalAmount, customerName, items: enrichedItems });

    // Send customer confirmation email — only for COD (Razorpay sends it after payment verification)
    if (customerEmail && paymentMethod !== "Razorpay") {
      sendCustomerOrderEmail({
        to: customerEmail,
        customerName,
        orderId,
        items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        subtotal,
        shippingCost,
        tax,
        taxRate,
        taxInclusive,
        couponCode,
        couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
        totalAmount,
        paymentMethod,
        shippingAddress,
        createdAt: order.createdAt,
      });
    }

    // Check low stock for all products in this order after deduction
    const updatedProducts = await Product.find({ _id: { $in: productIds } })
      .select("name stock createdBy")
      .lean();
    sendLowStockEmail(updatedProducts as any);

    // Auto-assign a delivery partner (fire-and-forget)
    import("../../utils/autoAssignDelivery").then(({ autoAssignDelivery }) => {
      autoAssignDelivery(order._id.toString());
    }).catch(() => {});

    res.status(201).json({
      orderId: order.orderId,
      _id: order._id,
      totalAmount: order.totalAmount,
      subtotal,
      shippingCost,
      tax,
      taxRate,
      taxInclusive,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      items: order.items,
      timeline: order.timeline,
      createdAt: order.createdAt,
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/v1/orders/my/:id/cancel
 * Customer cancels their own order (only if Pending, Paid, or Processing)
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user!.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const cancellableStatuses = ["Pending", "Paid", "Processing"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is "${order.status}". Only Pending, Paid, or Processing orders can be cancelled.`,
      });
    }

    order.status = "Cancelled";
    order.timeline.push({ status: "Cancelled", timestamp: new Date(), note: "Cancelled by customer" });
    await order.save();

    // Restore stock
    const stockUpdates = order.items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    );
    await Promise.allSettled(stockUpdates);

    // Notify customer
    const userRecord = await import("../../models/User").then(m =>
      m.default.findById(req.user!.id).select("name email").lean()
    );
    const customerEmail = (userRecord as any)?.email;
    const customerName = (userRecord as any)?.name || "Customer";
    if (customerEmail) {
      const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
      sendOrderStatusEmail({
        to: customerEmail,
        customerName,
        orderId: order.orderId,
        newStatus: "Cancelled",
        note: "Cancelled by customer",
      }).catch(() => {});
    }

    res.status(200).json({ message: "Order cancelled successfully", status: "Cancelled" });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * POST /api/v1/orders/my/:id/refund
 * Customer requests a refund (only if Delivered)
 */
export const requestRefund = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user!.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Refund can only be requested for delivered orders." });
    }

    if (order.refundStatus === "pending_refund") {
      return res.status(400).json({ message: "A refund request is already pending for this order." });
    }

    if (order.refundStatus === "refunded") {
      return res.status(400).json({ message: "This order has already been refunded." });
    }

    const { reason } = req.body;
    // reason is optional — admin can see the request without a reason

    order.refundStatus = "pending_refund";
    if (reason?.trim()) order.refundReason = reason.trim();
    order.timeline.push({ status: order.status, timestamp: new Date(), note: reason?.trim() ? `Refund requested: ${reason.trim()}` : "Refund requested by customer" });
    await order.save();

    res.status(200).json({ message: "Refund request submitted. Our team will review it shortly.", refundStatus: "pending_refund" });
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};

/**
 * GET /api/v1/orders/my
 * Get logged-in user's order history
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("orderId items totalAmount status paymentMethod refundStatus createdAt shippingAddress")
        .lean(),
      Order.countDocuments({ customer: req.user!.id }),
    ]);

    res.status(200).json({
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * GET /api/v1/orders/my/:id
 * Get a specific order for the logged-in user
 */
export const getMyOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user!.id,
    }).lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};
