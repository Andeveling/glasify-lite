/**
 * Table Query Builder Utility
 *
 * Pure functions for building Prisma WHERE and ORDER BY clauses from parsed table parameters.
 * Follows SOLID principles (Single Responsibility, Open/Closed) and functional programming patterns.
 *
 * Features:
 * - Type-safe Prisma query construction
 * - Generic support for any Prisma model
 * - Composable filter builders
 * - SQL injection prevention via Prisma ORM
 *
 * Usage:
 * ```typescript
 * const whereClause = buildTableWhereClause(
 *   { search: 'vidrio', status: 'published' },
 *   {
 *     search: ['nameEs', 'descriptionEs'],
 *     exact: { status: 'status' }
 *   }
 * );
 * // Result: { OR: [{ nameEs: { contains: 'vidrio' }}, ...], status: 'published' }
 *
 * const orderByClause = buildTableOrderByClause(
 *   { sortBy: 'createdAt', sortOrder: 'desc' }
 * );
 * // Result: { createdAt: 'desc' }
 * ```
 *
 * @see TECH-002: tRPC procedures for list/filter/sort
 */

import type { Prisma } from '@prisma/client';

/**
 * Search configuration for building WHERE clauses
 */
export interface SearchConfig {
  /**
   * Fields to search with ILIKE (case-insensitive partial match)
   * Used for full-text search across multiple columns
   */
  search?: string[];

  /**
   * Mapping of filter keys to database columns for exact matches
   * Example: { manufacturer: 'manufacturerId', status: 'status' }
   */
  exact?: Record<string, string>;

  /**
   * Mapping of filter keys to database columns for numeric range filters
   * Example: { price: 'pricePerSqm' }
   */
  range?: Record<string, string>;

  /**
   * Mapping of filter keys to database columns for date range filters
   * Example: { createdAt: 'createdAt' }
   */
  dateRange?: Record<string, string>;
}

/**
 * Parsed filter parameters from URL
 */
export interface FilterParams {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Parsed sort parameters from URL
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Build search OR clause
 */
function buildSearchClause(search: string, searchFields: string[]): Record<string, unknown>[] {
  return searchFields.map((field) => ({
    [field]: {
      contains: search,
      mode: 'insensitive' as Prisma.QueryMode,
    },
  }));
}

/**
 * Build exact match filters
 */
function buildExactFilters(filters: FilterParams, exactConfig: Record<string, string>): Record<string, unknown> {
  const exactFilters: Record<string, unknown> = {};

  for (const [filterKey, dbField] of Object.entries(exactConfig)) {
    const value = filters[filterKey];
    if (value !== undefined && value !== null && value !== '') {
      exactFilters[dbField] = value;
    }
  }

  return exactFilters;
}

/**
 * Build numeric range filters
 */
function buildRangeFilters(filters: FilterParams, rangeConfig: Record<string, string>): Record<string, unknown> {
  const rangeFilters: Record<string, unknown> = {};

  for (const [filterKey, dbField] of Object.entries(rangeConfig)) {
    const minValue = filters[`${filterKey}Min`];
    const maxValue = filters[`${filterKey}Max`];

    if (minValue !== undefined || maxValue !== undefined) {
      rangeFilters[dbField] = {};
      if (minValue !== undefined) {
        (rangeFilters[dbField] as Record<string, unknown>).gte = Number(minValue);
      }
      if (maxValue !== undefined) {
        (rangeFilters[dbField] as Record<string, unknown>).lte = Number(maxValue);
      }
    }
  }

  return rangeFilters;
}

/**
 * Build date range filters
 */
function buildDateRangeFilters(
  filters: FilterParams,
  dateRangeConfig: Record<string, string>
): Record<string, unknown> {
  const dateFilters: Record<string, unknown> = {};

  for (const [filterKey, dbField] of Object.entries(dateRangeConfig)) {
    const startDate = filters[`${filterKey}Start`];
    const endDate = filters[`${filterKey}End`];

    if (startDate !== undefined || endDate !== undefined) {
      dateFilters[dbField] = {};
      if (startDate !== undefined) {
        (dateFilters[dbField] as Record<string, unknown>).gte = new Date(String(startDate));
      }
      if (endDate !== undefined) {
        (dateFilters[dbField] as Record<string, unknown>).lte = new Date(String(endDate));
      }
    }
  }

  return dateFilters;
}

/**
 * Build Prisma WHERE clause from filter parameters
 *
 * @param filters - Parsed filter parameters from URL
 * @param config - Search configuration (which fields to search)
 * @returns Prisma WHERE clause
 */
export function buildTableWhereClause<T extends Record<string, unknown>>(
  filters: FilterParams,
  config: SearchConfig
): T {
  const where: Record<string, unknown> = {};

  // Handle full-text search (OR across multiple fields)
  if (filters.search && config.search && config.search.length > 0) {
    where.OR = buildSearchClause(filters.search, config.search);
  }

  // Handle exact match filters
  if (config.exact) {
    Object.assign(where, buildExactFilters(filters, config.exact));
  }

  // Handle numeric range filters
  if (config.range) {
    Object.assign(where, buildRangeFilters(filters, config.range));
  }

  // Handle date range filters
  if (config.dateRange) {
    Object.assign(where, buildDateRangeFilters(filters, config.dateRange));
  }

  return where as T;
}

/**
 * Build Prisma ORDER BY clause from sort parameters
 *
 * @param sort - Parsed sort parameters from URL
 * @param defaultSort - Default sort order if none provided
 * @returns Prisma ORDER BY clause
 */
export function buildTableOrderByClause<T extends Record<string, unknown>>(
  sort: SortParams,
  defaultSort: { sortBy: string; sortOrder: 'asc' | 'desc' } = {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }
): T {
  const { sortBy = defaultSort.sortBy, sortOrder = defaultSort.sortOrder } = sort;

  return {
    [sortBy]: sortOrder,
  } as T;
}

/**
 * Validate sort field against allowed fields (security check)
 *
 * @param sortBy - Field to sort by
 * @param allowedFields - Array of allowed field names
 * @returns True if field is allowed, false otherwise
 */
export function isValidSortField(sortBy: string | undefined, allowedFields: string[]): boolean {
  if (!sortBy) return true; // Allow no sort field (use default)
  return allowedFields.includes(sortBy);
}

/**
 * Pagination constraints
 */
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

/**
 * Build pagination parameters for Prisma
 *
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Prisma skip and take parameters
 */
export function buildPaginationParams(page: number, pageSize: number): { skip: number; take: number } {
  const currentPage = Math.max(1, page); // Ensure page is at least 1
  const itemsPerPage = Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, pageSize));

  return {
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  };
}
