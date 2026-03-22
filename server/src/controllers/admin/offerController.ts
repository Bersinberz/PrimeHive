import { Request, Response } from "express";
import Offer from "../../models/Offer";
import Product from "../../models/Product";
import mongoose from "mongoose";

function validateOfferFields(body: any): string | null {
  const { label, discountType, discountValue, startDate, endDate } = body;
  if (!label || typeof label !== "string" || !label.trim())
    return "label is required";
  if (!discountType || !["percentage", "fixed"].includes(discountType))
    return "discountType must be 'percentage' or 'fixed'";
  const val = Number(discountValue);
  if (isNaN(val) || val < 1)
    return "discountValue must be at least 1";
  if (discountType === "percentage" && val > 99)
    return "discountValue must be between 1 and 99 for percentage type";
  if (startDate && endDate && new Date(endDate) <= new Date(startDate))
    return "endDate must be after startDate";
  return null;
}

export const createOffer = async (req: Request, res: Response) => {
  try {
    const err = validateOfferFields(req.body);
    if (err) return res.status(400).json({ message: err });

    const { label, discountType, discountValue, isActive = true, startDate, endDate, productIds = [] } = req.body;

    // Verify all productIds exist
    if (productIds.length > 0) {
      const validIds = productIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== productIds.length)
        return res.status(400).json({ message: "One or more product IDs are invalid" });
      const found = await Product.countDocuments({ _id: { $in: validIds } });
      if (found !== validIds.length)
        return res.status(400).json({ message: "One or more products not found" });

      // Check active-offer conflict
      if (isActive) {
        const conflict = await Offer.findOne({
          isActive: true,
          productIds: { $in: validIds },
        });
        if (conflict) {
          return res.status(409).json({ message: `One or more products are already linked to an active offer` });
        }
      }
    }

    const offer = await Offer.create({ label: label.trim(), discountType, discountValue: Number(discountValue), isActive, startDate, endDate, productIds });
    return res.status(201).json(offer);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const getOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find().lean();
    const result = offers.map(o => ({ ...o, productCount: o.productIds?.length ?? 0 }));
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const getOfferById = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    return res.json(offer);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const existing = await Offer.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Offer not found" });

    const err = validateOfferFields({ ...existing.toObject(), ...req.body });
    if (err) return res.status(400).json({ message: err });

    const { label, discountType, discountValue, isActive, startDate, endDate, productIds } = req.body;

    // Check active-offer conflict for newly added products
    const newProductIds: string[] = productIds ?? existing.productIds.map(String);
    const effectiveActive = isActive !== undefined ? isActive : existing.isActive;

    if (effectiveActive && newProductIds.length > 0) {
      const conflict = await Offer.findOne({
        _id: { $ne: existing._id },
        isActive: true,
        productIds: { $in: newProductIds },
      });
      if (conflict) {
        return res.status(409).json({ message: "One or more products are already linked to another active offer" });
      }
    }

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        ...(label !== undefined && { label: label.trim() }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(productIds !== undefined && { productIds }),
      },
      { new: true }
    );
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    return res.json({ message: "Offer deleted" });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

// Public storefront endpoint — no auth required
export const getActiveOffers = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const offers = await Offer.find({ isActive: true })
      .populate("productIds", "name price comparePrice images stock category")
      .lean();

    const active = offers.filter(o => {
      if (o.startDate && new Date(o.startDate) > now) return false;
      if (o.endDate && new Date(o.endDate) < now) return false;
      return true;
    });

    const result = active.map(o => ({
      _id: o._id,
      label: o.label,
      discountType: o.discountType,
      discountValue: o.discountValue,
      endDate: o.endDate,
      products: (o.productIds as any[])
        .filter(p => p.stock > 0)
        .map(p => {
          const discountedPrice = o.discountType === "percentage"
            ? Math.round(p.price * (1 - o.discountValue / 100))
            : Math.max(0, p.price - o.discountValue);
          return { ...p, discountedPrice };
        }),
    })).filter(o => o.products.length > 0);

    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};
