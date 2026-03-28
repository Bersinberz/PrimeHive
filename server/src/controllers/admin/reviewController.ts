import { Request, Response } from "express";
import Review from "../../models/Review";
import { asyncHandler } from "../../utils/asyncHandler";

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const status = req.query.status as string | undefined;
  const skip   = (page - 1) * limit;

  const filter: any = {};
  if (status && ["pending","approved","rejected"].includes(status)) filter.status = status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("product", "name images")
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({ data: reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["approved","rejected"].includes(status)) {
    return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
  }

  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
  if (!review) return res.status(404).json({ message: "Review not found" });

  res.status(200).json(review);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.status(200).json({ message: "Review deleted" });
});

