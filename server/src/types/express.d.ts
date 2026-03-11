// Extend the Express Request interface to include user data from JWT
declare namespace Express {
    interface Request {
        user?: {
            id: string;
            role: string;
        };
    }
}
