import express from "express";
import { validateCoupon } from "../../controllers/admin/couponController";
import { verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.post("/validate", verifyToken, validateCoupon);

export default router;
