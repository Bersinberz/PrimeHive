import express from "express";
import { getDashboardStats } from "../../controllers/admin/statsController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

/**
 * Get Dashboard + Analytics Stats
 */
router.get("/", verifyToken, adminOnly, getDashboardStats);

export default router;
