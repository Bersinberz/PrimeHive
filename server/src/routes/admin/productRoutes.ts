import express from "express";
import {
  createProduct, getProducts, getProductById,
  updateProduct, deleteProduct, exportProducts, importProducts,
} from "../../controllers/admin/productController";
import { adminOnly, verifyToken, checkPermission, superAdminOnly } from "../../middleware/verifyToken";
import { upload, handleUploadErrors } from "../../middleware/upload";
import { validateProduct } from "../../utils/productValidators";
import { audit } from "../../middleware/auditLog";

const router = express.Router();

router.post("/create",    verifyToken, adminOnly, checkPermission("products", "create"), upload.array("images", 5), handleUploadErrors, validateProduct("create"), audit({ action: "product.create", target: "Product" }), createProduct);
router.get("/get",        verifyToken, adminOnly, checkPermission("products", "view"),   getProducts);
router.get("/export",     verifyToken, adminOnly, superAdminOnly,                        exportProducts);
router.post("/import",    verifyToken, adminOnly, superAdminOnly,                        importProducts);
router.get("/get/:id",    verifyToken, adminOnly, checkPermission("products", "view"),   getProductById);
router.put("/update/:id", verifyToken, adminOnly, checkPermission("products", "edit"),   upload.array("images", 5), handleUploadErrors, validateProduct("update"), audit({ action: "product.update", target: "Product" }), updateProduct);
router.delete("/delete/:id", verifyToken, adminOnly, checkPermission("products", "delete"), audit({ action: "product.delete", target: "Product" }), deleteProduct);

export default router;
