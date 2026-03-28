import { Request, Response } from "express";
import Return from "../../models/Return";
import Order from "../../models/Order";
import { asyncHandler } from "../../utils/asyncHandler";

export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, reason, items } = req.body;

  if (!orderId || !reason?.trim() || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "orderId, reason, and items are required" });
  }

  const order = await Order.findOne({ _id: orderId, customer: req.user!.id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "Delivered") {
    return res.status(400).json({ message: "Returns can only be requested for delivered orders." });
  }

  const existing = await Return.findOne({ order: orderId, customer: req.user!.id, status: { $in: ["requested","approved"] } });
  if (existing) return res.status(409).json({ message: "A return request already exists for this order." });

  const returnItems = items.map((item: any) => {
    const orderItem = order.items.find(i => i.product.toString() === item.productId);
    if (!orderItem) throw new Error(`Product ${item.productId} not found in order`);
    return { product: orderItem.product, name: orderItem.name, quantity: item.quantity || orderItem.quantity, price: orderItem.price };
  });

  const returnRequest = await Return.create({
    order: orderId, customer: req.user!.id,
    items: returnItems, reason: reason.trim(),
  });

  res.status(201).json(returnRequest);
});

export const getMyReturns = asyncHandler(async (req: Request, res: Response) => {
  const returns = await Return.find({ customer: req.user!.id })
    .sort({ createdAt: -1 })
    .populate("order", "orderId totalAmount createdAt")
    .lean();
  res.status(200).json(returns);
});
