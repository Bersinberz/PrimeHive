import express from "express";
import {
  getMyDeliveries, getDeliveryOrderById, updateDeliveryStatus, uploadProofOfDelivery,
  sendDeliveryOtp, verifyDeliveryOtp, acceptOrder, rejectOrder,
  toggleOnlineStatus, getMyEarnings, getMyNotifications,
} from "../../controllers/delivery/deliveryController";
import { verifyToken, deliveryPartnerOnly } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

router.get("/orders",                    verifyToken, deliveryPartnerOnly, getMyDeliveries);
router.get("/orders/:id",                verifyToken, deliveryPartnerOnly, getDeliveryOrderById);
router.put("/orders/:id/status",         verifyToken, deliveryPartnerOnly, updateDeliveryStatus);
router.put("/orders/:id/accept",         verifyToken, deliveryPartnerOnly, acceptOrder);
router.put("/orders/:id/reject",         verifyToken, deliveryPartnerOnly, rejectOrder);
router.post("/orders/:id/otp/send",      verifyToken, deliveryPartnerOnly, sendDeliveryOtp);
router.post("/orders/:id/otp/verify",    verifyToken, deliveryPartnerOnly, verifyDeliveryOtp);
router.post("/orders/:id/proof",         verifyToken, deliveryPartnerOnly, upload.single("proof"), handleUploadErrors, uploadProofOfDelivery);
router.put("/status/online",             verifyToken, deliveryPartnerOnly, toggleOnlineStatus);
router.get("/earnings",                  verifyToken, deliveryPartnerOnly, getMyEarnings);
router.get("/notifications",             verifyToken, deliveryPartnerOnly, getMyNotifications);

export default router;
