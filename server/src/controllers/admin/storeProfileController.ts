import { Request, Response } from "express";
import User from "../../models/User";

/**
 * GET /admin/store-profile
 * Returns the logged-in staff member's store profile fields.
 */
export const getStoreProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id).select(
            "storeName storeDescription storeLocation storePhone"
        );
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg });
    }
};

/**
 * PUT /admin/store-profile
 * Updates the logged-in staff member's store profile.
 */
export const updateStoreProfile = async (req: Request, res: Response) => {
    try {
        const { storeName, storeDescription, storeLocation, storePhone } = req.body;

        if (!storeName || typeof storeName !== "string" || storeName.trim().length < 2) {
            return res.status(400).json({ message: "Store name must be at least 2 characters." });
        }

        const updateData: Record<string, string> = {
            storeName: storeName.trim(),
        };
        if (storeDescription !== undefined) updateData.storeDescription = String(storeDescription).trim();
        if (storeLocation   !== undefined) updateData.storeLocation   = String(storeLocation).trim();
        if (storePhone      !== undefined) updateData.storePhone      = String(storePhone).trim();

        const updated = await User.findByIdAndUpdate(
            req.user!.id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        ).select("storeName storeDescription storeLocation storePhone");

        if (!updated) return res.status(404).json({ message: "User not found." });

        res.status(200).json(updated);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg });
    }
};

