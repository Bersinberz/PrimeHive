import express from "express";
import { getActiveOffers } from "../../controllers/admin/offerController";

const router = express.Router();

router.get("/active", getActiveOffers);

export default router;
