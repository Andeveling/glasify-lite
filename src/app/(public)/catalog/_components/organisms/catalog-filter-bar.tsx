"use client";

import { CatalogSearch } from "@views/catalog/_components/molecules/catalog-search";
import { CatalogFilters } from "@views/catalog/_components/organisms/catalog-filters";

/**
 * CatalogFilterBar - Single row layout for search + filters
 *
 * Desktop: All controls in one row
 * Mobile: Stacked vertically
 *
 * Composes filter components following Open/Closed Principle
 *
 * Memory Leak Fix:
 * - Uses single CatalogFilters instance instead of two separate instances
 * - Previous implementation rendered CatalogFilters twice (controls + badges)
 * - Each instance created event listeners, causing MaxListenersExceededWarning
 * - Now uses props to control visibility of sections within single instance
 */
export function CatalogFilterBar({
	searchQuery,
	profileSuppliers,
	totalResults,
	currentProfileSupplier,
	currentSort,
}: {
	searchQuery?: string;
	profileSuppliers?: Array<{ id: string; name: string }>;
	totalResults?: number;
	currentProfileSupplier?: string;
	currentSort?: string;
}) {
	return (
		<div className="space-y-4">
			{/* Search + Filters row */}
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div className="flex-1">
					<CatalogSearch initialValue={searchQuery} />
				</div>

				{/* Single CatalogFilters instance - shows all sections */}
				<div className="w-full md:w-auto">
					<CatalogFilters
						currentProfileSupplier={currentProfileSupplier}
						currentSearchQuery={searchQuery}
						currentSort={currentSort}
						profileSuppliers={profileSuppliers}
						showBadges={true}
						showControls={true}
						showResultCount={true}
						totalResults={totalResults}
					/>
				</div>
			</div>
		</div>
	);
}
