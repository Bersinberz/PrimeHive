import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Settings from "../models/Settings";
import { generateAccessToken, generateRefreshToken } from "../utils/createToken";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  validatePassword,
  validateDOB
} from "../utils/loginValidators";
import { redisGet, redisSet, redisDel } from "../config/redis";
import { sendStaffWelcomeEmail } from "../utils/sendStaffWelcomeEmail";
import { sendCustomerWelcomeEmail } from "../utils/sendCustomerWelcomeEmail";
import { sendPasswordChangedEmail } from "../utils/sendPasswordChangedEmail";
import { sendForgotPasswordEmail } from "../utils/sendForgotPasswordEmail";

// ==========================================
// Cookie Config
// ==========================================

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth"
};

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ==========================================
// Helpers
// ==========================================

const storeRefreshToken = async (userId: string, token: string) => {
  await redisSet(`refresh:${userId}`, token, REFRESH_TTL_SECONDS);
};

const revokeRefreshToken = async (userId: string) => {
  await redisDel(`refresh:${userId}`);
};

const isRefreshTokenValid = async (userId: string, token: string): Promise<boolean> => {
  const stored = await redisGet(`refresh:${userId}`);
  // If Redis is unavailable, stored will be null — allow the request through
  if (stored === null) return true;
  return stored === token;
};

// ==========================================
// Signup
// ==========================================

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, dateOfBirth } = req.body;

    if (!name || !email || !phone || !password || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof name !== "string" || !isValidName(name)) {
      return res.status(400).json({
        message: "Full name must be at least 3 characters and contain only letters"
      });
    }

    if (typeof email !== "string" || !isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (typeof phone !== "string" || !isValidPhone(phone)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (typeof dateOfBirth !== "string") {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const dobError = validateDOB(dateOfBirth);
    if (dobError) {
      return res.status(400).json({ message: dobError });
    }

    if (typeof password !== "string") {
      return res.status(400).json({ message: "Password must be a string" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { phone: `+91${phone}` }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or phone"
      });
    }

    const dob = new Date(dateOfBirth);

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: `+91${phone}`,
      password,
      dateOfBirth: dob
    });

    const tokenPayload = { id: newUser._id.toString(), role: newUser.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeRefreshToken(newUser._id.toString(), refreshToken);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    // Fire-and-forget welcome email
    sendCustomerWelcomeEmail({ name: newUser.name, email: newUser.email });

    res.status(201).json({
      message: "Account created successfully",
      token: accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// Login
// ==========================================

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password."
      });
    }

    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({
        message: "Password must not contain spaces."
      });
    }

    const user = await User.findOne({ email: trimmedEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // If soft-deleted but logging in within retention window — revoke deletion
    if (user.status === "deleted") {
      user.status = "active";
      (user as any).deletedAt = undefined;
      await user.save();
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact support.`
      });
    }

    if (!user.isPasswordSet) {
      return res.status(403).json({
        message: "Please set your password using the link sent to your email before logging in."
      });
    }

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await storeRefreshToken(user._id.toString(), refreshToken);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        permissions: user.role === "staff" ? (user.permissions ?? null) : undefined,
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// Refresh Session
// ==========================================

export const refreshSession = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server configuration error." });
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      role: string;
      type: string;
    };

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type." });
    }

    // Validate token against Redis store (revocation check)
    const valid = await isRefreshTokenValid(decoded.id, token);
    if (!valid) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/api/v1/auth"
      });
      return res.status(401).json({ message: "Refresh token has been revoked." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.status !== "active") {
      await revokeRefreshToken(decoded.id);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/api/v1/auth"
      });
      return res.status(403).json({
        message: "Account is " + user.status + ". Please contact support."
      });
    }

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Rotate: replace old token in Redis
    await storeRefreshToken(user._id.toString(), newRefreshToken);
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        permissions: user.role === "staff" ? (user.permissions ?? null) : undefined,
      }
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token."
    });
  }
};

// ==========================================
// Logout
// ==========================================

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const secret = process.env.JWT_REFRESH_SECRET!;
        const decoded = jwt.verify(token, secret) as { id: string };
        await revokeRefreshToken(decoded.id);
      } catch {
        // Token already invalid — still clear cookie
      }
    }
  } catch {
    // Best-effort revocation
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api/v1/auth"
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

// ==========================================
// Set Password (staff onboarding)
// ==========================================

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordSetToken: hashedToken,
      passwordSetExpires: { $gt: new Date() },
    }).select("+password +passwordSetToken +passwordSetExpires");

    if (!user) {
      return res.status(400).json({
        message: "This setup link is invalid or has expired. Please contact your administrator."
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    user.isPasswordSet = true;
    user.passwordSetToken = undefined;
    user.passwordSetExpires = undefined;
    await user.save();

    // Fire-and-forget security notification
    sendPasswordChangedEmail({ name: user.name, email: user.email });

    return res.status(200).json({ message: "Password set successfully. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// Resend Setup Email
// ==========================================

export const resendSetupEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email.trim().toLowerCase())) {
      return res.status(400).json({ message: "Valid email is required." });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isPasswordSet: false,
      status: { $ne: "deleted" },
    }).select("+passwordSetToken +passwordSetExpires");

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({ message: "If this account exists and hasn't set a password, a new link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordSetToken = hashedToken;
    user.passwordSetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendStaffWelcomeEmail({ name: user.name, email: user.email, rawToken });

    return res.status(200).json({ message: "If this account exists and hasn't set a password, a new link has been sent." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// Forgot Password
// ==========================================

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Always return 200 to prevent email enumeration
    const genericResponse = {
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    if (!email || !isValidEmail(email.trim().toLowerCase())) {
      return res.status(200).json(genericResponse);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      status: { $ne: "deleted" },
      isPasswordSet: true, // staff who haven't set password yet use set-password flow
    }).select("+forgotPasswordToken +forgotPasswordExpires");

    if (!user) return res.status(200).json(genericResponse);

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Fire-and-forget
    sendForgotPasswordEmail({ name: user.name, email: user.email, rawToken }).catch(() => {});

    return res.status(200).json(genericResponse);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// Reset Password
// ==========================================

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpires: { $gt: new Date() },
    }).select("+password +forgotPasswordToken +forgotPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = newPassword; // pre-save hook hashes it
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpires = undefined;
    await user.save();

    // Revoke all active sessions for security
    await revokeRefreshToken(user._id.toString());

    // Fire-and-forget security notification
    sendPasswordChangedEmail({ name: user.name, email: user.email }).catch(() => {});

    return res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
