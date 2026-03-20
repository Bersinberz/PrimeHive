import { Request, Response } from "express";
import User from "../../models/User";
import { validatePassword, isValidEmail, isValidName, isValidPhone, validateDOB } from "../../utils/loginValidators";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryHelper";

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
        const { name, email, phone, password, dateOfBirth, gender } = req.body;

        if (!name || !email || !phone || !password) {
            return res
                .status(400)
                .json({ message: "Name, email, phone, and password are required." });
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
        const formattedPhone = `+91${cleanPhone}`;

        if (dateOfBirth) {
            const dobError = validateDOB(dateOfBirth);
            if (dobError) return res.status(400).json({ message: dobError });
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
                { phone: formattedPhone },
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
            phone: formattedPhone,
            password,
            role: "staff",
            status: "active",
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender: gender || undefined,
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

        if (!["active", "inactive"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Status must be 'active' or 'inactive'." });
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
 * Update Staff Details
 */
export const updateStaff = async (req: Request, res: Response) => {
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
            updateData.dateOfBirth = new Date(dateOfBirth);
        }
        if (gender) updateData.gender = gender;

        let oldProfilePicture: string | undefined;
        if (req.file) {
            // Fetch old picture URL before overwriting
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
