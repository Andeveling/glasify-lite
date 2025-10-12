import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server-client';
import { EmptyQuotesState } from './_components/empty-quotes-state';
import { QuoteListItem } from './_components/quote-list-item';

type MyQuotesPageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

/**
 * My Quotes Page (Public - User's Own Quotes)
 *
 * Server Component that displays the authenticated user's quotes.
 * This is the public-facing version for regular users to see their own quotes.
 *
 * Admin users should use /dashboard/quotes to see all quotes.
 *
 * @route /my-quotes
 */
export default async function MyQuotesPage({ searchParams }: MyQuotesPageProps) {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    logger.warn('[MyQuotesPage] Unauthenticated user attempted to access quotes', {
      redirectTo: '/api/auth/signin',
    });

    redirect('/api/auth/signin?callbackUrl=/my-quotes');
  }

  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = params?.status as 'draft' | 'sent' | 'canceled' | undefined;

  logger.info('[MyQuotesPage] User accessing their quotes', {
    page,
    status: status ?? 'all',
    userId: session.user.id,
  });

  // Fetch user's quotes
  const result = await api.quote['list-user-quotes']({
    includeExpired: false,
    limit: 10,
    page,
    status,
  });

  return (
    <div className="container mx-auto max-w-5xl py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <Link href="/catalog">
          <Button className="mb-4" size="sm" variant="ghost">
            <ChevronLeft className="mr-2 size-4" />
            Volver al Catálogo
          </Button>
        </Link>

        <h1 className="font-bold text-3xl tracking-tight">Mis Cotizaciones</h1>
        <p className="mt-2 text-muted-foreground">Gestiona y revisa todas tus cotizaciones generadas</p>
      </div>

      {/* Quotes list or empty state */}
      {result.quotes.length === 0 ? (
        <EmptyQuotesState />
      ) : (
        <div className="space-y-4">
          {result.quotes.map((quote) => (
            <QuoteListItem key={quote.id} quote={quote} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <p className="text-muted-foreground text-sm">
            Página {result.page} de {result.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
