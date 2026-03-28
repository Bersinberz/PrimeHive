import express from "express";
import { getReturns, processReturn } from "../../controllers/admin/returnController";
import { verifyToken, adminOnly, checkPermission } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/",       verifyToken, adminOnly, checkPermission("orders", "view"),         getReturns);
router.put("/:id",    verifyToken, adminOnly, checkPermission("orders", "updateStatus"), processReturn);

export default router;
