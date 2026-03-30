import express from "express";
import { getAdminStaff, addAdminStaff, updateAdminStaff, deleteAdminStaff, hardDeleteAdminStaff } from "../../controllers/admin/adminStaffController";
import { superAdminOnly, verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/",              verifyToken, superAdminOnly, getAdminStaff);
router.post("/",             verifyToken, superAdminOnly, addAdminStaff);
router.put("/:id",           verifyToken, superAdminOnly, updateAdminStaff);
router.delete("/:id",        verifyToken, superAdminOnly, deleteAdminStaff);
router.delete("/hard/:id",   verifyToken, superAdminOnly, hardDeleteAdminStaff);

export default router;
