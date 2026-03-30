import express from "express";
import { getMyDeliveries, getDeliveryOrderById, updateDeliveryStatus, uploadProofOfDelivery } from "../../controllers/delivery/deliveryController";
import { verifyToken, deliveryPartnerOnly } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

router.get("/orders",              verifyToken, deliveryPartnerOnly, getMyDeliveries);
router.get("/orders/:id",          verifyToken, deliveryPartnerOnly, getDeliveryOrderById);
router.put("/orders/:id/status",   verifyToken, deliveryPartnerOnly, updateDeliveryStatus);
router.post("/orders/:id/proof",   verifyToken, deliveryPartnerOnly, upload.single("proof"), handleUploadErrors, uploadProofOfDelivery);

export default router;
