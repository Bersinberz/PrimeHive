import express from "express";
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    deleteStaff,
} from "../../controllers/Admin/adminStaffController";
import { superAdminOnly, verifyToken } from "../../middleware/verifyToken";

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

export default router;
