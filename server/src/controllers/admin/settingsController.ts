import { Request, Response } from "express";
import Settings from "../../models/Settings";
import User from "../../models/User";
import { validatePassword } from "../../utils/loginValidators";
import { redisDel } from "../../config/redis";
import { sendPasswordChangedEmail } from "../../utils/sendPasswordChangedEmail";

/**
 * Get Settings (singleton — creates defaults if none exist)
 */
export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Update Settings (partial update with upsert)
 */
export const updateSettings = async (req: Request, res: Response) => {
    try {
        const allowedFields = [
            "storeName",
            "supportEmail",
            "supportPhone",
            "storeLocation",
            "currency",
            "timezone",
            "orderIdPrefix",
            "standardShippingRate",
            "freeShippingThreshold",
            "taxRate",
            "taxInclusive",
        ];

        // Whitelist: only pick allowed fields from the body
        const updateData: Record<string, any> = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Basic validation
        const errors: { field: string; message: string }[] = [];

        if (updateData.storeName !== undefined && typeof updateData.storeName === "string") {
            updateData.storeName = updateData.storeName.trim();
            if (updateData.storeName.length < 2) {
                errors.push({ field: "storeName", message: "Store name must be at least 2 characters." });
            }
        }

        if (updateData.supportEmail !== undefined && typeof updateData.supportEmail === "string") {
            updateData.supportEmail = updateData.supportEmail.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.supportEmail)) {
                errors.push({ field: "supportEmail", message: "Invalid email address." });
            }
        }

        if (updateData.supportPhone !== undefined && typeof updateData.supportPhone === "string") {
            updateData.supportPhone = updateData.supportPhone.trim();
        }

        if (updateData.storeLocation !== undefined && typeof updateData.storeLocation === "string") {
            updateData.storeLocation = updateData.storeLocation.trim();
        }

        if (updateData.taxRate !== undefined) {
            const rate = Number(updateData.taxRate);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                errors.push({ field: "taxRate", message: "Tax rate must be between 0 and 100." });
            }
        }

        if (updateData.standardShippingRate !== undefined) {
            const rate = Number(updateData.standardShippingRate);
            if (isNaN(rate) || rate < 0) {
                errors.push({ field: "standardShippingRate", message: "Shipping rate must be ≥ 0." });
            }
        }

        if (updateData.freeShippingThreshold !== undefined) {
            const threshold = Number(updateData.freeShippingThreshold);
            if (isNaN(threshold) || threshold < 0) {
                errors.push({ field: "freeShippingThreshold", message: "Threshold must be ≥ 0." });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        const settings = await Settings.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Change Admin Password
 */
export const changeAdminPassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new passwords are required." });
        }

        if (typeof newPassword !== "string") {
            return res.status(400).json({ message: "New password must be a string." });
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        // req.user is set by verifyToken middleware
        const user = await User.findById(req.user?.id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // Set plain password — the User model pre-save hook will hash it
        user.password = newPassword;
        await user.save();

        // Fire-and-forget security notification
        sendPasswordChangedEmail({ name: user.name, email: user.email });

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Get own full profile (name, email, phone, dateOfBirth, gender, profilePicture)
 */
export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id)
            .select("name email phone dateOfBirth gender profilePicture role");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
    }
};

/**
 * Update own profile (name, email, phone, dateOfBirth, gender, profilePicture) — superadmin & staff
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, dateOfBirth, gender } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: "Not authorized." });

        const updateData: Record<string, unknown> = {};

        if (name) {
            const trimmed = String(name).trim();
            if (trimmed.length < 3 || !/^[A-Za-z\s]+$/.test(trimmed)) {
                return res.status(400).json({ message: "Name must be at least 3 characters and contain only letters." });
            }
            updateData.name = trimmed;
        }

        if (email) {
            const trimmed = String(email).trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                return res.status(400).json({ message: "Please enter a valid email address." });
            }
            updateData.email = trimmed;
        }

        if (phone) {
            const digits = String(phone).replace(/\D/g, "").slice(-10);
            if (!/^[0-9]{10}$/.test(digits)) {
                return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
            }
            updateData.phone = `+91${digits}`;
        }

        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (gender) updateData.gender = gender;

        if (req.file) {
            const existing = await User.findById(userId).select("profilePicture");
            if (existing?.profilePicture) {
                const { deleteImageFromCloudinary } = await import("../../utils/cloudinaryHelper");
                await deleteImageFromCloudinary(existing.profilePicture);
            }
            updateData.profilePicture = req.file.path;
        }

        const updated = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select("-password -__v");
        if (!updated) return res.status(404).json({ message: "User not found." });

        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
        });
    }
};

/**
 * Update notification preferences (staff only)
 */
export const updateNotificationPreferences = async (req: Request, res: Response) => {
    try {
        const { orderPlaced, lowStock } = req.body;
        const update: Record<string, boolean> = {};
        if (typeof orderPlaced === "boolean") update["notificationPreferences.orderPlaced"] = orderPlaced;
        if (typeof lowStock === "boolean")    update["notificationPreferences.lowStock"]    = lowStock;

        const updated = await User.findByIdAndUpdate(
            req.user!.id,
            { $set: update },
            { new: true }
        ).select("notificationPreferences");

        if (!updated) return res.status(404).json({ message: "User not found." });
        res.status(200).json(updated.notificationPreferences);
    } catch (error: any) {
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
    }
};

/**
 * Get own notification preferences
 */
export const getNotificationPreferences = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id).select("notificationPreferences");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user.notificationPreferences ?? { orderPlaced: true, lowStock: true });
    } catch (error: any) {
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
    }
};

/**
 * Delete own account (staff self-initiated soft delete)
 * Requires password confirmation
 */
export const deleteMyAccount = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "Password is required to confirm deletion." });

        const user = await User.findById(req.user!.id).select("+password");
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

        // Soft delete
        user.status = "deleted";
        user.deletedAt = new Date();
        await user.save();

        // Revoke refresh token so they're logged out
        await redisDel(`refresh:${req.user!.id}`);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(200).json({ message: "Account scheduled for deletion." });
    } catch (error: any) {
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
    }
};

/**
 * Revoke all sessions (logout all devices)
 */
export const revokeAllSessions = async (req: Request, res: Response) => {
    try {
        await redisDel(`refresh:${req.user!.id}`);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.status(200).json({ message: "All sessions revoked." });
    } catch (error: any) {
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
    }
};
