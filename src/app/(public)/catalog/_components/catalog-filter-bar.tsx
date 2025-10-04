import { CatalogFilters } from './catalog-filters';
import { CatalogSearch } from './catalog-search';

/**
 * CatalogFilterBar - Grid layout for search + filters + badges
 * Issue: #002-ui-ux-requirements
 *
 * Composes filter components following Open/Closed Principle:
 * - First row: search (left), filter controls (right)
 * - Second row: active filter badges and result count (full width)
 *
 * Each responsibility is delegated to specialized components:
 * - CatalogSearch: Handles search input
 * - CatalogFilters: Orchestrates filter controls, badges, and result count
 */
export function CatalogFilterBar({
  searchQuery,
  manufacturers,
  totalResults,
}: {
  searchQuery?: string;
  manufacturers?: Array<{ id: string; name: string }>;
  totalResults?: number;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-6">
      {/* Row 1: Search (left), Filters (right) */}
      <div className="md:col-span-5 lg:col-span-6">
        <CatalogSearch initialValue={searchQuery} />
      </div>
      <div className="flex items-center justify-end md:col-span-7 lg:col-span-6">
        <CatalogFilters
          manufacturers={manufacturers}
          showBadges={false}
          showResultCount={false}
          totalResults={undefined}
        />
      </div>
      {/* Row 2: Badges + result count (full width) */}
      <div className="md:col-span-12 lg:col-span-12">
        <CatalogFilters manufacturers={manufacturers} showControls={false} totalResults={totalResults} />
      </div>
    </div>
  );
}
