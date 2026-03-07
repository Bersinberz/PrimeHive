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
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name must not exceed 200 characters"],
    },

    description: {
      type: String,
      default: "",
      maxlength: [5000, "Description must not exceed 5000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      minlength: [2, "Category must be at least 2 characters"],
      maxlength: [100, "Category must not exceed 100 characters"],
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: [50, "SKU must not exceed 50 characters"],
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: "Maximum 5 images allowed per product",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);