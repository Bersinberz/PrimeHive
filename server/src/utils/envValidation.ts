/**
 * Validates all required environment variables at startup.
 * Throws immediately with a clear message if any are missing.
 */
export const validateEnv = (): void => {
    const required = [
        "MONGO_URI",
        "JWT_SECRET",
        "JWT_REFRESH_SECRET",
        "CLIENT_URL",
        "SMTP_HOST",
        "SMTP_USER",
        "SMTP_PASS",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}\n` +
            `Please check your .env.development or .env.production file.`
        );
    }
};
