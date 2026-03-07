import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description: string;
    products: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            minlength: [2, "Category name must be at least 2 characters"],
            maxlength: [100, "Category name must not exceed 100 characters"],
        },

        description: {
            type: String,
            default: "",
            maxlength: [500, "Description must not exceed 500 characters"],
        },

        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
