import express from "express";
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    updateStaff,
    deleteStaff,
    hardDeleteStaff,
    getStaffStoreStats,
    revokeStaffDeletion,
} from "../../controllers/admin/staffController";
import { superAdminOnly, verifyToken } from "../../middleware/verifyToken";
import { uploadProfile, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

// All staff management is superadmin-only
router.get("/get",                  verifyToken, superAdminOnly, getStaff);
router.get("/stats/:id",            verifyToken, superAdminOnly, getStaffStoreStats);
router.post("/add",                 verifyToken, superAdminOnly, addStaff);
router.put("/status/:id",           verifyToken, superAdminOnly, updateStaffStatus);
router.put("/revoke-deletion/:id",  verifyToken, superAdminOnly, revokeStaffDeletion);
router.delete("/delete/:id",        verifyToken, superAdminOnly, deleteStaff);
router.delete("/hard-delete/:id",   verifyToken, superAdminOnly, hardDeleteStaff);
router.put("/update/:id",           verifyToken, superAdminOnly, uploadProfile.single("profilePicture"), handleUploadErrors, updateStaff);

export default router;
