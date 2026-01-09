/**
 * My Quote Detail Page (Public User Version)
 *
 * Server Component that fetches a single quote by ID for the authenticated user
 * and displays its full details. Redirects to sign-in if not authenticated.
 *
 * @route /my-quotes/[quoteId]
 */

import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import logger from "@/lib/logger";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server-client";
import { QuoteDetailView } from "./_components/quote-detail-view";

/**
 * CRITICAL: Dynamic rendering required
 *
 * This page uses headers() for authentication and PublicLayout with database queries.
 * Already dynamic due to headers() but explicit declaration prevents accidental removal.
 */
export const dynamic = "force-dynamic";

type MyQuoteDetailPageProps = {
  params: Promise<{
    quoteId: string;
  }>;
};

async function QuoteContent({
  quoteId,
  userId,
}: {
  quoteId: string;
  userId: string;
}) {
  try {
    logger.info("[MyQuoteDetailPage] User accessing quote detail", {
      quoteId,
      userId,
    });

    const quote = await api.quote["get-by-id"]({ id: quoteId });

    return <QuoteDetailView isPublicView quote={quote} />;
  } catch (error) {
    // If quote not found or access denied, show 404
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      logger.warn("[MyQuoteDetailPage] Quote not found or access denied", {
        error: error.message,
        quoteId,
        userId,
      });

      notFound();
    }

    logger.error("[MyQuoteDetailPage] Error loading quote", {
      error: error instanceof Error ? error.message : "Unknown error",
      quoteId,
      userId,
    });

    // Re-throw other errors
    throw error;
  }
}

export default async function MyQuoteDetailPage({
  params,
}: MyQuoteDetailPageProps) {
  const { quoteId } = await params;

  // Check authentication OUTSIDE Suspense
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    logger.warn(
      "[MyQuoteDetailPage] Unauthenticated user attempted to access quote",
      {
        redirectTo: "/api/auth/signin",
      }
    );

    redirect("/api/auth/signin?callbackUrl=/my-quotes");
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner className="size-8" />
          </div>
        }
      >
        <QuoteContent quoteId={quoteId} userId={session.user.id} />
      </Suspense>
    </div>
  );
}
