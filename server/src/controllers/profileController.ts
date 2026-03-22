import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import Address from "../models/Address";
import { isValidEmail, isValidName, isValidPhone, validatePassword } from "../utils/loginValidators";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";

// ==========================================
// GET /api/v1/auth/profile
// ==========================================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select(
      "name email phone gender dateOfBirth profilePicture addresses emailVerified"
    ).populate("addresses");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      addresses: user.addresses,
      emailVerified: user.emailVerified,
    });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// PUT /api/v1/auth/profile
// ==========================================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, gender, dateOfBirth, email } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !isValidName(name))
        return res.status(400).json({ message: "Name must be at least 3 characters and contain only letters" });
    }

    if (phone !== undefined) {
      const raw = typeof phone === "string" ? phone.replace(/\D/g, "").slice(-10) : "";
      if (!isValidPhone(raw))
        return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !isValidEmail(email.trim().toLowerCase()))
        return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) {
      const raw = phone.replace(/\D/g, "").slice(-10);
      const formatted = `+91${raw}`;
      const existing = await User.findOne({ phone: formatted, _id: { $ne: user._id } });
      if (existing) return res.status(400).json({ message: "Phone number already in use" });
      user.phone = formatted;
    }
    if (email !== undefined) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
        if (existing) return res.status(400).json({ message: "Email already in use" });
        user.email = newEmail;
        user.emailVerified = false; // reset verification on email change
      }
    }
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth);

    if (req.file) {
      user.profilePicture = (req.file as any).path;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
      },
    });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// PUT /api/v1/auth/change-password
// ==========================================
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current and new password are required" });

    const user = await User.findById(req.user!.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const err = validatePassword(newPassword);
    if (err) return res.status(400).json({ message: err });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// GET /api/v1/auth/addresses
// ==========================================
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// POST /api/v1/auth/addresses
// ==========================================
export const addAddress = async (req: Request, res: Response) => {
  try {
    const { line1, line2, city, state, zip, country } = req.body;

    if (!line1 || !city || !state || !zip)
      return res.status(400).json({ message: "line1, city, state, and zip are required" });

    const address = await Address.create({
      userId: req.user!.id,
      line1: line1.trim(),
      line2: line2?.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country?.trim() || "India",
    });

    // Link to user
    await User.findByIdAndUpdate(req.user!.id, { $addToSet: { addresses: address._id } });

    res.status(201).json(address);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// PUT /api/v1/auth/addresses/:id
// ==========================================
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!address) return res.status(404).json({ message: "Address not found" });

    const { line1, line2, city, state, zip, country } = req.body;
    if (line1) address.line1 = line1.trim();
    if (line2 !== undefined) address.line2 = line2?.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (zip) address.zip = zip.trim();
    if (country) address.country = country.trim();

    await address.save();
    res.json(address);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// DELETE /api/v1/auth/addresses/:id
// ==========================================
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!address) return res.status(404).json({ message: "Address not found" });

    await User.findByIdAndUpdate(req.user!.id, { $pull: { addresses: address._id } });

    res.json({ message: "Address deleted" });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// DELETE /api/v1/auth/account — soft-delete (deactivate)
// ==========================================
export const deactivateAccount = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required to deactivate your account" });

    const user = await User.findById(req.user!.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    user.status = "deleted";
    (user as any).deletedAt = new Date();
    await user.save();

    res.json({ message: "Account deactivated. You can recover it by logging in within 30 days." });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// POST /api/v1/auth/send-verification
// ==========================================
export const sendVerification = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Rate-limit: block if a token was issued less than 2 minutes ago
    // A fresh token has 24h TTL, so "less than 2 min ago" = more than (24h - 2min) remaining
    const TWO_MIN_MS = 2 * 60 * 1000;
    const FULL_TTL_MS = 24 * 60 * 60 * 1000;
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires.getTime() - Date.now() > FULL_TTL_MS - TWO_MIN_MS
    ) {
      return res.status(429).json({ message: "Please wait a moment before requesting another verification email" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail({ name: user.name, email: user.email, token: rawToken });

    return res.status(200).json({ message: "Verification email sent" });
  } catch {
    return res.status(500).json({ message: "Failed to send verification email" });
  }
};

// ==========================================
// GET /api/v1/auth/verify-email?token=...
// ==========================================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
