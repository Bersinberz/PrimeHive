import express from "express";
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    updateStaff,
    deleteStaff,
} from "../../controllers/admin/staffController";
import { superAdminOnly, verifyToken } from "../../middleware/verifyToken";
import { uploadProfile, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

/**
 * Get All Staff
 */
router.get("/get", verifyToken, superAdminOnly, getStaff);

/**
 * Add New Staff
 */
router.post("/add", verifyToken, superAdminOnly, addStaff);

/**
 * Update Staff Status
 */
router.put("/status/:id", verifyToken, superAdminOnly, updateStaffStatus);

/**
 * Delete Staff
 */
router.delete("/delete/:id", verifyToken, superAdminOnly, deleteStaff);

/**
 * Update Staff Details
 */
router.put("/update/:id", verifyToken, superAdminOnly, uploadProfile.single("profilePicture"), handleUploadErrors, updateStaff);

export default router;
