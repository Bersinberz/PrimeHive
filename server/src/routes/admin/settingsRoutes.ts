import express from "express";
import {
    getSettings,
    updateSettings,
    changeAdminPassword,
    updateProfile,
    getMyProfile,
    updateNotificationPreferences,
    getNotificationPreferences,
    deleteMyAccount,
    revokeAllSessions,
} from "../../controllers/admin/settingsController";
import { adminOnly, superAdminOnly, verifyToken } from "../../middleware/verifyToken";
import { uploadProfile, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

router.get("/get",                    verifyToken, superAdminOnly, getSettings);
router.put("/update",                 verifyToken, superAdminOnly, updateSettings);
router.put("/change-password",        verifyToken, adminOnly, changeAdminPassword);
router.get("/me",                     verifyToken, adminOnly, getMyProfile);
router.put("/profile",                verifyToken, adminOnly, uploadProfile.single("profilePicture"), handleUploadErrors, updateProfile);
router.get("/notifications",          verifyToken, adminOnly, getNotificationPreferences);
router.put("/notifications",          verifyToken, adminOnly, updateNotificationPreferences);
router.delete("/account",             verifyToken, adminOnly, deleteMyAccount);
router.post("/revoke-all-sessions",   verifyToken, adminOnly, revokeAllSessions);

export default router;
