import express from "express";
import { createCoupon, getCoupons, updateCoupon, deleteCoupon } from "../../controllers/admin/couponController";
import { verifyToken, superAdminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.use(verifyToken, superAdminOnly);

router.post("/", createCoupon);
router.get("/", getCoupons);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
