import express from "express";
import {
  getOrders, getOrderById, updateOrderStatus,
  getRefundRequests, processRefundDecision,
} from "../../controllers/admin/orderController";
import { adminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";
import { audit } from "../../middleware/auditLog";

const router = express.Router();

router.get("/get",                verifyToken, adminOnly, checkPermission("orders", "view"),         getOrders);
router.get("/refunds",            verifyToken, adminOnly, checkPermission("orders", "view"),         getRefundRequests);
router.get("/get/:id",            verifyToken, adminOnly, checkPermission("orders", "view"),         getOrderById);
router.put("/status/:id",         verifyToken, adminOnly, checkPermission("orders", "updateStatus"), audit({ action: "order.status_update", target: "Order", getMetadata: (req) => ({ status: req.body.status }) }), updateOrderStatus);
router.post("/:id/refund-decision", verifyToken, adminOnly, checkPermission("orders", "updateStatus"), audit({ action: "order.refund_decision", target: "Order", getMetadata: (req) => ({ decision: req.body.decision }) }), processRefundDecision);

export default router;
