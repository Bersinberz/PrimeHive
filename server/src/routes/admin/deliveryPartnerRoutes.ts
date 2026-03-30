import express from "express";
import {
  getDeliveryPartners, addDeliveryPartner,
  updateDeliveryPartner, deleteDeliveryPartner, hardDeleteDeliveryPartner,
  assignDeliveryPartner,
} from "../../controllers/admin/deliveryPartnerController";
import { verifyToken, superAdminOnly, adminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/",             verifyToken, superAdminOnly, getDeliveryPartners);
router.post("/",            verifyToken, superAdminOnly, addDeliveryPartner);
router.put("/:id",          verifyToken, superAdminOnly, updateDeliveryPartner);
router.delete("/hard/:id",  verifyToken, superAdminOnly, hardDeleteDeliveryPartner);
router.delete("/:id",       verifyToken, superAdminOnly, deleteDeliveryPartner);
router.post("/assign/:id",  verifyToken, adminOnly, assignDeliveryPartner);

export default router;
