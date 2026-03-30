import { Request, Response } from "express";
import crypto from "crypto";
import User, { DEFAULT_ADMIN_STAFF_PERMISSIONS } from "../../models/User";
import { validateUserInput, normalizePhone } from "../../utils/validateUserInput";
import { sendStaffWelcomeEmail } from "../../utils/sendStaffWelcomeEmail";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAdminStaff = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
  const search = (req.query.search as string || "").trim();
  const skip   = (page - 1) * limit;

  const filter: Record<string, unknown> = { role: "admin_staff" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const addAdminStaff = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, adminStaffPermissions } = req.body;

  const errors = validateUserInput({ name, email, phone });
  if (errors.length > 0) return res.status(400).json({ message: errors[0].message });

  const formattedPhone = normalizePhone(phone);
  const existing = await User.findOne({ $or: [{ email: email.trim().toLowerCase() }, { phone: formattedPhone }] });
  if (existing) return res.status(400).json({ message: "A user with this email or phone already exists." });

  let resolvedPermissions = DEFAULT_ADMIN_STAFF_PERMISSIONS;
  if (adminStaffPermissions) {
    try {
      resolvedPermissions = typeof adminStaffPermissions === "string"
        ? JSON.parse(adminStaffPermissions)
        : adminStaffPermissions;
    } catch {
      return res.status(400).json({ message: "Invalid permissions format." });
    }
  }

  const rawToken   = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: formattedPhone,
    password: crypto.randomBytes(32).toString("hex"),
    role: "admin_staff",
    status: "active",
    adminStaffPermissions: resolvedPermissions,
    isPasswordSet: false,
    passwordSetToken: hashedToken,
    passwordSetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  sendStaffWelcomeEmail({ name: user.name, email: user.email, rawToken });

  const obj = user.toObject() as any;
  delete obj.password;
  res.status(201).json(obj);
});

export const updateAdminStaff = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, adminStaffPermissions, status } = req.body;
  const update: Record<string, unknown> = {};

  if (name)   update.name   = name.trim();
  if (email)  update.email  = email.trim().toLowerCase();
  if (phone)  update.phone  = normalizePhone(phone);
  if (status && ["active", "inactive"].includes(status)) update.status = status;

  if (adminStaffPermissions) {
    try {
      update.adminStaffPermissions = typeof adminStaffPermissions === "string"
        ? JSON.parse(adminStaffPermissions)
        : adminStaffPermissions;
    } catch {
      return res.status(400).json({ message: "Invalid permissions format." });
    }
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "admin_staff" },
    update,
    { returnDocument: "after", runValidators: true }
  ).select("-__v");

  if (!user) return res.status(404).json({ message: "Admin staff member not found." });
  res.status(200).json(user);
});

export const deleteAdminStaff = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "admin_staff", status: { $ne: "deleted" } },
    { status: "deleted", deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!user) return res.status(404).json({ message: "Admin staff member not found." });
  res.status(200).json({ message: "Admin staff member deleted.", user });
});

export const hardDeleteAdminStaff = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: "admin_staff", status: "deleted" });
  if (!user) return res.status(404).json({ message: "Admin staff member not found or not in deleted state." });
  res.status(200).json({ message: "Admin staff member permanently deleted." });
});
