import express from "express";
import {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../controllers/storefront/cartController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken, userOnly);

router.get("/", getCart);
router.post("/sync", syncCart);
router.post("/items", addToCart);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
