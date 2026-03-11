import express from "express";
import {
    getSettings,
    updateSettings,
    changeAdminPassword,
} from "../../controllers/Admin/adminSettingsController";
import { superAdminOnly, verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

/**
 * Get Settings
 */
router.get("/get", verifyToken, superAdminOnly, getSettings);

/**
 * Update Settings
 */
router.put("/update", verifyToken, superAdminOnly, updateSettings);

/**
 * Change Admin Password
 */
router.put("/change-password", verifyToken, superAdminOnly, changeAdminPassword);

export default router;
