/**
 * Edit Client Page
 *
 * Server Component - Edit existing client in catalog.
 *
 * Route: /admin/clients/[id]/edit
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/trpc/server-client'
import { ClientForm } from '../../_components/client-form'

export const metadata: Metadata = {
  description: 'Editar cliente del sistema de cotizaciones',
  title: 'Editar Cliente | Admin',
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params

  // Fetch client data server-side
  let client: Awaited<ReturnType<typeof api.admin.clients.getById>>
  try {
    client = await api.admin.clients.getById({ id })
  } catch {
    // Client not found - show 404
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Cliente</h1>
        <p className="text-muted-foreground">
          Modifica los datos del cliente &quot;{client.name}&quot;
        </p>
      </div>

      {/* Client Form */}
      <ClientForm
        defaultValues={{
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          notes: client.notes,
        }}
        mode="edit"
      />
    </div>
  )
}
