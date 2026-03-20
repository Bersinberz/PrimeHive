import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "superadmin" | "staff" | "user";
  status: "active" | "inactive" | "deleted";
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  profilePicture?: string;
  addresses?: mongoose.Types.ObjectId[];
  deletedAt?: Date;
  dateOfBirth?: Date;
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
      enum: ["superadmin", "staff", "user"],
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
    }
  },
  { timestamps: true }
);

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