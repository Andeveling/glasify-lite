/**
 * Glass Suppliers List Page (US5 - T036)
 *
 * Server Component - SSR pattern for dashboard routes
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Fetches data at page level
 * - Passes serialized data to client components
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Single API call per page load
 *
 * Route: /admin/glass-suppliers
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { GlassSupplierList } from "./_components/glass-supplier-list";

export const metadata: Metadata = {
  description: "Administra los fabricantes de vidrio",
  title: "Proveedores de Vidrio | Admin",
};

/**
 * SSR Configuration: Force dynamic rendering
 * - No caching for admin routes (always fresh data)
 * - Private dashboard routes don't benefit from ISR
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  country?: string;
  isActive?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function GlassSuppliersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params
  const page = Number(params.page) || 1;
  const search =
    params.search && params.search !== "" ? params.search : undefined;
  const country =
    params.country && params.country !== "all" ? params.country : undefined;
  const isActive = (
    params.isActive && params.isActive !== "all" ? params.isActive : "all"
  ) as "all" | "active" | "inactive";
  const sortBy = (params.sortBy || "name") as
    | "name"
    | "code"
    | "country"
    | "createdAt";
  const sortOrder = (params.sortOrder || "asc") as "asc" | "desc";

  // Fetch data server-side with filters
  const initialData = await api.admin["glass-supplier"].list({
    country,
    isActive,
    limit: 20,
    page,
    search,
    sortBy,
    sortOrder,
  });

  const searchParamsForClient = {
    country,
    isActive,
    page: String(page),
    search,
    sortBy,
    sortOrder,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Proveedores de Vidrio
        </h1>
        <p className="text-muted-foreground">
          Administra los fabricantes de vidrio y sus productos
        </p>
      </div>

      <GlassSupplierList
        initialData={initialData}
        searchParams={searchParamsForClient}
      />
    </div>
  );
}
