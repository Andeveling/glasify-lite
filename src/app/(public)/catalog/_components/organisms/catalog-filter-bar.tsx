'use client';

import { CatalogSearch } from '@views/catalog/_components/molecules/catalog-search';
import { CatalogFilters } from '@views/catalog/_components/organisms/catalog-filters';

/**
 * CatalogFilterBar - Grid layout for search + filters + badges
 * Issue: #002-ui-ux-requirements
 *
 * Composes filter components following Open/Closed Principle:
 * - First row: search (left), filter controls (right)
 * - Second row: active search parameters and result count (full width)
 *
 * Each responsibility is delegated to specialized components:
 * - CatalogSearch: Handles search input
 * - CatalogFilters: Orchestrates filter controls, badges, and result count
 *
 * Memory Leak Fix:
 * - Passes searchParams as props instead of each component calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
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
      {/* Row 1: Search (full width in mobile) */}
      <div>
        <CatalogSearch initialValue={searchQuery} />
      </div>
      {/* Row 2: Filters (full width in mobile, side by side in desktop) */}
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-end">
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
      {/* Row 3: Search parameters badges + result count (full width) */}
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
