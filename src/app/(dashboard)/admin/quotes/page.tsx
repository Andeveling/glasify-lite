/**
 * Admin Quotes Dashboard (US1 - T011)
 *
 * Server Component for admin-only quote list view
 * Displays ALL system quotes (not just current user's)
 *
 * Architecture:
 * - SSR with force-dynamic (no ISR for admin dashboard)
 * - Server-side filtering and pagination
 * - URL state management for filters
 * - Multi-field search (projectName OR user.name)
 *
 * Route: /admin/quotes
 * Access: Admin only (protected by middleware)
 * Related: specs/001-admin-quotes-dashboard/spec.md
 */

import type { Metadata } from "next";
import { api } from "@/trpc/server-client";
import { QuoteList } from "./_components/quote-list";
import { QuoteSortControls } from "./_components/quote-sort-controls";
import { QuotesFilters } from "./_components/quotes-filters";
import { QuotesPagination } from "./_components/quotes-pagination";
import { QuotesSearch } from "./_components/quotes-search";

export const metadata: Metadata = {
  title: "Cotizaciones | Admin",
  description: "Gestiona todas las cotizaciones del sistema",
};

type SearchParams = Promise<{
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function AdminQuotesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params with defaults
  const page = Number(params.page) || 1;
  const status =
    params.status && params.status !== "all"
      ? (params.status as "draft" | "sent" | "canceled")
      : undefined;
  const search = params.search || undefined;
  const sortBy = (params.sortBy || "createdAt") as
    | "createdAt"
    | "total"
    | "validUntil";
  const sortOrder = (params.sortOrder || "desc") as "asc" | "desc";

  // Fetch quotes data (uses sellerOrAdminProcedure - admin sees ALL quotes)
  const quotesData = await api.quote["list-all"]({
    status,
    search,
    sortBy,
    sortOrder,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Cotizaciones</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona todas las cotizaciones del sistema
        </p>
      </div>

      {/* Search (US8 - T033) */}
      <QuotesSearch currentSearch={search} />

      {/* Filters and Sort Controls (US3 - T021, US5 - T027) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <QuotesFilters currentStatus={params.status || "all"} />
        <QuoteSortControls
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
        />
      </div>

      {/* Quote list with initial data */}
      <QuoteList
        initialData={quotesData}
        searchParams={{
          status: params.status,
          search,
          sortBy,
          sortOrder,
          page,
        }}
      />

      {/* Pagination (T036) */}
      <QuotesPagination
        hasNextPage={quotesData.hasNextPage}
        hasPreviousPage={quotesData.hasPreviousPage}
        limit={quotesData.limit}
        page={quotesData.page}
        total={quotesData.total}
        totalPages={quotesData.totalPages}
      />
    </div>
  );
}
