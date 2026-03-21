import { Request, Response } from "express";
import User from "../../models/User";
import Order from "../../models/Order";
import mongoose from "mongoose";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryHelper";
import { validateUserInput, normalizePhone } from "../../utils/validateUserInput";

/**
 * Get All Customers (paginated with search)
 */
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const search = (req.query.search as string || "").trim();
        const skip = (page - 1) * limit;

        // Include all statuses — deleted users are shown with a countdown in the UI
        const filter: Record<string, unknown> = { role: "user" };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [customers, total] = await Promise.all([
            User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            data: customers,
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
 * Get Customer By ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOne({ _id: req.params.id, role: "user" }).select("-__v");
        if (!customer) return res.status(404).json({ message: "Customer not found." });
        res.status(200).json(customer);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Update Customer Status
 */
export const updateCustomerStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'active' or 'inactive'." });
        }
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user" },
            { status },
            { new: true, runValidators: true }
        ).select("-__v");
        if (!customer) return res.status(404).json({ message: "Customer not found." });
        res.status(200).json(customer);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Update Customer Details
 */
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, dateOfBirth, gender } = req.body;

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

        let oldProfilePicture: string | undefined;
        if (req.file) {
            const existing = await User.findOne({ _id: req.params.id, role: "user" }).select("profilePicture");
            oldProfilePicture = existing?.profilePicture;
            updateData.profilePicture = req.file.path;
        }

        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user" },
            updateData,
            { new: true, runValidators: true }
        ).select("-__v");

        if (req.file && oldProfilePicture) {
            await deleteImageFromCloudinary(oldProfilePicture);
        }

        if (!customer) return res.status(404).json({ message: "Customer not found." });

        res.status(200).json(customer);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Soft Delete Customer
 */
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user" },
            { status: "deleted", deletedAt: new Date() },
            { new: true }
        );
        if (!customer) return res.status(404).json({ message: "Customer not found." });
        res.status(200).json({ message: "Customer deleted successfully." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Hard Delete Customer (permanent, irreversible)
 */
export const hardDeleteCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOneAndDelete({ _id: req.params.id, role: "user" });
        if (!customer) return res.status(404).json({ message: "Customer not found." });

        if (customer.profilePicture) {
            await deleteImageFromCloudinary(customer.profilePicture).catch(() => {});
        }

        res.status(200).json({ message: "Customer permanently deleted." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};

/**
 * Revoke Customer Deletion (restore soft-deleted account)
 */
export const revokeCustomerDeletion = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user", status: "deleted" },
            { status: "active", deletedAt: null },
            { new: true }
        ).select("-__v");

        if (!customer) return res.status(404).json({ message: "Customer not found or not in deleted state." });

        res.status(200).json(customer);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};
export const getCustomerStats = async (req: Request, res: Response) => {
    try {
        const customerId = new mongoose.Types.ObjectId(req.params.id);

        const customer = await User.findOne({ _id: customerId, role: "user" }).select("_id");
        if (!customer) return res.status(404).json({ message: "Customer not found." });

        const [summary, lastOrder, categoryAgg] = await Promise.all([
            Order.aggregate([
                { $match: { customer: customerId } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSpent: {
                            $sum: {
                                $cond: [{ $in: ["$status", ["Cancelled", "Refunded"]] }, 0, "$totalAmount"],
                            },
                        },
                        cancelledOrders: {
                            $sum: { $cond: [{ $in: ["$status", ["Cancelled", "Refunded"]] }, 1, 0] },
                        },
                    },
                },
            ]),
            Order.findOne({ customer: customerId })
                .sort({ createdAt: -1 })
                .select("createdAt orderId status")
                .lean(),
            Order.aggregate([
                { $match: { customer: customerId, status: { $nin: ["Cancelled", "Refunded"] } } },
                { $unwind: "$items" },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.product",
                        foreignField: "_id",
                        as: "productDoc",
                    },
                },
                { $unwind: { path: "$productDoc", preserveNullAndEmpty: true } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDoc.category",
                        foreignField: "_id",
                        as: "categoryDoc",
                    },
                },
                { $unwind: { path: "$categoryDoc", preserveNullAndEmpty: true } },
                {
                    $group: {
                        _id: "$categoryDoc.name",
                        count: { $sum: "$items.quantity" },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 1 },
            ]),
        ]);

        const s = summary[0] ?? { totalOrders: 0, totalSpent: 0, cancelledOrders: 0 };
        const avgOrderValue = s.totalOrders > 0 ? s.totalSpent / (s.totalOrders - s.cancelledOrders || 1) : 0;

        res.status(200).json({
            totalOrders: s.totalOrders,
            totalSpent: s.totalSpent,
            avgOrderValue,
            cancelledOrders: s.cancelledOrders,
            lastOrderDate: lastOrder?.createdAt ?? null,
            lastOrderId: lastOrder?.orderId ?? null,
            lastOrderStatus: lastOrder?.status ?? null,
            topCategory: categoryAgg[0]?._id ?? null,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : msg,
        });
    }
};
