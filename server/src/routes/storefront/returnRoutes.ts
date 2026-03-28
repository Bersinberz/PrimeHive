import express from "express";
import { createReturn, getMyReturns } from "../../controllers/storefront/returnController";
import { verifyToken } from "../../middleware/verifyToken";
import { userOnly } from "../../middleware/userOnly";

const router = express.Router();

router.post("/",  verifyToken, userOnly, createReturn);
router.get("/my", verifyToken, userOnly, getMyReturns);

export default router;
