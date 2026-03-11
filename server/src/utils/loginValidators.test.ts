import { describe, it, expect } from "vitest";
import {
    isValidEmail,
    isValidPhone,
    isValidName,
    validatePassword,
    validateDOB,
} from "./loginValidators";

describe("isValidEmail", () => {
    it("should accept valid emails", () => {
        expect(isValidEmail("user@example.com")).toBe(true);
        expect(isValidEmail("test.user@domain.co.in")).toBe(true);
    });

    it("should reject invalid emails", () => {
        expect(isValidEmail("")).toBe(false);
        expect(isValidEmail("no-at-sign")).toBe(false);
        expect(isValidEmail("@domain.com")).toBe(false);
        expect(isValidEmail("user@")).toBe(false);
        expect(isValidEmail("user @example.com")).toBe(false);
    });
});

describe("isValidPhone", () => {
    it("should accept 10-digit numbers", () => {
        expect(isValidPhone("9876543210")).toBe(true);
    });

    it("should reject invalid phones", () => {
        expect(isValidPhone("123")).toBe(false);
        expect(isValidPhone("12345678901")).toBe(false);
        expect(isValidPhone("abc1234567")).toBe(false);
    });
});

describe("isValidName", () => {
    it("should accept valid names", () => {
        expect(isValidName("John Doe")).toBe(true);
        expect(isValidName("  Alice  ")).toBe(true);
    });

    it("should reject invalid names", () => {
        expect(isValidName("")).toBe(false);
        expect(isValidName("AB")).toBe(false);
        expect(isValidName("John123")).toBe(false);
    });
});

describe("validatePassword", () => {
    it("should accept a strong password", () => {
        expect(validatePassword("Str0ng!Pass")).toBeNull();
    });

    it("should reject too short", () => {
        expect(validatePassword("Ab1!")).not.toBeNull();
    });

    it("should reject no uppercase", () => {
        expect(validatePassword("weak1!pass")).not.toBeNull();
    });

    it("should reject no lowercase", () => {
        expect(validatePassword("WEAK1!PASS")).not.toBeNull();
    });

    it("should reject no number", () => {
        expect(validatePassword("Weak!Pass")).not.toBeNull();
    });

    it("should reject no special char", () => {
        expect(validatePassword("Weak1Pass")).not.toBeNull();
    });

    it("should reject spaces", () => {
        expect(validatePassword("Weak 1!Pass")).not.toBeNull();
    });
});

describe("validateDOB", () => {
    it("should accept valid DOB for adult", () => {
        expect(validateDOB("1990-01-01")).toBeNull();
    });

    it("should reject future date", () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        expect(validateDOB(future.toISOString())).not.toBeNull();
    });

    it("should reject under 18", () => {
        const recent = new Date();
        recent.setFullYear(recent.getFullYear() - 10);
        expect(validateDOB(recent.toISOString())).not.toBeNull();
    });

    it("should reject invalid date string", () => {
        expect(validateDOB("not-a-date")).not.toBeNull();
    });
});
