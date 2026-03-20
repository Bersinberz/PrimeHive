import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import { Request, Response, NextFunction } from "express";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
        return {
            folder: "primehive-products",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
        return {
            folder: "Profile Picture",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

export const uploadProfile = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

/**
 * Middleware to handle Multer/Cloudinary upload errors gracefully.
 * Place AFTER upload.array() in the route chain.
 */
export const handleUploadErrors = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors (file size, count, etc.)
        const messages: Record<string, string> = {
            LIMIT_FILE_SIZE: "File is too large. Maximum size is 5MB.",
            LIMIT_FILE_COUNT: "Too many files. Maximum is 5 images.",
            LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
        };
        return res.status(400).json({
            message: messages[err.code] || `Upload error: ${err.message}`,
        });
    }

    if (err) {
        // Cloudinary or other upload errors
        console.error("Upload Error:", err);
        return res.status(400).json({
            message: "Image upload failed. Please try again.",
        });
    }

    next();
};