/**
 * Colors List Page
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
 * - Client components handle mutations and UI state
 *
 * Route: /admin/colors
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { ColorsContent } from "./_components/colors-content";

export const metadata: Metadata = {
  description: "Administra el catálogo de colores para modelos de ventanas",
  title: "Catálogo de Colores | Admin",
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
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function ColorsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const search =
    params.search && params.search !== "" ? params.search : undefined;
  const isActive = (
    params.isActive && params.isActive !== "all" ? params.isActive : "all"
  ) as "all" | "active" | "inactive";
  const sortBy = (params.sortBy || "name") as
    | "name"
    | "createdAt"
    | "updatedAt";
  const sortOrder = (params.sortOrder || "asc") as "asc" | "desc";

  // Fetch data OUTSIDE Suspense to avoid EventEmitter memory leak
  const initialData = await api.admin.colors.list({
    isActive,
    limit: 20,
    page,
    search,
    sortBy,
    sortOrder,
  });

  const searchParamsForClient = {
    isActive,
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
          Catálogo de Colores
        </h1>
        <p className="text-muted-foreground">
          Gestiona los colores base que se pueden asignar a los modelos de
          ventanas
        </p>
      </div>

      {/* Content with filters and table */}
      <ColorsContent
        initialData={initialData}
        searchParams={searchParamsForClient}
      />
    </div>
  );
}
