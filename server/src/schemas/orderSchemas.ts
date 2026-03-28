import { z } from "zod";

const ShippingAddressSchema = z.object({
  line1:   z.string().min(1, "Address line 1 is required"),
  line2:   z.string().optional(),
  city:    z.string().min(1, "City is required"),
  state:   z.string().min(1, "State is required"),
  zip:     z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().default("India"),
});

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity:  z.number().int().min(1),
  })).min(1, "At least one item is required"),
  shippingAddress: ShippingAddressSchema,
  paymentMethod:   z.string().min(1, "Payment method is required"),
  guestEmail:      z.string().email().optional(),
  couponId:        z.string().optional(),
  couponDiscount:  z.number().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["Pending","Paid","Processing","Shipped","Delivered","Cancelled","Refunded"]),
  note:   z.string().max(500).optional(),
});

export const RefundRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a reason of at least 10 characters").max(1000),
});

export const RefundDecisionSchema = z.object({
  decision: z.enum(["approved","rejected"]),
  note:     z.string().max(500).optional(),
});
