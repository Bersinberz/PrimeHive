import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Request, Response } from "express";
import { updateStaff } from "./staffController";
import User from "../../models/User";
import * as cloudinaryHelper from "../../utils/cloudinaryHelper";

vi.mock("../../models/User");
vi.mock("../../utils/cloudinaryHelper");

describe("updateStaff", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        mockRequest = {
            params: { id: "staff_123" },
            body: { 
                name: "Test Staff",
                email: "staff@example.com",
                phone: "0987654321"
            },
        };
        responseObject = {};
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockImplementation((result) => {
                responseObject = result;
            }),
        };
        vi.clearAllMocks();
    });

    it("should mock Cloudinary cleanup utility and verify it's called with correct old URL during profile update", async () => {
        mockRequest.file = { path: "https://res.cloudinary.com/demo/image/upload/v1234/new_staff_pic.jpg" } as any;

        const mockOldProfilePicture = "https://res.cloudinary.com/demo/image/upload/v1234/old_staff_pic.jpg";

        (User.findOne as unknown as Mock).mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: "staff_123",
                role: "staff",
                profilePicture: mockOldProfilePicture,
            }),
        });

        (User.findOneAndUpdate as unknown as Mock).mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: "staff_123",
                name: "Test Staff",
                profilePicture: "https://res.cloudinary.com/demo/image/upload/v1234/new_staff_pic.jpg",
            }),
        });

        await updateStaff(mockRequest as Request, mockResponse as Response);

        expect(cloudinaryHelper.deleteImageFromCloudinary).toHaveBeenCalledTimes(1);
        expect(cloudinaryHelper.deleteImageFromCloudinary).toHaveBeenCalledWith(mockOldProfilePicture);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
});
