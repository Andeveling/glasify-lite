/**
 * My Quote Detail Page (Public User Version)
 *
 * Server Component that fetches a single quote by ID for the authenticated user
 * and displays its full details. Redirects to sign-in if not authenticated.
 *
 * @route /my-quotes/[quoteId]
 */

import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server-client';
import { QuoteDetailView } from './_components/quote-detail-view';

type MyQuoteDetailPageProps = {
  params: Promise<{
    quoteId: string;
  }>;
};

export default async function MyQuoteDetailPage({ params }: MyQuoteDetailPageProps) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    logger.warn('[MyQuoteDetailPage] Unauthenticated user attempted to access quote', {
      redirectTo: '/api/auth/signin',
    });

    redirect('/api/auth/signin?callbackUrl=/my-quotes');
  }

  const { quoteId } = await params;

  try {
    logger.info('[MyQuoteDetailPage] User accessing quote detail', {
      quoteId,
      userId: session.user.id,
    });

    const quote = await api.quote[ 'get-by-id' ]({ id: quoteId });

    return (
      <div className="container mx-auto max-w-7xl py-8">
        <QuoteDetailView isPublicView quote={quote} />
      </div>
    );
  } catch (error) {
    // If quote not found or access denied, show 404
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      logger.warn('[MyQuoteDetailPage] Quote not found or access denied', {
        error: error.message,
        quoteId,
        userId: session.user.id,
      });

      notFound();
    }

    logger.error('[MyQuoteDetailPage] Error loading quote', {
      error: error instanceof Error ? error.message : 'Unknown error',
      quoteId,
      userId: session.user.id,
    });

    // Re-throw other errors
    throw error;
  }
}
