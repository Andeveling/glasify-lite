/**
 * Admin Clients Dashboard
 *
 * Server Component for admin-only client list view.
 * Displays all clients in the system with search and pagination.
 *
 * Architecture:
 * - SSR with force-dynamic (no ISR for admin dashboard)
 * - Server-side filtering and pagination
 * - URL state management for filters
 * - Search by name, company, or email
 *
 * Route: /admin/clients
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next'
import { api } from '@/trpc/server-client'
import { ClientsContent } from './_components/clients-content'

export const metadata: Metadata = {
  title: 'Clientes | Admin',
  description: 'Gestiona todos los clientes del sistema de cotizaciones',
}

type SearchParams = Promise<{
  page?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}>

type PageProps = {
  searchParams: SearchParams
}

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Parse search params with defaults
  const page = Number(params.page) || 1
  const search = params.search && params.search !== '' ? params.search : undefined
  const sortBy = (params.sortBy || 'createdAt') as 'name' | 'company' | 'createdAt' | 'updatedAt'
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc'

  // Fetch clients data (uses adminProcedure - admin sees ALL clients)
  const clientsData = await api.admin.clients.list({
    page,
    search,
    sortBy,
    sortOrder,
    limit: 20,
  })

  const searchParamsForClient = {
    page: String(page),
    search,
    sortBy,
    sortOrder,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona los clientes del sistema de cotizaciones B2B
        </p>
      </div>

      {/* Content with filters and table */}
      <ClientsContent initialData={clientsData} searchParams={searchParamsForClient} />
    </div>
  )
}
