import express from "express";
import { getReviews, createReview, deleteReview } from "../../controllers/storefront/reviewController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";

const router = express.Router();

router.get("/:productId",                          getReviews);
router.post("/:productId", verifyToken, userOnly,  createReview);
router.delete("/:reviewId", verifyToken, userOnly, deleteReview);

export default router;
