/**
 * Services List Page (US10 - T094)
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
 * - Data serialization for Decimal types
 *
 * Route: /admin/services
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { ServicesContent } from "./_components/services-content";

export const metadata: Metadata = {
  description: "Administra los servicios adicionales para cotizaciones",
  title: "Servicios | Admin",
};

/**
 * SSR Configuration: Force dynamic rendering
 * - No caching for admin routes (always fresh data)
 * - Suspense key triggers re-fetch when filters change
 * - Private dashboard routes don't benefit from ISR
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  isActive?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const search =
    params.search && params.search !== "" ? params.search : undefined;
  const type = params.type && params.type !== "all" ? params.type : undefined;
  const isActive = (
    params.isActive && params.isActive !== "all" ? params.isActive : "all"
  ) as "all" | "active" | "inactive";
  const sortBy = (params.sortBy || "name") as
    | "name"
    | "createdAt"
    | "updatedAt"
    | "rate";
  const sortOrder = (params.sortOrder || "asc") as "asc" | "desc";

  // Fetch data OUTSIDE Suspense to avoid EventEmitter memory leak
  const initialData = await api.admin.service.list({
    isActive,
    limit: 20,
    page,
    search,
    sortBy,
    sortOrder,
    type: (type === "all" ? "all" : type) as
      | "all"
      | "area"
      | "perimeter"
      | "fixed",
  });

  // Transform Decimal fields to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((service) => ({
      ...service,
      rate: service.rate.toNumber(),
    })),
  };

  const searchParamsForClient = {
    isActive,
    page: String(page),
    search,
    sortBy,
    sortOrder,
    type,
  };

  return (
    <div className="space-y-6">
      {/* Header - always visible */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Servicios</h1>
        <p className="text-muted-foreground">
          Gestiona los servicios adicionales para cotizaciones (instalación,
          entrega, etc.)
        </p>
      </div>

      {/* Content with filters and table */}
      <ServicesContent
        initialData={serializedData}
        searchParams={searchParamsForClient}
      />
    </div>
  );
}
