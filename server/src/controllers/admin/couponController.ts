import { Request, Response } from "express";
import Coupon from "../../models/Coupon";
import mongoose from "mongoose";

function validateCouponFields(body: any): string | null {
  const { code, discountType, discountValue } = body;
  if (!code || typeof code !== "string" || !code.trim())
    return "code is required";
  if (!discountType || !["percentage", "fixed"].includes(discountType))
    return "discountType must be 'percentage' or 'fixed'";
  const val = Number(discountValue);
  if (isNaN(val) || val < 1)
    return "discountValue must be at least 1";
  if (discountType === "percentage" && val > 99)
    return "discountValue must be between 1 and 99 for percentage type";
  return null;
}

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const err = validateCouponFields(req.body);
    if (err) return res.status(400).json({ message: err });

    const { code, discountType, discountValue, minOrderValue, usageLimit, expiryDate, isActive = true } = req.body;
    const upperCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: upperCode });
    if (existing) return res.status(409).json({ message: "A coupon with this code already exists" });

    const coupon = await Coupon.create({ code: upperCode, discountType, discountValue: Number(discountValue), minOrderValue, usageLimit, expiryDate, isActive });
    return res.status(201).json(coupon);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const getCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().lean();
    return res.json(coupons);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const existing = await Coupon.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Coupon not found" });

    const merged = { code: existing.code, discountType: existing.discountType, discountValue: existing.discountValue, ...req.body };
    const err = validateCouponFields(merged);
    if (err) return res.status(400).json({ message: err });

    const { code, discountType, discountValue, minOrderValue, usageLimit, expiryDate, isActive } = req.body;

    // Check code uniqueness if code is being changed
    if (code) {
      const upperCode = code.trim().toUpperCase();
      const dup = await Coupon.findOne({ code: upperCode, _id: { $ne: existing._id } });
      if (dup) return res.status(409).json({ message: "A coupon with this code already exists" });
    }

    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(expiryDate !== undefined && { expiryDate }),
        ...(isActive !== undefined && { isActive }),
      },
      { returnDocument: 'after' }
    );
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.json({ message: "Coupon deleted" });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

// Storefront: validate a coupon code against an order total
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });
    if (orderTotal === undefined || isNaN(Number(orderTotal)))
      return res.status(400).json({ message: "orderTotal is required" });

    const total = Number(orderTotal);
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) return res.status(404).json({ message: "Coupon code not found." });
    if (!coupon.isActive) return res.status(400).json({ message: "This coupon is no longer active." });
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
      return res.status(400).json({ message: "This coupon has expired." });
    if (coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit)
      return res.status(400).json({ message: "This coupon has reached its usage limit." });

    const userId = req.user?.id;
    if (userId && coupon.usedBy.some(id => id.toString() === userId))
      return res.status(400).json({ message: "You have already used this coupon." });

    const minOrder = coupon.minOrderValue ?? 0;
    if (total < minOrder)
      return res.status(400).json({ message: `Minimum order value of ₹${minOrder} required for this coupon.` });

    const couponDiscount =
      coupon.discountType === "percentage"
        ? Math.round(total * (coupon.discountValue / 100))
        : Math.min(coupon.discountValue, total);

    return res.json({
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      couponDiscount,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

