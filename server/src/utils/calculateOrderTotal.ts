/**
 * Calculate the total amount for an order based on its items.
 * Use this when creating orders server-side to prevent client manipulation.
 *
 * @param items - Array of items with price and quantity
 * @returns The calculated total amount
 */
export const calculateOrderTotal = (
    items: { price: number; quantity: number }[]
): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
