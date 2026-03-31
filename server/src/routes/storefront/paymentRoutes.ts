import express from "express";
import { createRazorpayOrder, verifyPayment, expirePayment } from "../../controllers/storefront/paymentController";
import { optionalAuth } from "../../middleware/optionalAuth";

const router = express.Router();

router.post("/create-order", optionalAuth, createRazorpayOrder);
router.post("/verify",       optionalAuth, verifyPayment);
router.post("/expire",       optionalAuth, expirePayment);

export default router;
