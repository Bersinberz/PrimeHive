import { Request, Response, NextFunction } from "express";

interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validates product fields from req.body.
 * Used as Express middleware AFTER multer (so req.files is populated).
 *
 * @param mode - "create" requires images; "update" does not.
 */
export const validateProduct = (mode: "create" | "update") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: ValidationError[] = [];
        const { name, description, price, comparePrice, category, sku, stock } =
            req.body;

        // --- Name ---
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            errors.push({ field: "name", message: "Product name is required" });
        } else if (name.trim().length < 2) {
            errors.push({
                field: "name",
                message: "Product name must be at least 2 characters",
            });
        } else if (name.trim().length > 200) {
            errors.push({
                field: "name",
                message: "Product name must not exceed 200 characters",
            });
        }

        // --- Description ---
        if (description && typeof description === "string" && description.length > 5000) {
            errors.push({
                field: "description",
                message: "Description must not exceed 5000 characters",
            });
        }

        // --- Price ---
        const parsedPrice = parseFloat(price);
        if (price === undefined || price === null || price === "") {
            errors.push({ field: "price", message: "Price is required" });
        } else if (isNaN(parsedPrice) || parsedPrice < 0) {
            errors.push({
                field: "price",
                message: "Price must be a valid non-negative number",
            });
        } else if (parsedPrice > 10_000_000) {
            errors.push({
                field: "price",
                message: "Price must not exceed ₹1,00,00,000",
            });
        }

        // --- Compare Price ---
        if (comparePrice !== undefined && comparePrice !== null && comparePrice !== "") {
            const parsedCompare = parseFloat(comparePrice);
            if (isNaN(parsedCompare) || parsedCompare < 0) {
                errors.push({
                    field: "comparePrice",
                    message: "Compare price must be a valid non-negative number",
                });
            } else if (!isNaN(parsedPrice) && parsedCompare <= parsedPrice) {
                errors.push({
                    field: "comparePrice",
                    message: "Compare price must be greater than the selling price",
                });
            }
        }

        // --- Category ---
        if (!category || typeof category !== "string" || category.trim().length === 0) {
            errors.push({ field: "category", message: "Category is required" });
        } else if (category.trim().length < 2) {
            errors.push({
                field: "category",
                message: "Category must be at least 2 characters",
            });
        } else if (category.trim().length > 100) {
            errors.push({
                field: "category",
                message: "Category must not exceed 100 characters",
            });
        }

        // --- SKU ---
        if (sku && typeof sku === "string") {
            if (sku.length > 50) {
                errors.push({
                    field: "sku",
                    message: "SKU must not exceed 50 characters",
                });
            } else if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
                errors.push({
                    field: "sku",
                    message: "SKU must only contain letters, numbers, hyphens, and underscores",
                });
            }
        }

        // --- Stock ---
        const parsedStock = parseInt(stock);
        if (stock === undefined || stock === null || stock === "") {
            errors.push({ field: "stock", message: "Stock quantity is required" });
        } else if (isNaN(parsedStock) || parsedStock < 0) {
            errors.push({
                field: "stock",
                message: "Stock must be a valid non-negative integer",
            });
        } else if (parsedStock > 1_000_000) {
            errors.push({
                field: "stock",
                message: "Stock must not exceed 1,000,000",
            });
        }

        // --- Images ---
        const files = req.files as Express.Multer.File[] | undefined;
        if (mode === "create" && (!files || files.length === 0)) {
            errors.push({
                field: "images",
                message: "At least one product image is required",
            });
        }
        if (files && files.length > 5) {
            errors.push({
                field: "images",
                message: "Maximum 5 images allowed per product",
            });
        }

        // --- Return errors or proceed ---
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        next();
    };
};
