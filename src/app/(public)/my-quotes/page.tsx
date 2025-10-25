import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { BackLink } from '@/components/ui/back-link';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server-client';
import { EmptyQuotesState } from './_components/empty-quotes-state';
import { QuotesTable } from './_components/quotes-table';

type MyQuotesPageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
    q?: string;
    sort?: string;
  }>;
};

/**
 * My Quotes Page (Public - User's Own Quotes)
 *
 * Server Component that displays the authenticated user's quotes.
 * This is the public-facing version for regular users to see their own quotes.
 *
 * Features:
 * - Status filtering (draft, sent, canceled)
 * - Search by project name, address, or items
 * - Sort by date (newest/oldest) or price (high/low)
 * - Pagination
 * - URL-based filters for shareable links
 *
 * Admin users should use /dashboard/quotes to see all quotes.
 *
 * @route /my-quotes
 */
export default async function MyQuotesPage({ searchParams }: MyQuotesPageProps) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    logger.warn('[MyQuotesPage] Unauthenticated user attempted to access quotes', {
      redirectTo: '/api/auth/signin',
    });

    redirect('/api/auth/signin?callbackUrl=/my-quotes');
  }

  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = params?.status as 'draft' | 'sent' | 'canceled' | undefined;
  const searchQuery = params?.q ?? undefined;
  const sortBy = params?.sort as 'newest' | 'oldest' | 'price-high' | 'price-low' | undefined;

  // Map frontend sort values to backend format
  const getSortParams = (sortOption?: string) => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'createdAt' as const, sortOrder: 'asc' as const };
      case 'price-high':
        return { sortBy: 'total' as const, sortOrder: 'desc' as const };
      case 'price-low':
        return { sortBy: 'total' as const, sortOrder: 'asc' as const };
      default:
        return { sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
    }
  };

  const { sortBy: backendSortBy, sortOrder } = getSortParams(sortBy);

  // Fetch user's quotes with filters
  const result = await api.quote['list-user-quotes']({
    includeExpired: false,
    limit: 10,
    page,
    search: searchQuery,
    sortBy: backendSortBy,
    sortOrder,
    status,
  });

  // Check if filters are active
  const hasActiveFilters = Boolean(status || searchQuery || (sortBy && sortBy !== 'newest'));

  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <BackLink className="mb-4" href="/catalog" icon="chevron">
          Volver al Catálogo
        </BackLink>

        <h1 className="font-bold text-3xl tracking-tight">Mis Cotizaciones</h1>
        <p className="mt-2 text-muted-foreground">Gestiona y revisa todas tus cotizaciones generadas</p>
      </div>

      {/* Show empty state or table */}
      {result.quotes.length === 0 ? (
        <EmptyQuotesState variant={hasActiveFilters ? 'no-results' : 'no-quotes'} />
      ) : (
        <QuotesTable data={result} />
      )}
    </div>
  );
}
