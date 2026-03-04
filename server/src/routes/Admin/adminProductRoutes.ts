import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/Admin/adminProductController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";
import { upload } from "../../middleware/upload";


const router = express.Router();

/**
 * Create Product
 */
router.post(
  "/create",
  verifyToken,
  adminOnly,
  upload.array("images", 5),
  createProduct
);

/**
 * Get All Products
 */
router.get(
  "/get",
  verifyToken,
  adminOnly,
  getProducts
);

/**
 * Get Product By ID
 */
router.get(
  "/get/:id",
  verifyToken,
  adminOnly,
  getProductById
);

/**
 * Update Product
 */
router.put(
  "/update/:id",
  verifyToken,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);

/**
 * Delete Product
 */
router.delete(
  "/delete/:id",
  verifyToken,
  adminOnly,
  deleteProduct
);

export default router;