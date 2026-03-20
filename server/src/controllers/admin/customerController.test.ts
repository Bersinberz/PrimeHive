import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Request, Response } from "express";
import { updateCustomer } from "./customerController";
import User from "../../models/User";
import * as cloudinaryHelper from "../../utils/cloudinaryHelper";

vi.mock("../../models/User");
vi.mock("../../utils/cloudinaryHelper");

describe("updateCustomer", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        mockRequest = {
            params: { id: "cust_123" },
            body: { 
                name: "Test User",
                email: "test@example.com",
                phone: "1234567890"
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
        mockRequest.file = { path: "https://res.cloudinary.com/demo/image/upload/v1234/new_pic.jpg" } as any;

        const mockOldProfilePicture = "https://res.cloudinary.com/demo/image/upload/v1234/old_pic.jpg";

        // Mock User.findOne to return existing customer
        (User.findOne as unknown as Mock).mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: "cust_123",
                role: "user",
                profilePicture: mockOldProfilePicture,
            }),
        });

        // Mock User.findOneAndUpdate for the update
        (User.findOneAndUpdate as unknown as Mock).mockReturnValue({
            select: vi.fn().mockResolvedValue({
                _id: "cust_123",
                name: "Test User",
                profilePicture: "https://res.cloudinary.com/demo/image/upload/v1234/new_pic.jpg",
            }),
        });

        await updateCustomer(mockRequest as Request, mockResponse as Response);

        expect(cloudinaryHelper.deleteImageFromCloudinary).toHaveBeenCalledTimes(1);
        expect(cloudinaryHelper.deleteImageFromCloudinary).toHaveBeenCalledWith(mockOldProfilePicture);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
});
