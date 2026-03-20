import { Request, Response } from "express";
import Product from "../../models/Product";
import Category from "../../models/Category";
import cloudinary from "../../config/cloudinary";

/**
 * Extract the Cloudinary public_id from a full image URL.
 * e.g. "https://res.cloudinary.com/.../upload/v123/primehive-products/1234-img.jpg"
 *   -> "primehive-products/1234-img"
 */
const extractPublicId = (url: string): string | null => {
    try {
        const parts = url.split("/upload/");
        if (parts.length < 2) return null;
        // Remove the version prefix (v123456/) and file extension
        const afterUpload = parts[1].replace(/^v\d+\//, "");
        return afterUpload.replace(/\.[^.]+$/, "");
    } catch {
        return null;
    }
};

/**
 * Delete an array of images from Cloudinary (best-effort, non-blocking).
 */
const deleteCloudinaryImages = async (imageUrls: string[]) => {
    const deletions = imageUrls.map((url) => {
        const publicId = extractPublicId(url);
        if (publicId) return cloudinary.uploader.destroy(publicId);
        return Promise.resolve();
    });
    await Promise.allSettled(deletions);
};

/**
 * Create Product
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, comparePrice, category, sku, stock, status } =
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
            status: status || "active",
            images: imageUrls,
        });

        // Sync: add product to the Category's products array
        if (category) {
            await Category.findOneAndUpdate(
                { name: category },
                { $addToSet: { products: product._id } }
            );
        }

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
 * Get All Products (with pagination and search)
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = parseInt(req.query.limit as string) || 1000;
        const search = (req.query.search as string || "").trim();
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
            ];
        }

        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
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
        const { name, description, price, comparePrice, category, sku, stock, status } =
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
            status,
        };

        // Fetch the existing product to check for category/image changes
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Only update images if new ones uploaded
        if (imageUrls.length > 0) {
            if (existingProduct.images?.length) {
                await deleteCloudinaryImages(existingProduct.images);
            }
            updateData.images = imageUrls;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Sync: if category changed, update both Category documents
        const oldCategory = existingProduct.category;
        if (oldCategory !== category) {
            // Remove from old category
            if (oldCategory) {
                await Category.findOneAndUpdate(
                    { name: oldCategory },
                    { $pull: { products: existingProduct._id } }
                );
            }
            // Add to new category
            if (category) {
                await Category.findOneAndUpdate(
                    { name: category },
                    { $addToSet: { products: existingProduct._id } }
                );
            }
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

        if (product.images?.length) {
            await deleteCloudinaryImages(product.images);
        }

        // Sync: remove product from its category's products array
        if (product.category) {
            await Category.findOneAndUpdate(
                { name: product.category },
                { $pull: { products: product._id } }
            );
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