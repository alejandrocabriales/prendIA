import { ExtractedProduct, MockProduct } from "../types";

/**
 * Deterministic similarity scoring — no ML, just weighted attribute
 * comparison. Weights are tuned by hand and easy to tweak later.
 *
 * If an attribute isn't available on either side (e.g. the AI couldn't
 * read the brand, or the mock product has no brand), it's excluded from
 * the score entirely instead of counting as a mismatch — missing data
 * should never artificially drag similarity down.
 */
const SIMILARITY_WEIGHTS = {
  category: 0.3,
  subcategory: 0.2,
  color: 0.15,
  material: 0.1,
  style: 0.1,
  brand: 0.1,
  visualAttributes: 0.05,
};

function normalize(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Compares two free-text attributes. Returns null when the attribute isn't
 * comparable (missing on either side) so the caller can exclude it from
 * the weighted total rather than treating it as a mismatch.
 */
function compareText(a?: string | null, b?: string | null): number | null {
  const normalizedA = normalize(a);
  const normalizedB = normalize(b);

  if (!normalizedA || !normalizedB) {
    return null;
  }

  if (normalizedA === normalizedB) {
    return 1;
  }

  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return 0.6;
  }

  return 0;
}

/**
 * MockProduct has no visualAttributes field of its own, so we check how
 * many of the AI-detected visual attributes show up as keywords in the
 * product's title — a cheap but reasonable proxy for "looks like this".
 */
function compareVisualAttributes(
  visualAttributes: string[],
  product: MockProduct
): number | null {
  if (visualAttributes.length === 0) {
    return null;
  }

  const haystack = normalize(product.title);
  const matches = visualAttributes.filter((attribute) =>
    haystack.includes(normalize(attribute))
  );

  return matches.length / visualAttributes.length;
}

/**
 * Returns a 0..1 similarity score between what the AI extracted from the
 * user's photos and a candidate product from the mock catalog.
 */
export function calculateSimilarityScore(
  extractedProduct: ExtractedProduct,
  product: MockProduct
): number {
  const comparisons: Array<{ weight: number; score: number | null }> = [
    {
      weight: SIMILARITY_WEIGHTS.category,
      score: compareText(extractedProduct.category, product.category),
    },
    {
      weight: SIMILARITY_WEIGHTS.subcategory,
      score: compareText(extractedProduct.subcategory, product.subcategory),
    },
    {
      weight: SIMILARITY_WEIGHTS.color,
      score: compareText(extractedProduct.color, product.color),
    },
    {
      weight: SIMILARITY_WEIGHTS.material,
      score: compareText(extractedProduct.material, product.material),
    },
    {
      weight: SIMILARITY_WEIGHTS.style,
      score: compareText(extractedProduct.style, product.style),
    },
    {
      weight: SIMILARITY_WEIGHTS.brand,
      score: compareText(extractedProduct.brand, product.brand),
    },
    {
      weight: SIMILARITY_WEIGHTS.visualAttributes,
      score: compareVisualAttributes(extractedProduct.visualAttributes, product),
    },
  ];

  const applicable = comparisons.filter(
    (comparison): comparison is { weight: number; score: number } =>
      comparison.score !== null
  );

  const totalWeight = applicable.reduce((sum, c) => sum + c.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = applicable.reduce((sum, c) => sum + c.weight * c.score, 0);

  return weightedSum / totalWeight;
}

/**
 * Two products are treated as incompatible (and filtered out before
 * scoring) when their top-level category doesn't match at all — e.g. a
 * puffer jacket photo shouldn't surface jeans, no matter how "similar"
 * the color scoring thinks they are.
 */
export function isCategoryCompatible(
  extractedCategory: string,
  productCategory: string
): boolean {
  const score = compareText(extractedCategory, productCategory);
  return score !== null && score > 0;
}
