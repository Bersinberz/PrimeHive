import { Request, Response } from "express";
import Product from "../../models/Product";

/**
 * Create Product
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, comparePrice, category, sku, stock } =
            req.body;

        const files = req.files as Express.Multer.File[];

        // Cloudinary returns image URL in file.path
        const imageUrls = files?.map((file: any) => file.path) || [];

        const product = await Product.create({
            name,
            description,
            price,
            comparePrice,
            category,
            sku,
            stock,
            images: imageUrls,
        });

        res.status(201).json(product);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message
        });
    }
};

/**
 * Get All Products
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message
        });
    }
};

/**
 * Get Product By ID
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message
        });
    }
};

/**
 * Update Product
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, comparePrice, category, sku, stock } =
            req.body;

        const files = req.files as Express.Multer.File[];

        const imageUrls = files?.map((file: any) => file.path) || [];

        const updateData: any = {
            name,
            description,
            price,
            comparePrice,
            category,
            sku,
            stock,
        };

        // Only update images if new ones uploaded
        if (imageUrls.length > 0) {
            updateData.images = imageUrls;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message
        });
    }
};

/**
 * Delete Product
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message
        });
    }
};