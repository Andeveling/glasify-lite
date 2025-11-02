/**
 * Admin Quote Detail Page (US7 - T030)
 *
 * Server Component for admin quote detail view
 * Displays full quote details + user contact information
 *
 * Route: /admin/quotes/[quoteId]
 * Access: Admin only (protected by middleware)
 * Related: specs/001-admin-quotes-dashboard/spec.md
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { api } from "@/trpc/server-client";
import { UserContactInfo } from "./_components/user-contact-info";

export const metadata: Metadata = {
  title: "Detalle de Cotización | Admin",
  description: "Vista detallada de cotización con información del creador",
};

type PageProps = {
  params: Promise<{
    quoteId: string;
  }>;
};

export default async function AdminQuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params;

  // Fetch quote data with user information
  const quote = await api.quote["get-by-id"]({ id: quoteId });

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <BackLink href="/admin/quotes" variant="outline">
        Volver a cotizaciones
      </BackLink>

      {/* User Contact Info Section (US7) */}
      <UserContactInfo contactPhone={quote.contactPhone} user={quote.user} />

      {/* Quote Details */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 font-semibold text-xl">
          Detalles de la Cotización
        </h2>

        {/* Basic Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Proyecto
            </p>
            <p className="font-semibold">{quote.projectName || "Sin nombre"}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Estado</p>
            <p className="font-semibold">{quote.status}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Total</p>
            <p className="font-semibold">
              {quote.currency} {quote.total.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Cantidad de Items
            </p>
            <p className="font-semibold">{quote.itemCount}</p>
          </div>
          {quote.validUntil && (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Válido hasta
              </p>
              <p className="font-semibold">
                {new Intl.DateTimeFormat("es-LA").format(quote.validUntil)}
              </p>
            </div>
          )}
          <div>
            <p className="font-medium text-muted-foreground text-sm">Creado</p>
            <p className="font-semibold">
              {new Intl.DateTimeFormat("es-LA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(quote.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
