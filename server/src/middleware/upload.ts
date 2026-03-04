import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import { Request } from "express";

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