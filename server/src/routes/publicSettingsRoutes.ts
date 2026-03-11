import express from "express";
import Settings from "../models/Settings";

const router = express.Router();

/**
 * GET /api/v1/settings/public
 * Returns public store info (store name) — no auth required.
 * Used by login page, signup page, sidebar, and home page.
 */
router.get("/public", async (req, res) => {
    try {
        let settings = await Settings.findOne().select("storeName");
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json({
            storeName: settings.storeName,
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
});

export default router;
