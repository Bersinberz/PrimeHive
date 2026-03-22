import { PorterStemmer, WordTokenizer } from "natural";
import { escapeRegex } from "./escapeRegex";

const tokenizer = new WordTokenizer();

/**
 * Given a raw search query, returns an array of regex patterns that cover:
 * - the original tokens (for exact/partial matches)
 * - the stemmed tokens (for morphological variants)
 *
 * e.g. "shoes running" → stems to ["shoe", "run"]
 *      which matches "Running Sneakers", "Shoe Rack", etc.
 */
export function buildStemPatterns(query: string): RegExp[] {
  const tokens = tokenizer.tokenize(query.toLowerCase()) ?? [];

  const terms = new Set<string>();

  for (const token of tokens) {
    terms.add(escapeRegex(token));                        // original
    terms.add(escapeRegex(PorterStemmer.stem(token)));    // stemmed
  }

  // Also add the full query as a phrase fallback
  terms.add(escapeRegex(query.trim()));

  return Array.from(terms).map(t => new RegExp(t, "i"));
}

/**
 * Builds a MongoDB $or filter that matches any of the stem patterns
 * across name, description, and category fields.
 */
export function buildStemFilter(query: string, baseFilter: Record<string, unknown>) {
  const patterns = buildStemPatterns(query);

  const orClauses = patterns.flatMap(pattern => [
    { name:        { $regex: pattern } },
    { description: { $regex: pattern } },
    { category:    { $regex: pattern } },
  ]);

  return { ...baseFilter, $or: orClauses };
}
