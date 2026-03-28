import express from "express";
import { getReviews, moderateReview, deleteReview } from "../../controllers/admin/reviewController";
import { verifyToken, adminOnly, superAdminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/",           verifyToken, adminOnly,       getReviews);
router.put("/:id",        verifyToken, adminOnly,       moderateReview);
router.delete("/:id",     verifyToken, superAdminOnly,  deleteReview);

export default router;
