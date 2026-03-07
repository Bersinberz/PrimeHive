export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    return /^[0-9]{10}$/.test(phone);
};

export const isValidName = (name: string): boolean => {
    return name.trim().length >= 3 && /^[A-Za-z\s]+$/.test(name.trim());
};

export const validatePassword = (password: string): string | null => {
    if (password.length < 6) return "Password must be at least 6 characters";
    if (/\s/.test(password)) return "Password must not contain spaces";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return null;
};

export const validateDOB = (dateOfBirth: string): string | null => {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(dob.getTime())) return "Invalid date of birth";
    if (dob > today) return "Date of birth cannot be in the future";

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) return "You must be at least 18 years old to register";
    if (age > 100) return "Please enter a valid date of birth";

    return null;
};
