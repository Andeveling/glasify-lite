import type { Metadata } from 'next';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server-client';
import { EmptyQuotesState } from './_components/empty-quotes-state';
import { QuoteFilters } from './_components/quote-filters';
import { QuoteListItem } from './_components/quote-list-item';

export const metadata: Metadata = {
  description: 'Gestiona y revisa todas las cotizaciones del sistema',
  title: 'Cotizaciones - Glasify Admin',
};

type QuotesPageProps = {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
    userId?: string;
  }>;
};

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const session = await auth();
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = params?.status as 'draft' | 'sent' | 'canceled' | undefined;
  const search = params?.search;
  const userId = params?.userId;

  // Use list-all for admins, list-user-quotes for others
  const result =
    session?.user?.role === 'admin'
      ? await api.quote[ 'list-all' ]({
        includeExpired: false,
        limit: 10,
        page,
        search,
        status,
        userId,
      })
      : await api.quote[ 'list-user-quotes' ]({
        includeExpired: false,
        limit: 10,
        page,
        search,
        status,
      });

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">{isAdmin ? 'Todas las Cotizaciones' : 'Mis Cotizaciones'}</h1>
        <p className="mt-2 text-muted-foreground">
          {isAdmin ? 'Vista completa de cotizaciones de todos los usuarios' : 'Gestiona y revisa todas tus cotizaciones'}
        </p>
      </div>

      <QuoteFilters currentStatus={status} showUserFilter={isAdmin} />

      {result.quotes.length === 0 ? (
        <EmptyQuotesState />
      ) : (
        <div className="space-y-4">
          {result.quotes.map((quote) => (
            <QuoteListItem key={quote.id} quote={quote} showUser={isAdmin} />
          ))}
        </div>
      )}

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
