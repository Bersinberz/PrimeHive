import express from "express";
import { getDashboardStats } from "../../controllers/admin/statsController";
import { adminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, adminOnly, checkPermission("dashboard", "view"), getDashboardStats);

export default router;
