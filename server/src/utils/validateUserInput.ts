import { isValidEmail, isValidName, isValidPhone, validateDOB } from "./loginValidators";

export interface UserInputFields {
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validates common user input fields.
 * Returns an array of errors (empty if all valid).
 */
export const validateUserInput = (
    fields: UserInputFields,
    required: Array<keyof UserInputFields> = ["name", "email", "phone"]
): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (required.includes("name")) {
        if (!fields.name) {
            errors.push({ field: "name", message: "Name is required." });
        } else if (!isValidName(fields.name)) {
            errors.push({ field: "name", message: "Name must be at least 3 characters and contain only letters." });
        }
    }

    if (required.includes("email")) {
        if (!fields.email) {
            errors.push({ field: "email", message: "Email is required." });
        } else if (!isValidEmail(fields.email)) {
            errors.push({ field: "email", message: "Invalid email address format." });
        }
    }

    if (required.includes("phone")) {
        if (!fields.phone) {
            errors.push({ field: "phone", message: "Phone is required." });
        } else {
            const clean = fields.phone.replace(/\D/g, "").slice(-10);
            if (!isValidPhone(clean)) {
                errors.push({ field: "phone", message: "Phone number must be exactly 10 digits." });
            }
        }
    }

    if (fields.dateOfBirth) {
        const dobError = validateDOB(fields.dateOfBirth);
        if (dobError) errors.push({ field: "dateOfBirth", message: dobError });
    }

    return errors;
};

/**
 * Normalizes phone to +91XXXXXXXXXX format.
 */
export const normalizePhone = (phone: string): string => {
    const clean = phone.replace(/\D/g, "").slice(-10);
    return `+91${clean}`;
};
