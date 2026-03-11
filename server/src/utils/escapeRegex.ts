/**
 * Escape special regex characters in a string to prevent ReDoS attacks
 * and ensure literal string matching in regex patterns.
 */
export const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
