import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import User, { IUser, DEFAULT_STAFF_PERMISSIONS } from "../../models/User";
import Order from "../../models/Order";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { validateUserInput, normalizePhone } from "../../utils/validateUserInput";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryHelper";
import { sendStaffWelcomeEmail } from "../../utils/sendStaffWelcomeEmail";
import { sendPasswordChangedEmail } from "../../utils/sendPasswordChangedEmail";
import { validatePassword } from "../../utils/loginValidators";

/**
 * Get All Staff Members (paginated with search)
 */
export const getStaff = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const search = (req.query.search as string || "").trim();
        const skip = (page - 1) * limit;

        // Include all statuses — deleted users are shown with a countdown in the UI
        const filter: Record<string, unknown> = { role: "staff" };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [staff, total] = await Promise.all([
            User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            data: staff,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Add New Staff Member
 */
export const addStaff = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, dateOfBirth, gender, permissions } = req.body;

        const errors = validateUserInput({ name, email, phone, dateOfBirth });
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0].message });
        }

        const formattedPhone = normalizePhone(phone);

        const existing = await User.findOne({
            $or: [{ email: email.trim().toLowerCase() }, { phone: formattedPhone }],
        });

        if (existing) {
            return res.status(400).json({ message: "A user with this email or phone already exists." });
        }

        // Parse permissions if sent as JSON string (multipart), or use default
        let resolvedPermissions = DEFAULT_STAFF_PERMISSIONS;
        if (permissions) {
            try {
                resolvedPermissions = typeof permissions === "string"
                    ? JSON.parse(permissions)
                    : permissions;
            } catch {
                return res.status(400).json({ message: "Invalid permissions format." });
            }
        }

        // Generate a secure one-time setup token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newStaff = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: formattedPhone,
            password: crypto.randomBytes(32).toString("hex"), // unusable placeholder — never shared
            role: "staff",
            status: "active",
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender: gender || undefined,
            permissions: resolvedPermissions,
            isPasswordSet: false,
            passwordSetToken: hashedToken,
            passwordSetExpires: tokenExpiry,
        });

        const staffObj = newStaff.toObject() as Partial<IUser & { password?: string }>;
        delete staffObj.password;

        // Fire-and-forget welcome email with setup link
        sendStaffWelcomeEmail({ name: name.trim(), email: email.trim().toLowerCase(), rawToken });

        res.status(201).json(staffObj);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Update Staff Status
 */
export const updateStaffStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'active' or 'inactive'." });
        }

        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { status },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!staff) return res.status(404).json({ message: "Staff member not found." });

        res.status(200).json(staff);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Update Staff Details
 */
export const updateStaff = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, dateOfBirth, gender, password, permissions } = req.body;

        const errors = validateUserInput({ name, email, phone, dateOfBirth });
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0].message });
        }

        const updateData: Record<string, unknown> = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: normalizePhone(phone),
        };

        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (gender) updateData.gender = gender;

        // Handle password change
        if (password && typeof password === "string") {
            const passwordError = validatePassword(password);
            if (passwordError) return res.status(400).json({ message: passwordError });
            // Use save() for password so the pre-save hook hashes it
            const staffForPwd = await User.findOne({ _id: req.params.id, role: "staff" }).select("+password name email");
            if (staffForPwd) {
                staffForPwd.password = password;
                await staffForPwd.save();
                // Fire-and-forget security notification
                sendPasswordChangedEmail({ name: staffForPwd.name, email: staffForPwd.email });
            }
        }

        // Handle permissions update
        if (permissions) {
            try {
                updateData.permissions = typeof permissions === "string"
                    ? JSON.parse(permissions)
                    : permissions;
            } catch {
                return res.status(400).json({ message: "Invalid permissions format." });
            }
        }

        let oldProfilePicture: string | undefined;
        if (req.file) {
            const existing = await User.findOne({ _id: req.params.id, role: "staff" }).select("profilePicture");
            oldProfilePicture = existing?.profilePicture;
            updateData.profilePicture = req.file.path;
        }

        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            updateData,
            { new: true, runValidators: true }
        ).select("-__v");

        if (req.file && oldProfilePicture) {
            await deleteImageFromCloudinary(oldProfilePicture);
        }

        if (!staff) return res.status(404).json({ message: "Staff member not found." });

        res.status(200).json(staff);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Soft Delete Staff Member
 */
export const deleteStaff = async (req: Request, res: Response) => {
    try {
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { status: "deleted", deletedAt: new Date() },
            { new: true }
        );

        if (!staff) return res.status(404).json({ message: "Staff member not found." });

        res.status(200).json({ message: "Staff member deleted successfully." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Hard Delete Staff Member (permanent, irreversible)
 * Also cascades: deletes all products created by this staff + their Cloudinary images,
 * and removes those product IDs from all categories.
 */
export const hardDeleteStaff = async (req: Request, res: Response) => {
    try {
        const staffId = req.params.id;
        const staff = await User.findOneAndDelete({ _id: staffId, role: "staff" });
        if (!staff) return res.status(404).json({ message: "Staff member not found." });

        // Clean up profile picture
        if (staff.profilePicture) {
            await deleteImageFromCloudinary(staff.profilePicture).catch(() => {});
        }

        // Cascade: delete all products created by this staff
        const staffProducts = await Product.find({ createdBy: staffId }).select("_id images").lean();
        if (staffProducts.length > 0) {
            const staffProductIds = staffProducts.map((p) => p._id);

            // Delete product images from Cloudinary
            await Promise.allSettled(
                staffProducts.flatMap((p) =>
                    (p.images as string[]).map((img: string) => deleteImageFromCloudinary(img))
                )
            );

            // Remove products from categories
            await Category.updateMany(
                { products: { $in: staffProductIds } },
                { $pull: { products: { $in: staffProductIds } } }
            );

            // Delete the products
            await Product.deleteMany({ createdBy: staffId });
        }

        res.status(200).json({ message: "Staff member permanently deleted." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Revoke Staff Deletion (restore soft-deleted account)
 */
export const revokeStaffDeletion = async (req: Request, res: Response) => {
    try {
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff", status: "deleted" },
            { status: "active", deletedAt: null },
            { new: true }
        ).select("-__v");

        if (!staff) return res.status(404).json({ message: "Staff member not found or not in deleted state." });

        res.status(200).json(staff);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Get Staff Store Stats (superadmin view)
 * Returns store profile fields + aggregated revenue/orders/products for a staff member
 */
export const getStaffStoreStats = async (req: Request, res: Response) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, role: "staff" })
            .select("storeName storeDescription storeLocation storePhone name");
        if (!staff) return res.status(404).json({ message: "Staff member not found." });

        const staffObjId = new mongoose.Types.ObjectId(req.params.id);

        const staffProducts = await Product.find({ createdBy: staffObjId }).select("_id stock").lean();
        const staffProductIds = staffProducts.map((p) => p._id);
        const totalProducts = staffProducts.length;

        let totalRevenue = 0;
        let totalOrders = 0;
        let totalUnitsSold = 0;

        if (staffProductIds.length > 0) {
            const [revenueAgg, ordersCount, unitsSoldAgg] = await Promise.all([
                Order.aggregate([
                    { $match: { "items.product": { $in: staffProductIds }, status: { $nin: ["Cancelled", "Refunded"] } } },
                    { $unwind: "$items" },
                    { $match: { "items.product": { $in: staffProductIds } } },
                    { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
                ]),
                Order.countDocuments({ "items.product": { $in: staffProductIds } }),
                Order.aggregate([
                    { $match: { "items.product": { $in: staffProductIds }, status: { $nin: ["Cancelled", "Refunded"] } } },
                    { $unwind: "$items" },
                    { $match: { "items.product": { $in: staffProductIds } } },
                    { $group: { _id: null, total: { $sum: "$items.quantity" } } },
                ]),
            ]);
            totalRevenue = revenueAgg[0]?.total ?? 0;
            totalOrders = ordersCount;
            totalUnitsSold = unitsSoldAgg[0]?.total ?? 0;
        }

        res.status(200).json({
            storeName: staff.storeName || null,
            storeDescription: staff.storeDescription || null,
            storeLocation: staff.storeLocation || null,
            storePhone: staff.storePhone || null,
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUnitsSold,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};
