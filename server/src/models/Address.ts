import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", addressSchema);
