import express from "express";
import {
    getCustomers,
    getCustomerById,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
} from "../../controllers/admin/customerController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";
import { uploadProfile, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

/**
 * Get All Customers
 */
router.get("/get", verifyToken, adminOnly, getCustomers);

/**
 * Get Customer By ID
 */
router.get("/get/:id", verifyToken, adminOnly, getCustomerById);

/**
 * Update Customer Status
 */
router.put("/status/:id", verifyToken, adminOnly, updateCustomerStatus);

/**
 * Delete Customer
 */
router.delete("/delete/:id", verifyToken, adminOnly, deleteCustomer);

/**
 * Update Customer Details
 */
router.put("/update/:id", verifyToken, adminOnly, uploadProfile.single("profilePicture"), handleUploadErrors, updateCustomer);

export default router;
