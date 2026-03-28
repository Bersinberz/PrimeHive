import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Zod validation middleware factory.
 * Usage: router.post("/route", validate(MySchema), controller)
 */
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ message: errors[0]?.message || "Validation failed", errors });
    }
    req.body = result.data;
    next();
  };
