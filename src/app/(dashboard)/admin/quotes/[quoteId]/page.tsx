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

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/trpc/server-client'
import { ClientContactInfo } from './_components/client-contact-info'
import { QuoteActions } from './_components/quote-actions'
import { QuoteDetailView } from './_components/quote-detail-view'

export const metadata: Metadata = {
  title: 'Detalle de Cotización | Admin',
  description:
    'Vista detallada de cotización con información del creador, modelos, medidas y opciones de exportación',
}

type PageProps = {
  params: Promise<{
    quoteId: string
  }>
}

async function QuoteContent({ quoteId }: { quoteId: string }) {
  // Fetch quote data with client information
  const quote = await api.quote['get-by-id']({ id: quoteId })

  if (!quote) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Client Contact Info Section - Admin only */}
      <ClientContactInfo
        client={
          quote.client
            ? {
                id: quote.client.id,
                name: quote.client.name,
                email: quote.client.email,
                phone: quote.client.phone,
                company: quote.client.company,
              }
            : null
        }
        contactPhone={quote.contactPhone}
      />

      {/* Accept/Reject Actions for SENT quotes */}
      {quote.status === 'sent' && <QuoteActions quoteId={quoteId} />}

      {/* Full Quote Details with items, measurements, and export buttons */}
      <QuoteDetailView isPublicView={false} quote={quote} />
    </div>
  )
}

export default async function AdminQuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params

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
  )
}
