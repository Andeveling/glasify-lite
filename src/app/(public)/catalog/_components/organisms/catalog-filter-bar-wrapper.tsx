/**
 * Catalog Filter Bar Wrapper - Server Component
 *
 * Wraps CatalogFilterBar and fetches data required for filters.
 * This prevents blocking the main route by allowing data fetching
 * to happen inside a Suspense boundary.
 *
 * @component Server Component
 */

import type { CatalogSortOption } from "@views/catalog/_types/catalog-params";
import { api } from "@/trpc/server-client";
import { CatalogFilterBar } from "./catalog-filter-bar";

type CatalogFilterBarWrapperProps = {
  currentProfileSupplier: string;
  currentSort: CatalogSortOption;
  searchQuery?: string;
};

export async function CatalogFilterBarWrapper({
  currentProfileSupplier,
  currentSort,
  searchQuery,
}: CatalogFilterBarWrapperProps) {
  // Fetch profile suppliers for filter dropdown
  const profileSuppliers = await api.catalog["list-manufacturers"]();

  // Fetch total count for results display (lightweight query)
  const totalData = await api.catalog["list-models"]({
    limit: 1,
    manufacturerId:
      currentProfileSupplier === "all" ? undefined : currentProfileSupplier,
    page: 1,
    search: searchQuery,
    sort: currentSort,
  });

  return (
    <CatalogFilterBar
      currentProfileSupplier={currentProfileSupplier}
      currentSort={currentSort}
      profileSuppliers={profileSuppliers}
      searchQuery={searchQuery}
      totalResults={totalData.total}
    />
  );
}
