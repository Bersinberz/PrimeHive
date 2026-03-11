import express from "express";
import {
    getCustomers,
    getCustomerById,
    updateCustomerStatus,
    deleteCustomer,
} from "../../controllers/Admin/adminCustomerController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";

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

export default router;
