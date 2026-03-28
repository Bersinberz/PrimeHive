import { z } from "zod";

export const CreateCouponSchema = z.object({
  code:          z.string().min(1, "Coupon code is required").max(50),
  discountType:  z.enum(["percentage","fixed"]),
  discountValue: z.number().min(1),
  minOrderValue: z.number().min(0).optional(),
  usageLimit:    z.number().int().min(1).optional(),
  expiryDate:    z.string().optional(),
  isActive:      z.boolean().default(true),
});

export const ValidateCouponSchema = z.object({
  code:       z.string().min(1, "code is required"),
  orderTotal: z.coerce.number().min(0, "orderTotal is required"),
});
