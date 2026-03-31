import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../../models/Order";
import User from "../../models/User";
import Product from "../../models/Product";
import Cart from "../../models/Cart";
import Coupon from "../../models/Coupon";
import Settings from "../../models/Settings";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendCustomerOrderEmail } from "../../utils/sendCustomerOrderEmail";
import { sendLowStockEmail } from "../../utils/sendLowStockEmail";

// Lazy-initialize so keys are read at request time, not module load
let _razorpay: Razorpay | null = null;
const getRazorpay = (): Razorpay => {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || keyId.includes("YOUR_KEY") || !keySecret || keySecret.includes("YOUR_KEY")) {
    throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.");
  }
  if (!_razorpay) _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
};

/**
 * POST /api/v1/payments/create-order
 * Creates a Razorpay order for an existing pending order.
 * Body: { orderId: string }  ← our internal DB _id
 */
export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "orderId is required" });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status !== "Pending") {
    return res.status(400).json({ message: "Order is not in Pending state" });
  }

  // Razorpay amount is in paise (1 INR = 100 paise)
  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order.orderId,
    notes: { internalOrderId: order._id.toString() },
  });

  res.status(200).json({
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
    orderId:         order._id,
    orderRef:        order.orderId,
  });
});

/**
 * POST /api/v1/payments/verify
 * Verifies Razorpay payment signature and marks order as Paid.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  // Verify HMAC-SHA256 signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed: invalid signature" });
  }

  // Mark order as Paid — then do all the work that was deferred from createOrder
  const order = await Order.findById(orderId).populate("items.product", "createdBy");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "Cancelled") return res.status(400).json({ message: "Order was cancelled due to payment timeout." });
  if (order.status === "Paid") return res.status(400).json({ message: "Order already paid." });

  order.status = "Paid";
  order.paymentMethod = "Razorpay";
  order.timeline.push({ status: "Paid", timestamp: new Date(), note: `Razorpay payment ${razorpay_payment_id}` });
  await order.save();

  // NOW deduct stock (deferred from createOrder for Razorpay)
  await Promise.allSettled(order.items.map(item =>
    Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
  ));

  // Mark coupon used if applicable
  const pendingCouponId = (order as any).pendingCouponId;
  if (pendingCouponId && order.customer) {
    await Coupon.findByIdAndUpdate(pendingCouponId, {
      $inc: { usageCount: 1 },
      $push: { usedBy: order.customer },
    }).catch(() => {});
  }

  // Clear cart
  if (order.customer) {
    await Cart.findOneAndUpdate({ user: order.customer }, { items: [] }).catch(() => {});
  }

  // Increment salesCount
  order.items.forEach(item => Product.findByIdAndUpdate(item.product, { $inc: { salesCount: item.quantity } }).catch(() => {}));

  // Low stock check
  const productIds = order.items.map(i => i.product);
  const updatedProducts = await Product.find({ _id: { $in: productIds } }).select("name stock createdBy").lean();
  sendLowStockEmail(updatedProducts as any);

  // Send confirmation email now that payment is confirmed
  try {
    const settings = await Settings.findOne().lean();
    const taxRate     = settings?.taxRate     ?? 18;
    const taxInclusive = settings?.taxInclusive ?? true;
    const shippingRate = settings?.standardShippingRate ?? 50;
    const freeThreshold = settings?.freeShippingThreshold ?? 999;

    const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const couponDiscount = order.couponDiscount ?? 0;
    const discounted = subtotal - couponDiscount;
    const shippingCost = discounted >= freeThreshold ? 0 : shippingRate;
    const tax = taxInclusive ? 0 : Math.round(discounted * (taxRate / 100) * 100) / 100;

    let customerEmail: string | undefined;
    let customerName = "Customer";

    if (order.customer) {
      const user = await User.findById(order.customer).select("name email").lean();
      customerEmail = (user as any)?.email;
      customerName  = (user as any)?.name || "Customer";
    } else if (order.guestEmail) {
      customerEmail = order.guestEmail;
    }

    if (customerEmail) {
      sendCustomerOrderEmail({
        to: customerEmail,
        customerName,
        orderId: order.orderId,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        subtotal,
        shippingCost,
        tax,
        taxRate,
        taxInclusive,
        couponCode:     order.couponCode,
        couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
        totalAmount:    order.totalAmount,
        paymentMethod:  "Razorpay",
        shippingAddress: order.shippingAddress,
        createdAt:      order.createdAt,
      });
    }

    // Notify staff now that payment is confirmed
    const { sendOrderNotificationEmail } = await import("../../utils/sendOrderNotificationEmail");
    const enrichedItems = order.items.map(i => ({
      name: i.name, quantity: i.quantity, price: i.price, image: i.image,
      createdBy: (i.product as any)?.createdBy,
    }));
    sendOrderNotificationEmail({ orderId: order.orderId, totalAmount: order.totalAmount, customerName, items: enrichedItems }).catch(() => {});

    // Auto-assign delivery partner now that payment is confirmed
    import("../../utils/autoAssignDelivery").then(({ autoAssignDelivery }) => {
      autoAssignDelivery(order._id.toString());
    }).catch(() => {});
  } catch { /* email failure must not break payment confirmation */ }

  res.status(200).json({
    success: true,
    orderId:   order._id,
    orderRef:  order.orderId,
    paymentId: razorpay_payment_id,
  });
});

/**
 * POST /api/v1/payments/expire
 * Called by frontend when 5-min payment timer runs out.
 * Cancels the order and restores stock.
 */
export const expirePayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "orderId is required" });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status !== "Pending") {
    return res.status(400).json({ message: "Order is no longer pending." });
  }

  order.status = "Cancelled";
  order.timeline.push({ status: "Cancelled", timestamp: new Date(), note: "Payment timeout — not completed within 5 minutes" });
  await order.save();

  // Stock was NOT deducted for Razorpay draft orders, so no restore needed

  res.status(200).json({ message: "Order cancelled due to payment timeout." });
});
