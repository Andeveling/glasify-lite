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
    <div className="grid w-full grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-6">
      {/* Row 1: Search (left), Filters (right) */}
      <div className="md:col-span-5 lg:col-span-6">
        <CatalogSearch initialValue={searchQuery} />
      </div>
      <div className="flex items-center justify-end md:col-span-7 lg:col-span-6">
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
      {/* Row 2: Search parameters badges + result count (full width) */}
      <div className="md:col-span-12 lg:col-span-12">
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
