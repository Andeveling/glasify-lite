/**
 * Cursor pagination utility
 *
 * Utilities for implementing cursor-based pagination with Prisma.
 * Cursor pagination is more efficient than offset pagination for large datasets.
 *
 * Features:
 * - Encode/decode cursors (Base64)
 * - Build Prisma cursor queries
 * - Security validation
 * - Performance optimization
 *
 * Usage:
 * ```typescript
 * // Encode cursor from last item
 * const cursor = encodeCursor(lastItem.id);
 *
 * // Decode cursor for Prisma query
 * const cursorId = decodeCursor(cursor);
 *
 * // Query with cursor
 * const items = await prisma.model.findMany({
 *   take: 20,
 *   skip: 1, // Skip cursor itself
 *   cursor: { id: cursorId },
 *   orderBy: { createdAt: 'desc' },
 * });
 * ```
 *
 * @see PERF-002: Cursor pagination for large datasets
 */

/**
 * Maximum page size for cursor pagination
 */
const MAX_CURSOR_PAGE_SIZE = 100;

/**
 * Minimum page size for cursor pagination
 */
const MIN_CURSOR_PAGE_SIZE = 1;

/**
 * Encode a cursor value to Base64
 *
 * @param value - The cursor value (typically an ID)
 * @returns Base64 encoded cursor
 */
export function encodeCursor(value: string): string {
	return Buffer.from(value).toString("base64");
}

/**
 * Decode a Base64 cursor
 *
 * @param cursor - Base64 encoded cursor
 * @returns Decoded cursor value
 * @throws Error if cursor is invalid
 */
export function decodeCursor(cursor: string): string {
	try {
		return Buffer.from(cursor, "base64").toString("utf-8");
	} catch {
		throw new Error("Invalid cursor format");
	}
}

/**
 * Validate cursor format
 *
 * @param cursor - Cursor to validate
 * @returns True if cursor is valid
 */
export function isValidCursor(cursor: string): boolean {
	try {
		const decoded = decodeCursor(cursor);
		return decoded.length > 0;
	} catch {
		return false;
	}
}

/**
 * Build cursor pagination parameters for Prisma
 *
 * @param cursor - Optional cursor value
 * @param pageSize - Number of items to fetch
 * @returns Prisma cursor pagination params
 */
export function buildCursorPaginationParams(
	cursor: string | undefined,
	pageSize: number,
): {
	take: number;
	skip?: number;
	cursor?: { id: string };
} {
	const params: {
		take: number;
		skip?: number;
		cursor?: { id: string };
	} = {
		take: Math.max(
			MIN_CURSOR_PAGE_SIZE,
			Math.min(MAX_CURSOR_PAGE_SIZE, pageSize),
		),
	};

	if (cursor) {
		const decodedCursor = decodeCursor(cursor);
		params.cursor = { id: decodedCursor };
		params.skip = 1; // Skip the cursor itself
	}

	return params;
}

/**
 * Build pagination metadata for cursor-based pagination
 *
 * @param items - Array of items returned from query
 * @param pageSize - Requested page size
 * @returns Pagination metadata
 */
export function buildCursorPaginationMeta<T extends { id: string }>(
	items: T[],
	pageSize: number,
): {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startCursor: string | null;
	endCursor: string | null;
} {
	const hasNextPage = items.length === pageSize;
	const firstItem = items[0];
	const lastItem = items.at(-1);

	const startCursor = firstItem ? encodeCursor(firstItem.id) : null;
	const endCursor = lastItem ? encodeCursor(lastItem.id) : null;

	return {
		endCursor,
		hasNextPage,
		hasPreviousPage: false, // Not implemented in this version
		startCursor,
	};
}
