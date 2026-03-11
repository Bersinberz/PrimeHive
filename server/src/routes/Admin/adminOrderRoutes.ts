import express from "express";
import {
    getOrders,
    getOrderById,
    updateOrderStatus,
} from "../../controllers/Admin/adminOrderController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

/**
 * Get All Orders
 */
router.get("/get", verifyToken, adminOnly, getOrders);

/**
 * Get Single Order
 */
router.get("/get/:id", verifyToken, adminOnly, getOrderById);

/**
 * Update Order Status
 */
router.put("/status/:id", verifyToken, adminOnly, updateOrderStatus);

export default router;
