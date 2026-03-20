import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/admin/productController";
import { adminOnly, verifyToken } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";
import { validateProduct } from "../../utils/productValidators";


const router = express.Router();

/**
 * Create Product
 */
router.post(
  "/create",
  verifyToken,
  adminOnly,
  upload.array("images", 5),
  handleUploadErrors,
  validateProduct("create"),
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
  handleUploadErrors,
  validateProduct("update"),
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