import cloudinary from "../config/cloudinary";

/**
 * Extracts the public ID from a Cloudinary URL and deletes the asset.
 * URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<extension>
 * @param url The full Cloudinary URL of the image to delete
 */
export const deleteImageFromCloudinary = async (url: string): Promise<void> => {
    try {
        if (!url || !url.includes("cloudinary.com")) return;

        // Split by '/' and get the parts after 'upload/'
        const parts = url.split("/");
        const uploadIndex = parts.indexOf("upload");
        
        if (uploadIndex === -1) return;

        // The public ID is everything after the version (v12345678) and before the extension
        // Example: .../upload/v1625000000/Profile%20Picture/user_123.jpg
        // Parts after upload: ["v1625000000", "Profile%20Picture", "user_123.jpg"]
        
        let publicIdWithExtension = parts.slice(uploadIndex + 2).join("/"); // Skip 'upload' and version
        
        // Remove extension
        const publicId = publicIdWithExtension.split(".").slice(0, -1).join(".");

        // Decode URI component (e.g., %20 -> space)
        const decodedPublicId = decodeURIComponent(publicId);

        if (decodedPublicId) {
            await cloudinary.uploader.destroy(decodedPublicId);
            console.log(`Deleted Cloudinary asset: ${decodedPublicId}`);
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }
};
