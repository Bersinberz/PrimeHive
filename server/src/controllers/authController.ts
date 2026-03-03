import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/createToken";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, dateOfBirth } = req.body;

    // Basic Validation
    if (!name || !email || !phone || !password || !dateOfBirth) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Name validation
    if (typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({
        message: "Full name must be at least 3 characters"
      });
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        message: "Name should contain only letters and spaces"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (typeof phone !== 'string' || !phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit phone number"
      });
    }

    // Date of Birth validation
    if (typeof dateOfBirth !== 'string') {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        message: "Invalid date of birth"
      });
    }

    if (dob > today) {
      return res.status(400).json({
        message: "Date of birth cannot be in the future"
      });
    }

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old to register"
      });
    }

    if (age > 100) {
      return res.status(400).json({
        message: "Please enter a valid date of birth"
      });
    }

    // Password validation
    if (typeof password !== 'string') {
      return res.status(400).json({
        message: "Password must be a string"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter"
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter"
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one number"
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character"
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

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: `+91${phone}`,
      password: password,
      dateOfBirth: dob
    });

    const token = generateToken({
      id: newUser._id.toString(),
      role: newUser.role
    });

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({
        message: "Please enter both email and password.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user || user.password !== trimmedPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};