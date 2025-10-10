import { api } from '@/trpc/server-client';
import { EmptyQuotesState } from './_components/empty-quotes-state';
import { QuoteListItem } from './_components/quote-list-item';

type QuotesPageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const status = params?.status as 'draft' | 'sent' | 'canceled' | undefined;

  const result = await api.quote['list-user-quotes']({
    includeExpired: false,
    limit: 10,
    page,
    status,
  });

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Mis Cotizaciones</h1>
        <p className="mt-2 text-muted-foreground">Gestiona y revisa todas tus cotizaciones</p>
      </div>

      {result.quotes.length === 0 ? (
        <EmptyQuotesState />
      ) : (
        <div className="space-y-4">
          {result.quotes.map((quote) => (
            <QuoteListItem key={quote.id} quote={quote} />
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
