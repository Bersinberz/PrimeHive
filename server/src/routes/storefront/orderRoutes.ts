import express from "express";
import { createOrder, getMyOrders, getMyOrderById, cancelOrder, requestRefund } from "../../controllers/storefront/orderController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";
import { optionalAuth } from "../../middleware/optionalAuth";
import { validate } from "../../middleware/validate";
import { CreateOrderSchema, RefundRequestSchema } from "../../schemas/orderSchemas";

const router = express.Router();

router.post("/",             optionalAuth, validate(CreateOrderSchema), createOrder);
router.get("/my",            verifyToken, userOnly, getMyOrders);
router.get("/my/:id",        verifyToken, userOnly, getMyOrderById);
router.post("/my/:id/cancel",verifyToken, userOnly, cancelOrder);
router.post("/my/:id/refund",verifyToken, userOnly, validate(RefundRequestSchema), requestRefund);

export default router;
