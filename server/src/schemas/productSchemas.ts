import { z } from "zod";

export const CreateProductSchema = z.object({
  name:         z.string().min(2).max(200),
  description:  z.string().max(5000).optional().default(""),
  price:        z.coerce.number().min(0),
  comparePrice: z.coerce.number().min(0).optional(),
  category:     z.string().min(2).max(100),
  sku:          z.string().max(50).optional(),
  stock:        z.coerce.number().int().min(0).default(0),
  status:       z.enum(["active","draft","archived"]).default("active"),
});

export const ImportRowSchema = z.object({
  name:         z.string().min(2),
  price:        z.coerce.number().min(0),
  category:     z.string().min(1),
  description:  z.string().optional(),
  comparePrice: z.coerce.number().optional(),
  sku:          z.string().optional(),
  stock:        z.coerce.number().int().min(0).optional(),
  status:       z.enum(["active","draft","archived"]).optional(),
});
