import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdminStaffPermissions {
  staff:     { view: boolean };
  orders:    { view: boolean; updateStatus: boolean };
  customers: { view: boolean; edit: boolean };
  offers:    { view: boolean; create: boolean; edit: boolean; delete: boolean };
  reviews:   { view: boolean; moderate: boolean; delete: boolean };
  returns:   { view: boolean; process: boolean };
}

export const DEFAULT_ADMIN_STAFF_PERMISSIONS: IAdminStaffPermissions = {
  staff:     { view: false },
  orders:    { view: true, updateStatus: false },
  customers: { view: true, edit: false },
  offers:    { view: true, create: false, edit: false, delete: false },
  reviews:   { view: true, moderate: false, delete: false },
  returns:   { view: true, process: false },
};

export interface IPermissions {
  dashboard:  { view: boolean };
  products:   { view: boolean; create: boolean; edit: boolean; delete: boolean };
  categories: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  orders:     { view: boolean; updateStatus: boolean };
  customers:  { view: boolean; edit: boolean; delete: boolean };
  staff:      { view: boolean; create: boolean; edit: boolean; delete: boolean };
  settings:   { view: boolean; edit: boolean };
}

export const DEFAULT_STAFF_PERMISSIONS: IPermissions = {
  dashboard:  { view: true },
  products:   { view: true,  create: false, edit: false, delete: false },
  categories: { view: true,  create: false, edit: false, delete: false },
  orders:     { view: true,  updateStatus: false },
  customers:  { view: true,  edit: false, delete: false },
  staff:      { view: false, create: false, edit: false, delete: false },
  settings:   { view: false, edit: false },
};

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "superadmin" | "staff" | "admin_staff" | "delivery_partner" | "user";
  status: "active" | "inactive" | "deleted";
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  profilePicture?: string;
  addresses?: mongoose.Types.ObjectId[];
  deletedAt?: Date;
  dateOfBirth?: Date;
  permissions?: IPermissions;
  adminStaffPermissions?: IAdminStaffPermissions;
  isPasswordSet: boolean;
  passwordSetToken?: string;
  passwordSetExpires?: Date;
  forgotPasswordToken?: string;
  forgotPasswordExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // Staff store profile
  storeName?: string;
  storeDescription?: string;
  storeLocation?: string;
  storePhone?: string;
  // Delivery partner profile
  vehicleType?: string;
  vehicleNumber?: string;
  // Notification preferences
  notificationPreferences?: {
    orderPlaced: boolean;
    lowStock: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["superadmin", "staff", "admin_staff", "delivery_partner", "user"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active"
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"]
    },
    profilePicture: {
      type: String
    },
    addresses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address"
    }],
    deletedAt: { type: Date, default: null },
    dateOfBirth: {
      type: Date
    },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    adminStaffPermissions: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    isPasswordSet: {
      type: Boolean,
      default: true, // existing users (customers, superadmin) are always true
    },
    passwordSetToken: {
      type: String,
      select: false,
    },
    passwordSetExpires: {
      type: Date,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
      select: false,
    },
    forgotPasswordExpires: {
      type: Date,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    // Staff store profile
    storeName:        { type: String, trim: true, maxlength: 100 },
    storeDescription: { type: String, trim: true, maxlength: 500 },
    storeLocation:    { type: String, trim: true, maxlength: 200 },
    storePhone:       { type: String, trim: true, maxlength: 20 },
    // Delivery partner profile
    vehicleType:   { type: String, trim: true, maxlength: 50 },
    vehicleNumber: { type: String, trim: true, maxlength: 20 },
    // Notification preferences (staff)
    notificationPreferences: {
      orderPlaced: { type: Boolean, default: true },
      lowStock:    { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Indexes — email unique index is already created by `unique: true` on the field
// Only add compound/non-unique indexes here
userSchema.index({ status: 1, role: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);