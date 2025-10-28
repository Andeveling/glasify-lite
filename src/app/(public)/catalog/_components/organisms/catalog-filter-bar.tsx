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
      {/* Row 1: Search (left) + Filters (right) - Side by side on desktop */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search - Takes most of the space on desktop */}
        <div className="flex-1">
          <CatalogSearch initialValue={searchQuery} />
        </div>

        {/* Filters (sort, supplier) - Right aligned on desktop */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <CatalogFilters
            currentProfileSupplier={currentProfileSupplier}
            currentSearchQuery={searchQuery}
            currentSort={currentSort}
            profileSuppliers={profileSuppliers}
            showBadges={false}
            showResultCount={false}
            totalResults={undefined}
          />
        </div>
      </div>

      {/* Row 2: Active filters badges + result count (full width) */}
      <div>
        <CatalogFilters
          currentProfileSupplier={currentProfileSupplier}
          currentSearchQuery={searchQuery}
          currentSort={currentSort}
          profileSuppliers={profileSuppliers}
          showControls={false}
          totalResults={totalResults}
        />
      </div>
    </div>
  );
}
