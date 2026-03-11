import { describe, it, expect } from "vitest";
import { escapeRegex } from "./escapeRegex";

describe("escapeRegex", () => {
    it("should escape special regex characters", () => {
        expect(escapeRegex("C++")).toBe("C\\+\\+");
        expect(escapeRegex("Shoes (Men)")).toBe("Shoes \\(Men\\)");
        expect(escapeRegex("$100")).toBe("\\$100");
        expect(escapeRegex("[New]")).toBe("\\[New\\]");
        expect(escapeRegex("foo.bar")).toBe("foo\\.bar");
        expect(escapeRegex("what?")).toBe("what\\?");
        expect(escapeRegex("a*b")).toBe("a\\*b");
        expect(escapeRegex("a|b")).toBe("a\\|b");
        expect(escapeRegex("a^b")).toBe("a\\^b");
        expect(escapeRegex("a{b}")).toBe("a\\{b\\}");
        expect(escapeRegex("a\\b")).toBe("a\\\\b");
    });

    it("should leave normal strings unchanged", () => {
        expect(escapeRegex("Electronics")).toBe("Electronics");
        expect(escapeRegex("T-Shirts")).toBe("T-Shirts");
        expect(escapeRegex("Home & Kitchen")).toBe("Home & Kitchen");
    });

    it("should handle empty string", () => {
        expect(escapeRegex("")).toBe("");
    });
});
