import { Request, Response } from "express";
import crypto from "crypto";
import User from "../../models/User";
import Order from "../../models/Order";
import { validateUserInput, normalizePhone } from "../../utils/validateUserInput";
import { sendStaffWelcomeEmail } from "../../utils/sendStaffWelcomeEmail";
import { asyncHandler } from "../../utils/asyncHandler";

export const getDeliveryPartners = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
  const search = (req.query.search as string || "").trim();
  const skip   = (page - 1) * limit;

  const filter: Record<string, unknown> = { role: "delivery_partner" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const addDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, vehicleType, vehicleNumber, dateOfBirth, gender } = req.body;

  const errors = validateUserInput({ name, email, phone });
  if (errors.length > 0) return res.status(400).json({ message: errors[0].message });

  const formattedPhone = normalizePhone(phone);
  const existing = await User.findOne({ $or: [{ email: email.trim().toLowerCase() }, { phone: formattedPhone }] });
  if (existing) return res.status(400).json({ message: "A user with this email or phone already exists." });

  const rawToken    = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: formattedPhone,
    password: crypto.randomBytes(32).toString("hex"),
    role: "delivery_partner",
    status: "active",
    vehicleType:   vehicleType?.trim()   || undefined,
    vehicleNumber: vehicleNumber?.trim() || undefined,
    dateOfBirth:   dateOfBirth ? new Date(dateOfBirth) : undefined,
    gender:        gender || undefined,
    isPasswordSet: false,
    passwordSetToken: hashedToken,
    passwordSetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  sendStaffWelcomeEmail({ name: user.name, email: user.email, rawToken });

  const obj = user.toObject() as any;
  delete obj.password;
  res.status(201).json(obj);
});

export const updateDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, vehicleType, vehicleNumber, status, dateOfBirth, gender, password } = req.body;
  const update: Record<string, unknown> = {};

  if (name)          update.name          = name.trim();
  if (email)         update.email         = email.trim().toLowerCase();
  if (phone)         update.phone         = normalizePhone(phone);
  if (vehicleType)   update.vehicleType   = vehicleType.trim();
  if (vehicleNumber) update.vehicleNumber = vehicleNumber.trim();
  if (dateOfBirth)   update.dateOfBirth   = new Date(dateOfBirth);
  if (gender)        update.gender        = gender;
  if (status && ["active", "inactive"].includes(status)) update.status = status;
  if ((req as any).file?.path) update.profilePicture = (req as any).file.path;

  // Handle password change
  if (password && typeof password === "string") {
    const user = await User.findOne({ _id: req.params.id, role: "delivery_partner" }).select("+password");
    if (user) { user.password = password; await user.save(); }
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "delivery_partner" },
    update,
    { returnDocument: "after", runValidators: true }
  ).select("-__v");

  if (!user) return res.status(404).json({ message: "Delivery partner not found." });
  res.status(200).json(user);
});

export const deleteDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "delivery_partner", status: { $ne: "deleted" } },
    { status: "deleted", deletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!user) return res.status(404).json({ message: "Delivery partner not found." });
  res.status(200).json({ message: "Delivery partner deleted.", user });
});

export const hardDeleteDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: "delivery_partner", status: "deleted" });
  if (!user) return res.status(404).json({ message: "Delivery partner not found or not in deleted state." });
  res.status(200).json({ message: "Delivery partner permanently deleted." });
});

/** POST /admin/orders/:id/assign-delivery — assign order to delivery partner */
export const assignDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryPartnerId } = req.body;
  if (!deliveryPartnerId) return res.status(400).json({ message: "deliveryPartnerId is required." });

  const partner = await User.findOne({ _id: deliveryPartnerId, role: "delivery_partner", status: "active" });
  if (!partner) return res.status(404).json({ message: "Delivery partner not found or inactive." });

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { deliveryPartnerId, deliveryStatus: "assigned", assignedAt: new Date() },
    { returnDocument: "after" }
  ).populate("customer", "name email phone").populate("deliveryPartnerId", "name phone");

  if (!order) return res.status(404).json({ message: "Order not found." });

  // Notify customer
  const customerEmail = (order.customer as any)?.email || order.guestEmail;
  const customerName  = (order.customer as any)?.name  || "Customer";
  if (customerEmail) {
    const { sendOrderStatusEmail } = await import("../../utils/sendOrderStatusEmail");
    sendOrderStatusEmail({
      to: customerEmail,
      customerName,
      orderId: order.orderId,
      newStatus: "Processing",
      note: `Your order has been assigned to a delivery partner: ${partner.name} (${partner.phone})`,
    }).catch(() => {});
  }

  res.status(200).json(order);
});
