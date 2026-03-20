    import { Request, Response } from "express";
import Settings from "../../models/Settings";
import User from "../../models/User";
import { validatePassword } from "../../utils/loginValidators";

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
