import express from "express";
import {
    createCategory,
    getCategories,
    deleteCategory,
    getCategoryProducts,
    assignProducts,
    updateCategory,
} from "../../controllers/admin/categoryController";
import { adminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";

const router = express.Router();

router.post("/create",        verifyToken, adminOnly, checkPermission("categories", "create"), createCategory);
router.get("/get",            verifyToken, adminOnly, checkPermission("categories", "view"),   getCategories);
router.delete("/delete/:id",  verifyToken, adminOnly, checkPermission("categories", "delete"), deleteCategory);
router.put("/update/:id",     verifyToken, adminOnly, checkPermission("categories", "edit"),   updateCategory);
router.get("/:id/products",   verifyToken, adminOnly, checkPermission("categories", "view"),   getCategoryProducts);
router.put("/:id/products",   verifyToken, adminOnly, checkPermission("categories", "edit"),   assignProducts);

export default router;
