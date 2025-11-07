/**
 * Profile Suppliers List Page
 *
 * Server Component - SSR pattern for dashboard routes
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Fetches data at page level (prevents EventEmitter memory leaks)
 * - Passes serialized data to client components
 * - No Suspense boundaries (data fetched before render)
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Single API call per page load
 *
 * Route: /admin/profile-suppliers
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { ProfileSupplierContent } from "./_components/profile-supplier-content";

export const metadata: Metadata = {
  description: "Administra los fabricantes de perfiles (ventanas y puertas)",
  title: "Proveedores de Perfiles | Admin",
};

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)
// Note: Admin routes are dynamic by default - no export needed
// TODO: Consider Suspense boundaries for better loading UX after build verification

type SearchParams = Promise<{
  isActive?: string;
  materialType?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function ProfileSuppliersPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const search =
    params.search && params.search !== "" ? params.search : undefined;
  const materialType =
    params.materialType && params.materialType !== "all"
      ? params.materialType
      : undefined;
  const isActive = (
    params.isActive && params.isActive !== "all" ? params.isActive : "all"
  ) as "all" | "active" | "inactive";
  const sortBy = (params.sortBy || "name") as
    | "name"
    | "createdAt"
    | "materialType";
  const sortOrder = (params.sortOrder || "asc") as "asc" | "desc";

  // Fetch data OUTSIDE Suspense to avoid EventEmitter memory leak
  const initialData = await api.admin["profile-supplier"].list({
    isActive,
    limit: 20,
    materialType: materialType as
      | "PVC"
      | "ALUMINUM"
      | "WOOD"
      | "MIXED"
      | undefined,
    page,
    search,
    sortBy,
    sortOrder,
  });

  const searchParamsForClient = {
    isActive,
    materialType,
    page: String(page),
    search,
    sortBy,
    sortOrder,
  };

  return (
    <div className="space-y-6">
      {/* Header - always visible */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Proveedores de Perfiles
        </h1>
        <p className="text-muted-foreground">
          Administra los fabricantes de perfiles para ventanas y puertas
        </p>
      </div>

      {/* Content with filters and table */}
      <ProfileSupplierContent
        initialData={initialData}
        searchParams={searchParamsForClient}
      />
    </div>
  );
}
