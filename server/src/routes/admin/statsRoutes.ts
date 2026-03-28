import express from "express";
import { getDashboardStats, getAdvancedStats } from "../../controllers/admin/statsController";
import { adminOnly, verifyToken, checkPermission, superAdminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/",        verifyToken, adminOnly,       checkPermission("dashboard", "view"), getDashboardStats);
router.get("/advanced",verifyToken, superAdminOnly,                                        getAdvancedStats);

export default router;
