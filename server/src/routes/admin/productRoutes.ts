import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/admin/productController";
import { adminOnly, verifyToken, checkPermission } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";
import { validateProduct } from "../../utils/productValidators";

const router = express.Router();

router.post("/create",   verifyToken, adminOnly, checkPermission("products", "create"), upload.array("images", 5), handleUploadErrors, validateProduct("create"), createProduct);
router.get("/get",       verifyToken, adminOnly, checkPermission("products", "view"),   getProducts);
router.get("/get/:id",   verifyToken, adminOnly, checkPermission("products", "view"),   getProductById);
router.put("/update/:id",verifyToken, adminOnly, checkPermission("products", "edit"),   upload.array("images", 5), handleUploadErrors, validateProduct("update"), updateProduct);
router.delete("/delete/:id", verifyToken, adminOnly, checkPermission("products", "delete"), deleteProduct);

export default router;
