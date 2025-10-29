/**
 * Model catalog data hook
 * Fetches profile suppliers and glass types with 5-minute stale time
 */

import { api } from "@/trpc/react";

const FIVE_MINUTES_MS = 300_000;
const CATALOG_LIMIT = 100;

export function useModelCatalogData() {
  const { data: suppliersData } = api.admin["profile-supplier"].list.useQuery(
    {
      limit: CATALOG_LIMIT,
      page: 1,
      sortBy: "name",
      sortOrder: "asc",
    },
    {
      staleTime: FIVE_MINUTES_MS,
    }
  );

  const { data: glassTypesData } = api.admin["glass-type"].list.useQuery(
    {
      limit: CATALOG_LIMIT,
      page: 1,
      sortBy: "name",
      sortOrder: "asc",
    },
    {
      staleTime: FIVE_MINUTES_MS,
    }
  );

  return {
    glassTypes: glassTypesData?.items ?? [],
    suppliers: suppliersData?.items ?? [],
  };
}
