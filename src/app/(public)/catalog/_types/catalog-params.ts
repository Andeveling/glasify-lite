/**
 * Catalog Query Parameters Types
 * Issue: #002-ui-ux-requirements
 *
 * Type-safe query parameter definitions for catalog filtering and sorting
 */

export type CatalogSortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type CatalogSearchParams = {
  /** Search query for filtering models by name */
  q?: string;
  /** Page number for pagination (1-indexed) */
  page?: string;
  /** Manufacturer ID for filtering models */
  manufacturer?: string;
  /** Sort option for ordering models */
  sort?: CatalogSortOption;
};

/**
 * Validates and normalizes catalog search parameters
 * Ensures values are within expected ranges and formats
 */
export function validateCatalogParams(params: CatalogSearchParams) {
  return {
    manufacturerId: params.manufacturer,
    page: params.page ? Math.max(1, Number.parseInt(params.page, 10)) : 1,
    searchQuery: params.q?.trim(),
    sort: (params.sort ?? "name-asc") as CatalogSortOption,
  };
}
