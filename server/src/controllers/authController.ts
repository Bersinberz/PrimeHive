import { Request, Response } from "express";
import User from "../models/User";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Basic Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or phone"
      });
    }

    // Create user (NO HASHING)
    const newUser = await User.create({
      name,
      email,
      phone,
      password
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};