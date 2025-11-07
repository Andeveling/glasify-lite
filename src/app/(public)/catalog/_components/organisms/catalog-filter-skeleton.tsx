/**
 * Catalog Filter Skeleton - Loading State
 *
 * Skeleton loading state for catalog filter bar.
 * Matches the layout of CatalogFilterBar for smooth loading experience.
 *
 * @component Client Component
 */

import { Skeleton } from "@/components/ui/skeleton";

export function CatalogFilterSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Input Skeleton */}
      <div className="max-w-md flex-1">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Results Count Skeleton */}
        <Skeleton className="h-10 w-32" />

        {/* Manufacturer Filter Skeleton */}
        <Skeleton className="h-10 w-40" />

        {/* Sort Filter Skeleton */}
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
