import express from "express";
import {
    getOrders,
    getOrderById,
    updateOrderStatus,
} from "../../controllers/admin/orderController";
import { adminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/get",          verifyToken, adminOnly, checkPermission("orders", "view"),         getOrders);
router.get("/get/:id",      verifyToken, adminOnly, checkPermission("orders", "view"),         getOrderById);
router.put("/status/:id",   verifyToken, adminOnly, checkPermission("orders", "updateStatus"), updateOrderStatus);

export default router;
