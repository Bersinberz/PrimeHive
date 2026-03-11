import { Request, Response } from "express";
import User from "../../models/User";
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

        const filter: any = { role: "staff", status: { $ne: "deleted" } };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [staff, total] = await Promise.all([
            User.find(filter)
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            data: staff,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
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
 * Add New Staff Member
 */
export const addStaff = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res
                .status(400)
                .json({ message: "Name, email, phone, and password are required." });
        }

        if (typeof name !== "string" || name.trim().length < 2) {
            return res
                .status(400)
                .json({ message: "Name must be at least 2 characters." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        if (typeof password !== "string") {
            return res
                .status(400)
                .json({ message: "Password must be a string." });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        // Check for duplicates
        const existing = await User.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { phone: phone.trim() },
            ],
        });

        if (existing) {
            return res
                .status(400)
                .json({ message: "A user with this email or phone already exists." });
        }

        const newStaff = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            role: "staff",
            status: "active",
        });

        // Return without password
        const staffObj = newStaff.toObject();
        delete (staffObj as any).password;

        res.status(201).json(staffObj);
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
 * Update Staff Status (active / inactive / banned)
 */
export const updateStaffStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!["active", "inactive", "banned"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Status must be 'active', 'inactive', or 'banned'." });
        }

        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { status },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found." });
        }

        res.status(200).json(staff);
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
 * Soft Delete Staff Member
 */
export const deleteStaff = async (req: Request, res: Response) => {
    try {
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: "staff" },
            { status: "deleted", deletedAt: new Date() },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found." });
        }

        res.status(200).json({ message: "Staff member deleted successfully." });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};
