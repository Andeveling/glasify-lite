/**
 * Table Params Parser Utility
 *
 * Pure functions for parsing and validating URL search parameters for server-side tables.
 * Uses Zod for type-safe validation and provides sanitized parameters for tRPC procedures.
 *
 * Features:
 * - Type-safe parameter parsing with Zod
 * - Default value handling
 * - URL parameter sanitization
 * - Security validation (SQL injection prevention via Zod)
 *
 * Usage:
 * ```typescript
 * // In Server Component
 * const params = await parseTableSearchParams(searchParams, {
 *   defaultPageSize: 20,
 *   maxPageSize: 100,
 *   allowedSortFields: ['nameEs', 'createdAt', 'status'],
 * });
 *
 * // Result: { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc', ... }
 * ```
 *
 * @see REQ-001: URL-based table state
 */

import { z } from 'zod';

/**
 * Default pagination constants
 */
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_ORDER = 'desc';

/**
 * Base table parameters schema
 */
const baseTableParamsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().positive().default(DEFAULT_PAGE_SIZE),

  // Search
  search: z.string().optional(),

  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default(DEFAULT_SORT_ORDER),
});

/**
 * Table parameters type
 */
export type BaseTableParams = z.infer<typeof baseTableParamsSchema>;

/**
 * Parser configuration options
 */
export interface TableParserConfig {
  /**
   * Default number of items per page
   */
  defaultPageSize?: number;

  /**
   * Maximum allowed page size
   */
  maxPageSize?: number;

  /**
   * Array of allowed sort field names (security check)
   */
  allowedSortFields?: string[];

  /**
   * Additional filter schemas to merge with base schema
   */
  filterSchema?: z.ZodObject<z.ZodRawShape>;
}

/**
 * Parse and validate table search parameters from URL
 *
 * @param searchParams - Raw search params from Next.js (Promise or object)
 * @param config - Parser configuration
 * @returns Validated and sanitized table parameters
 */
export async function parseTableSearchParams<T extends z.ZodRawShape = Record<string, never>>(
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>,
  config: TableParserConfig = {}
): Promise<BaseTableParams & z.infer<z.ZodObject<T>>> {
  const { defaultPageSize = DEFAULT_PAGE_SIZE, maxPageSize = 100, allowedSortFields, filterSchema } = config;

  // Await searchParams if it's a Promise (Next.js 15 async searchParams)
  const params = await searchParams;

  // Normalize searchParams (handle string arrays from Next.js)
  const normalizedParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      normalizedParams[key] = value[0]; // Take first value if array
    } else {
      normalizedParams[key] = value;
    }
  }

  // Build schema with configuration
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic schema building requires any
  let schema: any = baseTableParamsSchema.extend({
    pageSize: z.coerce.number().int().positive().max(maxPageSize).default(defaultPageSize),
  });

  // Add allowed sort field validation
  if (allowedSortFields && allowedSortFields.length > 0) {
    schema = schema.omit({ sortBy: true }).extend({
      sortBy: z.enum(allowedSortFields as [string, ...string[]]).optional(),
    });
  }

  // Merge with custom filter schema if provided
  if (filterSchema) {
    schema = schema.merge(filterSchema);
  }

  // Parse and validate
  const parsedParams = schema.parse(normalizedParams);

  return parsedParams as BaseTableParams & z.infer<z.ZodObject<T>>;
}

/**
 * Create a custom filter schema for specific table needs
 *
 * Example:
 * ```typescript
 * const modelFilters = createFilterSchema({
 *   manufacturerId: z.string().uuid().optional(),
 *   status: z.enum(['draft', 'published']).optional(),
 *   minPrice: z.coerce.number().positive().optional(),
 *   maxPrice: z.coerce.number().positive().optional(),
 * });
 * ```
 */
export function createFilterSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * Build search params object from validated params (for client-side)
 *
 * @param params - Validated table parameters
 * @returns URLSearchParams object
 */
export function buildSearchParams(params: Partial<BaseTableParams & Record<string, unknown>>): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  return searchParams;
}

/**
 * Calculate total pages from total count and page size
 *
 * @param totalCount - Total number of items
 * @param pageSize - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

/**
 * Check if current page is within valid range
 *
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @returns True if page is valid
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= Math.max(1, totalPages);
}
