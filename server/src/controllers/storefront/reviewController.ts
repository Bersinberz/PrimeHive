import { Request, Response } from "express";
import Review from "../../models/Review";
import User from "../../models/User";

/**
 * GET /api/v1/reviews/:productId
 * Public — get all reviews for a product
 */
export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: "approved" })
      .sort({ createdAt: -1 }).lean();

    const total = reviews.length;
    const avg = total ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;
    const dist = [5,4,3,2,1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));

    res.json({ reviews, avg, total, dist });
  } catch {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * POST /api/v1/reviews/:productId
 * Auth (user only) — submit a review
 */
export const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, title, body } = req.body;
    const userId = req.user!.id;
    const productId = req.params.productId;

    if (!rating || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Rating, title and review body are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(userId).select("name").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      userName: user.name,
      rating: Number(rating),
      title: title.trim(),
      body: body.trim(),
    });

    res.status(201).json(review);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: "Failed to submit review" });
  }
};

/**
 * DELETE /api/v1/reviews/:reviewId
 * Auth (user only) — delete own review
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Not your review" });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete review" });
  }
};
