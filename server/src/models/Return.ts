import mongoose, { Schema, Document } from "mongoose";

export type ReturnStatus = "requested" | "approved" | "rejected" | "completed";

export interface IReturnItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  items: IReturnItem[];
  reason: string;
  status: ReturnStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    order:     { type: Schema.Types.ObjectId, ref: "Order",   required: true },
    customer:  { type: Schema.Types.ObjectId, ref: "User",    required: true },
    items:     { type: [ReturnItemSchema], required: true },
    reason:    { type: String, required: true, trim: true, maxlength: 1000 },
    status:    { type: String, enum: ["requested","approved","rejected","completed"], default: "requested" },
    adminNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

ReturnSchema.index({ customer: 1, createdAt: -1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ order: 1 });

export default mongoose.model<IReturn>("Return", ReturnSchema);
