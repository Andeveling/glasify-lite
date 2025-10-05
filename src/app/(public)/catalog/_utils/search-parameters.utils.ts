/**
 * Search Parameters Utilities
 *
 * Pure utility functions for building active search parameter badges.
 * These functions have no side effects anexport function buildSortParameter(sortType: string | null | undefined): SearchParameter | undefined {
  // Don't show badge for default sort
  if (isDefaultSort(sortType)) {
    return undefined;
  }

  const config = getSortConfiguration(sortType);
  if (!config) {
    return undefined;
  }

  return {
    ariaLabel: `Quitar ordenamiento: ${config.label}`,
    icon: config.icon,
    key: 'sort',
    label: config.label,
  };
}estable.
 *
 * Following Single Responsibility Principle - each function has one clear purpose.
 */

import { ArrowDownAZ, ArrowDownZA, Building2, type LucideIcon, Search, SortAsc, SortDesc } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type CatalogSortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export type SearchParameter = {
  key: string;
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
};

type SortConfiguration = {
  icon: LucideIcon;
  label: string;
};

type BuildParametersInput = {
  searchQuery?: string | null;
  manufacturerName?: string | null;
  sortType?: CatalogSortOption | null;
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Sort configurations for catalog
 *
 * Maps sort types to their display labels and icons.
 * Follows Open/Closed Principle - extend by adding new entries.
 */
export const SORT_CONFIGURATIONS: Record<CatalogSortOption, SortConfiguration> = {
  'name-asc': {
    icon: ArrowDownAZ,
    label: 'A-Z',
  },
  'name-desc': {
    icon: ArrowDownZA,
    label: 'Z-A',
  },
  'price-asc': {
    icon: SortAsc,
    label: 'Precio ↑',
  },
  'price-desc': {
    icon: SortDesc,
    label: 'Precio ↓',
  },
} as const;

export const DEFAULT_SORT: CatalogSortOption = 'name-asc';

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Get sort configuration for a given sort type
 *
 * @param sortType - The sort type to get configuration for
 * @returns Sort configuration or undefined if not found
 *
 * @example
 * ```ts
 * const config = getSortConfiguration('price-asc');
 * // => { icon: SortAsc, label: 'Precio ↑' }
 * ```
 */
export function getSortConfiguration(sortType: string | null | undefined): SortConfiguration | undefined {
  if (!sortType) {
    return;
  }
  return SORT_CONFIGURATIONS[sortType as CatalogSortOption];
}

/**
 * Check if sort type is the default sort
 *
 * @param sortType - The sort type to check
 * @returns Whether the sort type is the default
 *
 * @example
 * ```ts
 * isDefaultSort('name-asc'); // => true
 * isDefaultSort('price-desc'); // => false
 * ```
 */
export function isDefaultSort(sortType: string | null | undefined): boolean {
  return !sortType || sortType === DEFAULT_SORT;
}

/**
 * Build search parameter for search query
 *
 * @param searchQuery - The search query value
 * @returns Search parameter or undefined if no query
 */
export function buildSearchParameter(searchQuery: string | null | undefined): SearchParameter | undefined {
  if (!searchQuery) {
    return;
  }

  return {
    ariaLabel: `Quitar búsqueda: ${searchQuery}`,
    icon: Search,
    key: 'search',
    label: searchQuery,
  };
}

/**
 * Build search parameter for manufacturer filter
 *
 * @param manufacturerName - The manufacturer name
 * @returns Search parameter or undefined if no manufacturer
 */
export function buildManufacturerParameter(manufacturerName: string | null | undefined): SearchParameter | undefined {
  if (!manufacturerName) {
    return;
  }

  return {
    ariaLabel: `Quitar filtro de ${manufacturerName}`,
    icon: Building2,
    key: 'manufacturer',
    label: manufacturerName,
  };
}

/**
 * Build search parameter for sort order
 *
 * @param sortType - The sort type
 * @returns Search parameter or undefined if default sort
 */
export function buildSortParameter(sortType: string | null | undefined): SearchParameter | undefined {
  // Don't show badge for default sort
  if (isDefaultSort(sortType)) return;

  const config = getSortConfiguration(sortType);
  if (!config) return;

  return {
    ariaLabel: `Quitar ordenamiento: ${config.label}`,
    icon: config.icon,
    key: 'sort',
    label: config.label,
  };
}

/**
 * Build array of active search parameters
 *
 * Pure function that transforms search state into displayable parameters.
 * Follows functional programming principles - no side effects.
 *
 * @param input - Object containing search query, manufacturer, and sort
 * @returns Array of active search parameters
 *
 * @example
 * ```ts
 * const params = buildActiveParameters({
 *   searchQuery: 'vidrio',
 *   manufacturerName: 'Guardian',
 *   sortType: 'price-desc',
 * });
 * // => [
 * //   { key: 'search', label: 'vidrio', ... },
 * //   { key: 'manufacturer', label: 'Guardian', ... },
 * //   { key: 'sort', label: 'Precio ↓', ... }
 * // ]
 * ```
 */
export function buildActiveParameters(input: BuildParametersInput): SearchParameter[] {
  const { searchQuery, manufacturerName, sortType } = input;

  // Build parameters using individual builder functions
  const parameters = [
    buildSearchParameter(searchQuery),
    buildManufacturerParameter(manufacturerName),
    buildSortParameter(sortType),
  ];

  // Filter out undefined values
  return parameters.filter((param): param is SearchParameter => param !== undefined);
}
