import { Request, Response } from "express";
import User from "../../models/User";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryHelper";
import { isValidEmail, isValidName, isValidPhone, validateDOB } from "../../utils/loginValidators";

/**
 * Get All Customers (users with role "user" — paginated with search)
 */
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const search = (req.query.search as string || "").trim();
        const skip = (page - 1) * limit;

        const filter: any = { role: "user", status: { $ne: "deleted" } };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [customers, total] = await Promise.all([
            User.find(filter)
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.status(200).json({
            data: customers,
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
 * Get Customer By ID
 */
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOne({
            _id: req.params.id,
            role: "user",
        }).select("-__v");

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json(customer);
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
 * Update Customer Status (active / inactive / banned)
 */
export const updateCustomerStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Status must be 'active' or 'inactive'." });
        }

        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user" },
            { status },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json(customer);
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
 * Update Customer Details
 */
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, dateOfBirth, gender } = req.body;
        const updateData: any = { name, email, phone };

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Name, email, and phone are required." });
        }
        if (!isValidName(name)) {
            return res.status(400).json({ message: "Name must be at least 3 characters and contain only letters." });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email address format." });
        }
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (!isValidPhone(cleanPhone)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
        }
        updateData.phone = `+91${cleanPhone}`;

        if (dateOfBirth) {
            const dobError = validateDOB(dateOfBirth);
            if (dobError) return res.status(400).json({ message: dobError });
            updateData.dateOfBirth = dateOfBirth;
        }
        if (gender) updateData.gender = gender;

        let oldProfilePicture: string | undefined;
        if (req.file) {
            // Fetch old picture URL before overwriting
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

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json(customer);
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
 * Soft Delete Customer
 */
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, role: "user" },
            { status: "deleted", deletedAt: new Date() },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json({ message: "Customer deleted successfully." });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};
