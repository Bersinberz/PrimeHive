import express from "express";
import {
  getDeliveryPartners, addDeliveryPartner,
  updateDeliveryPartner, deleteDeliveryPartner, hardDeleteDeliveryPartner,
  assignDeliveryPartner,
} from "../../controllers/admin/deliveryPartnerController";
import { verifyToken, superAdminOnly, adminOnly, checkPermission } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

router.get("/",             verifyToken, adminOnly, checkPermission("delivery", "view"),   getDeliveryPartners);
router.post("/",            verifyToken, adminOnly, checkPermission("delivery", "create"), addDeliveryPartner);
router.put("/:id",          verifyToken, adminOnly, checkPermission("delivery", "edit"),   upload.single("profilePicture"), handleUploadErrors, updateDeliveryPartner);
router.delete("/hard/:id",  verifyToken, adminOnly, checkPermission("delivery", "delete"), hardDeleteDeliveryPartner);
router.delete("/:id",       verifyToken, adminOnly, checkPermission("delivery", "delete"), deleteDeliveryPartner);
router.post("/assign/:id",  verifyToken, adminOnly, assignDeliveryPartner);

export default router;
