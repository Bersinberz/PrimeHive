import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  label: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  productIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    label: { type: String, required: true, trim: true, maxlength: 100 },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

OfferSchema.index({ isActive: 1 });
OfferSchema.index({ productIds: 1 });

export default mongoose.model<IOffer>("Offer", OfferSchema);
