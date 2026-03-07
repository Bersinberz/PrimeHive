import express from "express";
import rateLimit from "express-rate-limit";
import {
    login,
    signup,
    refreshSession,
    logout
} from "../controllers/authController";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many login attempts. Please try again after a minute."
    }
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);

export default router;