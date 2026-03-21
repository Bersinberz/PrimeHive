import express from "express";
import rateLimit from "express-rate-limit";
import {
    login,
    signup,
    refreshSession,
    logout,
    setPassword,
    resendSetupEmail,
} from "../controllers/authController";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Please try again after a minute." }
});

const setupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts. Please try again later." }
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.post("/set-password", setupLimiter, setPassword);
router.post("/resend-setup-email", setupLimiter, resendSetupEmail);

export default router;