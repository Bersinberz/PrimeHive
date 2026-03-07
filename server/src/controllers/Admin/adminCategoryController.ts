import { Request, Response } from "express";
import Category from "../../models/Category";
import Product from "../../models/Product";
import mongoose from "mongoose";

/**
 * Create Category
 */
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: [{ field: "name", message: "Category name is required" }],
            });
        }

        // Check for duplicate name
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });

        if (existing) {
            return res.status(400).json({
                message: "Validation failed",
                errors: [{ field: "name", message: "A category with this name already exists" }],
            });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || "",
        });

        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Get All Categories (with product count)
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .select("name description products createdAt");

        // Return categories with productCount
        const result = categories.map((cat) => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description,
            productCount: cat.products.length,
            createdAt: cat.createdAt,
        }));

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Delete Category
 */
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        // Block deletion if products are assigned
        if (category.products?.length > 0) {
            return res.status(400).json({
                message: `Cannot delete "${category.name}" because it has ${category.products.length} product(s) assigned. Please unassign all products first.`,
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Get Products Assigned to a Category
 */
export const getCategoryProducts = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id).populate(
            "products",
            "name sku images"
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        res.status(200).json(category.products);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Assign Products to a Category
 * Body: { productIds: string[] }
 */
export const assignProducts = async (req: Request, res: Response) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds)) {
            return res.status(400).json({
                message: "Validation failed",
                errors: [{ field: "productIds", message: "productIds must be an array" }],
            });
        }

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        // Get the current products before updating
        const previousProductIds = category.products.map((id: any) => id.toString());

        // Verify all product IDs exist
        const existingProducts = await Product.find({
            _id: { $in: productIds },
        }).select("_id");

        const validIds = existingProducts.map((p) => p._id);
        const validIdStrings = validIds.map((id: any) => id.toString());

        // Update the category's products array
        category.products = validIds;
        await category.save();

        // Sync: set category name on newly assigned products
        const newlyAssigned = validIdStrings.filter((id: string) => !previousProductIds.includes(id));
        if (newlyAssigned.length > 0) {
            await Product.updateMany(
                { _id: { $in: newlyAssigned } },
                { $set: { category: category.name } }
            );
        }

        // Sync: clear category on unassigned products
        const unassigned = previousProductIds.filter((id: string) => !validIdStrings.includes(id));
        if (unassigned.length > 0) {
            await Product.updateMany(
                { _id: { $in: unassigned }, category: category.name },
                { $set: { category: "" } }
            );
        }

        res.status(200).json({
            message: "Products assigned successfully",
            productCount: validIds.length,
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Update Category
 */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        // 1. Explicitly cast to string to satisfy TypeScript
        const categoryId = req.params.id as string; 

        // Validation
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: [{ field: "name", message: "Category name is required" }],
            });
        }

        // Check for duplicate name (excluding the current category)
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
            // 2. Convert the string to a Mongoose ObjectId
            _id: { $ne: new mongoose.Types.ObjectId(categoryId) } 
        });

        if (existing) {
            return res.status(400).json({
                message: "Validation failed",
                errors: [{ field: "name", message: "A category with this name already exists" }],
            });
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            {
                name: name.trim(),
                description: description?.trim() || "",
            },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};