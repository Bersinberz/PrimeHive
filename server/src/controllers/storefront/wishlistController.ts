import { Request, Response } from "express";
import Wishlist from "../../models/Wishlist";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: req.user!.id })
    .populate("products", "name price comparePrice images stock status category")
    .lean();
  res.status(200).json(wishlist?.products ?? []);
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user!.id },
    { $addToSet: { products: productId } },
    { upsert: true, returnDocument: 'after' }
  ).populate("products", "name price comparePrice images stock status");

  res.status(200).json(wishlist.products);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user!.id },
    { $pull: { products: new mongoose.Types.ObjectId(productId) } },
    { returnDocument: 'after' }
  ).populate("products", "name price comparePrice images stock status");

  res.status(200).json(wishlist?.products ?? []);
});

export const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  await Wishlist.findOneAndUpdate({ user: req.user!.id }, { products: [] }, { upsert: true });
  res.status(200).json({ message: "Wishlist cleared" });
});

