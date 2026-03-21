import express from "express";
import { getStoreProfile, updateStoreProfile } from "../../controllers/admin/storeProfileController";
import { verifyToken, adminOnly } from "../../middleware/verifyToken";

const router = express.Router();

// Staff (and superadmin) can manage their own store profile
router.get("/",  verifyToken, adminOnly, getStoreProfile);
router.put("/",  verifyToken, adminOnly, updateStoreProfile);

export default router;
