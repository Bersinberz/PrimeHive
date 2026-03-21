import express from "express";
import { getProducts, getProductById, getCategories } from "../../controllers/storefront/productController";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
