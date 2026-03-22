import express from "express";
import { createOffer, getOffers, getOfferById, updateOffer, deleteOffer } from "../../controllers/admin/offerController";
import { verifyToken, superAdminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.use(verifyToken, superAdminOnly);

router.post("/", createOffer);
router.get("/", getOffers);
router.get("/:id", getOfferById);
router.put("/:id", updateOffer);
router.delete("/:id", deleteOffer);

export default router;
