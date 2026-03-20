import express from "express";
import {
    createCategory,
    getCategories,
    deleteCategory,
    getCategoryProducts,
    assignProducts,
    updateCategory,
} from "../../controllers/admin/categoryController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

/**
 * Create Category
 */
router.post("/create", verifyToken, adminOnly, createCategory);

/**
 * Get All Categories
 */
router.get("/get", verifyToken, adminOnly, getCategories);

/**
 * Delete Category
 */
router.delete("/delete/:id", verifyToken, adminOnly, deleteCategory);

/**
 * Update Category
 */
router.put("/update/:id", verifyToken, adminOnly, updateCategory);
/**
 * Get Products assigned to a Category
 */
router.get("/:id/products", verifyToken, adminOnly, getCategoryProducts);

/**
 * Assign Products to a Category
 */
router.put("/:id/products", verifyToken, adminOnly, assignProducts);

export default router;