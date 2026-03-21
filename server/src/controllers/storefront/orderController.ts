import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../../models/Order";
import Product from "../../models/Product";
import Cart from "../../models/Cart";
import Settings from "../../models/Settings";
import { getNextSequence } from "../../models/Counter";
import { sendOrderNotificationEmail } from "../../utils/sendOrderNotificationEmail";
import { sendLowStockEmail } from "../../utils/sendLowStockEmail";

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
    const { items, shippingAddress, paymentMethod, guestEmail } = req.body;

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
    const totalAmount = Math.round((subtotal + shippingCost + tax) * 100) / 100;

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

    // Fire-and-forget: notify staff whose products were ordered + check low stock
    const customerName = req.user?.id
      ? (await import("../../models/User").then(m => m.default.findById(req.user!.id).select("name").lean()))?.name ?? "A customer"
      : "A guest";

    // Build enriched items with createdBy for notification routing
    const enrichedItems = orderItems.map(item => {
      const product = productMap.get(item.product.toString());
      return { ...item, createdBy: (product as any)?.createdBy };
    });

    sendOrderNotificationEmail({
      orderId,
      totalAmount,
      customerName,
      items: enrichedItems,
    });

    // Check low stock for all products in this order after deduction
    const updatedProducts = await Product.find({ _id: { $in: productIds } })
      .select("name stock createdBy")
      .lean();
    sendLowStockEmail(updatedProducts as any);

    res.status(201).json({
      orderId: order.orderId,
      _id: order._id,
      totalAmount: order.totalAmount,
      status: order.status,
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
 * GET /api/v1/orders/my
 * Get logged-in user's order history
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("orderId items totalAmount status createdAt shippingAddress")
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
