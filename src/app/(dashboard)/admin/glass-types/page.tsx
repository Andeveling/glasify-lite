/**
 * Glass Types List Page (US8 - T067)
 *
 * Server Component with Suspense boundaries for streaming
 * Pattern: SSR (Server-Side Rendering) for dashboard routes
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Lightweight queries (suppliers) outside Suspense
 * - Heavy query (glass types list) inside Suspense
 * - Template literal key for proper re-suspension
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Suspense with specific key values for reliable updates
 * - Parallel data fetching where applicable
 *
 * Route: /admin/glass-types
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/server-client";
import { GlassTypesFilters } from "./_components/glass-types-filters";
import { GlassTypesTable } from "./_components/glass-types-table";

export const metadata: Metadata = {
  description:
    "Administra los tipos de cristal con sus soluciones y características",
  title: "Tipos de Cristal | Admin",
};

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)
// Note: Admin routes are dynamic by default - no explicit export needed
// TODO: Evaluate if Suspense boundaries improve UX after build verification

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

// Loading skeleton for the table
function GlassTypesTableSkeleton() {
  const skeletonIds = Array.from(
    { length: 10 },
    (_, i) => `skeleton-${Date.now()}-${i}`
  );

  return (
    <div className="rounded-md border">
      <div className="space-y-3 p-4">
        {skeletonIds.map((id) => (
          <Skeleton className="h-16 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}

// Server Component that fetches and renders the table
async function GlassTypesTableContent({
  page,
  isActive,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  isActive: "all" | "active" | "inactive";
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  // Fetch glass types data (heavy query inside Suspense)
  const initialData = await api.admin["glass-type"].list({
    isActive,
    limit: 20,
    page,
    search,
    sortBy: sortBy as "name" | "thicknessMm" | "pricePerSqm" | "createdAt",
    sortOrder,
  });

  // Transform Decimal fields to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((glassType) => ({
      ...glassType,
      lightTransmission: glassType.lightTransmission?.toNumber() ?? null,
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      solarFactor: glassType.solarFactor?.toNumber() ?? null,
      uValue: glassType.uValue?.toNumber() ?? null,
    })),
  } as const;

  return (
    <GlassTypesTable
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between Prisma and Client types (Decimal vs number serialization)
      initialData={serializedData as any}
      searchParams={{
        isActive,
        page: String(page),
        search,
      }}
    />
  );
}

export default async function GlassTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const isActive = (
    params.isActive && params.isActive !== "all" ? params.isActive : "all"
  ) as "all" | "active" | "inactive";
  const search = params.search || undefined;
  const sortBy = params.sortBy || "name";
  const sortOrder = (params.sortOrder || "asc") as "asc" | "desc";

  // Fetch suppliers for filter dropdown (lightweight query outside Suspense)
  const suppliersData = await api.admin["glass-supplier"].list({
    isActive: "active",
    limit: 100,
    page: 1,
    sortBy: "name",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tipos de Cristal</h1>
        <p className="text-muted-foreground">
          Administra los tipos de cristal con sus soluciones y características
        </p>
      </div>

      {/* Filters outside Suspense - always visible */}
      <GlassTypesFilters
        searchParams={{
          isActive: params.isActive,
          page: String(page),
          search,
        }}
        suppliers={suppliersData.items}
      />

      {/* Table content inside Suspense - streaming */}
      <Suspense
        fallback={<GlassTypesTableSkeleton />}
        key={`${search}-${page}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <GlassTypesTableContent
          isActive={isActive}
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
