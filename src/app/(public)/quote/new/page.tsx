import { redirect } from 'next/navigation';
import { generateQuoteFromCartAction } from '@/app/_actions/quote.actions';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';
import QuoteGenerationForm from './_components/quote-generation-form';

/**
 * Quote Generation Page
 *
 * Server Component that handles:
 * - Authentication check (redirects if not authenticated)
 * - Quote generation form rendering
 *
 * Cart validation is handled client-side by the form component.
 *
 * @route /quote/new
 */
export default async function QuoteGenerationPage() {
  // Check authentication (required for quote generation)
  const session = await auth();

  if (!session?.user) {
    logger.warn('[QuoteGenerationPage] Unauthenticated user attempted to access quote generation', {
      redirectTo: '/api/auth/signin',
    });

    redirect('/api/auth/signin?callbackUrl=/quote/new');
  }

  logger.info('[QuoteGenerationPage] User accessing quote generation page', {
    userId: session.user.id,
  });

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">Generar Cotización</h1>
        <p className="mt-2 text-muted-foreground">
          Proporciona los detalles del proyecto para generar tu cotización formal con validez de 15 días.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        {/* 
          QuoteGenerationForm is a Client Component that:
          - Retrieves cart items from sessionStorage via useCart hook
          - Validates cart is not empty (redirects to catalog if empty)
          - Submits form data to generateQuoteFromCartAction server action
          - Server action generates quote with transaction and returns result
        */}
        <QuoteGenerationForm onSubmit={generateQuoteFromCartAction} />
      </div>

      {/* Help text */}
      <div className="mt-6 text-muted-foreground text-sm">
        <p>
          <strong>Nota:</strong> La cotización tendrá una validez de 15 días desde su creación. Los precios quedarán
          bloqueados al momento de generar la cotización.
        </p>
      </div>
    </div>
  );
}
