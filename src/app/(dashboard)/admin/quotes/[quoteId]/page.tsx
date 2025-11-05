/**
 * Admin Quote Detail Page (US7 - T030)
 *
 * Server Component for admin quote detail view
 * Displays full quote details including items, measurements, and export options
 * Reuses QuoteDetailView component from public my-quotes for consistency
 *
 * Route: /admin/quotes/[quoteId]
 * Access: Admin only (protected by middleware)
 * Related: specs/001-admin-quotes-dashboard/spec.md
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuoteDetailView } from "@/app/(public)/my-quotes/[quoteId]/_components/quote-detail-view";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/server-client";
import { UserContactInfo } from "./_components/user-contact-info";

export const metadata: Metadata = {
  title: "Detalle de Cotización | Admin",
  description:
    "Vista detallada de cotización con información del creador, modelos, medidas y opciones de exportación",
};

type PageProps = {
  params: Promise<{
    quoteId: string;
  }>;
};

async function QuoteContent({ quoteId }: { quoteId: string }) {
  // Fetch quote data with user information
  const quote = await api.quote["get-by-id"]({ id: quoteId });

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* User Contact Info Section (US7) - Admin only */}
      <UserContactInfo contactPhone={quote.contactPhone} user={quote.user} />

      {/* Full Quote Details with items, measurements, and export buttons */}
      <QuoteDetailView isPublicView={false} quote={quote} />
    </div>
  );
}

export default async function AdminQuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <QuoteContent quoteId={quoteId} />
    </Suspense>
  );
}
