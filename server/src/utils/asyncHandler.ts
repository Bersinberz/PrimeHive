import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler so that any thrown error is automatically
 * passed to Express's next() — eliminating manual try-catch in every controller.
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
