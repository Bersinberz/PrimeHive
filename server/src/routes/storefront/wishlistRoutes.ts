import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../../controllers/storefront/wishlistController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";

const router = express.Router();

router.get("/",              verifyToken, userOnly, getWishlist);
router.post("/",             verifyToken, userOnly, addToWishlist);
router.delete("/:productId", verifyToken, userOnly, removeFromWishlist);
router.delete("/",           verifyToken, userOnly, clearWishlist);

export default router;
