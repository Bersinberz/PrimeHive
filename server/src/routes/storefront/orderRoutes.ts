import express from "express";
import { createOrder, getMyOrders, getMyOrderById } from "../../controllers/storefront/orderController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";
import { optionalAuth } from "../../middleware/optionalAuth";

const router = express.Router();

// POST /orders — works for guests (optionalAuth) and logged-in users
router.post("/", optionalAuth, createOrder);

// My orders — requires auth
router.get("/my", verifyToken, userOnly, getMyOrders);
router.get("/my/:id", verifyToken, userOnly, getMyOrderById);

export default router;
