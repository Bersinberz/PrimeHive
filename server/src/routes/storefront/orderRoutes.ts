import express from "express";
import { createOrder, getMyOrders, getMyOrderById, cancelOrder, requestRefund } from "../../controllers/storefront/orderController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";
import { optionalAuth } from "../../middleware/optionalAuth";

const router = express.Router();

// POST /orders — works for guests (optionalAuth) and logged-in users
router.post("/", optionalAuth, createOrder);

// My orders — requires auth
router.get("/my", verifyToken, userOnly, getMyOrders);
router.get("/my/:id", verifyToken, userOnly, getMyOrderById);
router.post("/my/:id/cancel", verifyToken, userOnly, cancelOrder);
router.post("/my/:id/refund", verifyToken, userOnly, requestRefund);

export default router;
