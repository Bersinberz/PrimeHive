import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  rating: number;       // 1–5
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user:    { type: Schema.Types.ObjectId, ref: "User",    required: true },
    userName:{ type: String, required: true, trim: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   { type: String, required: true, trim: true, maxlength: 120 },
    body:    { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);
