import { Coordinates, ExtractedProduct, MockProduct, SearchResult, SortBy } from "../types";
import { calculateDistanceKm } from "../utils/distance";
import { calculateSimilarityScore, isCategoryCompatible } from "../utils/similarity";

type SearchProductsParams = {
  extractedProduct: ExtractedProduct;
  products: MockProduct[];
  userLocation: Coordinates;
  sortBy: SortBy;
};

/**
 * Only computes savings when we actually read/know the original price —
 * never invents a reference price just to show a number.
 */
function calculateSavings(
  originalPrice: number | null | undefined,
  candidatePrice: number
): number | null {
  if (originalPrice === null || originalPrice === undefined) {
    return null;
  }

  return originalPrice - candidatePrice;
}

function sortResults(results: SearchResult[], sortBy: SortBy): SearchResult[] {
  const sorted = [...results];

  switch (sortBy) {
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "distance":
      return sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    case "similarity":
      return sorted.sort((a, b) => b.similarityScore - a.similarityScore);
    default:
      return sorted;
  }
}

/**
 * Runs the extracted product against the local mock catalog:
 * filters out incompatible categories, scores similarity, computes
 * distance from the user's current location, derives savings (only when
 * we know the original price), and sorts the result set.
 */
export function searchProducts({
  extractedProduct,
  products,
  userLocation,
  sortBy,
}: SearchProductsParams): SearchResult[] {
  const compatibleProducts = products.filter((product) =>
    isCategoryCompatible(extractedProduct.category, product.category)
  );

  const results: SearchResult[] = compatibleProducts.map((product) => {
    const distanceKm = calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      product.latitude,
      product.longitude
    );

    const similarityScore = calculateSimilarityScore(extractedProduct, product);
    const savings = calculateSavings(extractedProduct.price, product.price);

    return {
      ...product,
      distanceKm,
      similarityScore,
      savings,
    };
  });

  return sortResults(results, sortBy);
}
