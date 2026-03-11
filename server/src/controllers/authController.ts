import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/createToken";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  validatePassword,
  validateDOB
} from "../utils/loginValidators";

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

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

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

    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password"
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Prevent banned/inactive users from refreshing tokens
    if (user.status !== "active") {
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

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api/v1/auth"
  });

  return res.status(200).json({ message: "Logged out successfully" });
};