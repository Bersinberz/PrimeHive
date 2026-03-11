import { describe, it, expect } from "vitest";
import { calculateOrderTotal } from "./calculateOrderTotal";

describe("calculateOrderTotal", () => {
    it("should calculate total correctly", () => {
        const items = [
            { price: 1000, quantity: 2 },
            { price: 500, quantity: 3 },
        ];
        expect(calculateOrderTotal(items)).toBe(3500);
    });

    it("should return 0 for empty items", () => {
        expect(calculateOrderTotal([])).toBe(0);
    });

    it("should handle single item", () => {
        const items = [{ price: 2500, quantity: 1 }];
        expect(calculateOrderTotal(items)).toBe(2500);
    });
});
