import express from "express";
import {
    getCustomers,
    getCustomerById,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
    hardDeleteCustomer,
    revokeCustomerDeletion,
    getCustomerStats,
} from "../../controllers/admin/customerController";
import { adminOnly, superAdminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";
import { uploadProfile, handleUploadErrors } from "../../middleware/upload";

const router = express.Router();

router.get("/get",                  verifyToken, adminOnly,      checkPermission("customers", "view"),   getCustomers);
router.get("/get/:id",              verifyToken, adminOnly,      checkPermission("customers", "view"),   getCustomerById);
router.get("/stats/:id",            verifyToken, adminOnly,      checkPermission("customers", "view"),   getCustomerStats);
router.put("/status/:id",           verifyToken, adminOnly,      checkPermission("customers", "edit"),   updateCustomerStatus);
router.put("/revoke-deletion/:id",  verifyToken, superAdminOnly,                                         revokeCustomerDeletion);
router.delete("/delete/:id",        verifyToken, adminOnly,      checkPermission("customers", "delete"), deleteCustomer);
router.delete("/hard-delete/:id",   verifyToken, superAdminOnly,                                         hardDeleteCustomer);
router.put("/update/:id",           verifyToken, adminOnly,      checkPermission("customers", "edit"),   uploadProfile.single("profilePicture"), handleUploadErrors, updateCustomer);

export default router;
