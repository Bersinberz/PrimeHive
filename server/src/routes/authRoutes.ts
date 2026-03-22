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
import {
    getProfile,
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    deactivateAccount,
    sendVerification,
    verifyEmail,
} from "../controllers/profileController";
import { verifyToken } from "../middleware/verifyToken";
import { userOnly } from "../middleware/userOnly";
import { uploadProfile } from "../middleware/upload";

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

// Customer self-service profile (user role only)
router.get("/profile", verifyToken, userOnly, getProfile);
router.put("/profile", verifyToken, userOnly, uploadProfile.single("profilePicture"), updateProfile);
router.put("/change-password", verifyToken, userOnly, changePassword);
router.get("/addresses", verifyToken, userOnly, getAddresses);
router.post("/addresses", verifyToken, userOnly, addAddress);
router.put("/addresses/:id", verifyToken, userOnly, updateAddress);
router.delete("/addresses/:id", verifyToken, userOnly, deleteAddress);
router.delete("/account", verifyToken, userOnly, deactivateAccount);
router.post("/send-verification", verifyToken, userOnly, sendVerification);
router.get("/verify-email", verifyEmail);

export default router;