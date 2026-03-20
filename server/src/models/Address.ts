import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", addressSchema);