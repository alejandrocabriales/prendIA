/**
 * PrendIA — core domain types.
 *
 * ExtractedProduct = what the AI vision service read from the user's photos.
 * MockProduct = a product that exists in our local demo catalog.
 * SearchResult = a MockProduct after running it through the search engine
 * (distance + similarity + savings are *derived*, not stored on the product).
 */

export type SortBy = "price" | "distance" | "similarity";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ExtractedProductConfidence = {
  category: number;
  color: number;
  material: number;
  brand: number;
  size: number;
  price: number;
};

/**
 * Everything the AI vision service was able to extract from the garment
 * photo and (optionally) the label photo. Any field it could not determine
 * with confidence must be `null` — never guessed.
 */
export type ExtractedProduct = {
  category: string;
  subcategory?: string | null;
  color?: string | null;
  pattern?: string | null;
  material?: string | null;
  style?: string | null;

  visualAttributes: string[];

  brand?: string | null;
  size?: string | null;
  price?: number | null;
  sku?: string | null;
  productCode?: string | null;

  confidence: ExtractedProductConfidence;
};

/**
 * A product that exists in PrendIA's local mock catalog.
 * Intentionally has no `distanceKm` — distance depends on where the user
 * is standing, so it's computed at search time, never stored here.
 */
export type MockProduct = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  color: string;
  material?: string;
  style?: string;

  brand?: string;

  price: number;

  sizeAvailable: string[];

  storeName: string;
  address: string;

  latitude: number;
  longitude: number;

  imageUri: string;
};

/**
 * A MockProduct after it has gone through searchProducts(): carries the
 * contextual fields that only make sense in the context of one specific
 * search (a user's photo + a user's location).
 */
export type SearchResult = MockProduct & {
  distanceKm: number;
  similarityScore: number;
  savings?: number | null;
};

export type AIVisionError = {
  message: string;
};

export type AIVisionResult =
  | { success: true; data: ExtractedProduct }
  | { success: false; error: AIVisionError };
