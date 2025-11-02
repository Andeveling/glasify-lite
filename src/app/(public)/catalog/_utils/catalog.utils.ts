/**
 * Catalog Utilities
 *
 * Pure utility functions for catalog-related operations.
 * These functions have no side effects and are easily testable.
 */

/**
 * Format a range of millimeters to display format
 *
 * @param min - Minimum value in mm
 * @param max - Maximum value in mm
 * @returns Formatted range string (e.g., "500 - 2000 mm")
 */
export function formatRange(min: number, max: number): string {
	return `${min} - ${max} mm`;
}

/**
 * Calculate total pages for pagination
 *
 * @param total - Total number of items
 * @param itemsPerPage - Number of items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(
	total: number,
	itemsPerPage: number,
): number {
	return Math.ceil(total / itemsPerPage);
}

/**
 * Check if there should be an ellipsis between two page numbers
 *
 * @param currentPage - Current page in the sequence
 * @param previousPage - Previous page in the sequence
 * @returns Whether to show ellipsis
 */
export function shouldShowEllipsis(
	currentPage: number,
	previousPage: number | undefined,
): boolean {
	return previousPage !== undefined && currentPage - previousPage > 1;
}

/**
 * Transform model data for display
 *
 * @param model - Raw model data from API
 * @returns Transformed model data for UI
 */
export type RawModel = {
	id: string;
	name: string;
	manufacturer: { id: string; name: string } | null;
	basePrice: number;
	minWidthMm: number;
	maxWidthMm: number;
	minHeightMm: number;
	maxHeightMm: number;
	compatibleGlassTypeIds: string[];
};

export type DisplayModel = {
	id: string;
	name: string;
	manufacturer?: string;
	basePrice: string;
	range: {
		width: [number, number];
		height: [number, number];
	};
	compatibleGlassTypes: Array<{
		id: string;
		name: string;
		type: string;
	}>;
};

/**
 * Transform raw model to display format
 * Note: This is a placeholder. In a real app, you'd format currency here.
 */
export function transformModelForDisplay(
	model: RawModel,
	formatCurrency: (amount: number) => string,
): Omit<DisplayModel, "compatibleGlassTypes"> {
	return {
		basePrice: formatCurrency(model.basePrice),
		id: model.id,
		manufacturer: model.manufacturer?.name,
		name: model.name,
		range: {
			height: [model.minHeightMm, model.maxHeightMm],
			width: [model.minWidthMm, model.maxWidthMm],
		},
	};
}
