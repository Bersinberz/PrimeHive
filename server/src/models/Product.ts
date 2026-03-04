import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  sku: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    comparePrice: {
      type: Number,
    },

    category: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);