/**
 * Clients List Component
 *
 * Client Component - Server-optimized pattern.
 *
 * Receives:
 * - initialData: Preloaded server data (SSR)
 * - searchParams: Current filter state (for URL synchronization)
 *
 * Responsibilities:
 * - Display table with data
 * - Handle CRUD actions (edit, delete)
 * - Manage optimistic UI
 *
 * Features:
 * - Optimistic delete with rollback on error
 * - Toast notifications with loading states
 * - Cache invalidation after mutations
 * - Delete confirmation dialog
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog'
import { TablePagination } from '@/app/_components/server-table/table-pagination'
import { api } from '@/trpc/react'
import { ClientsEmpty } from './clients-empty'
import { ClientsTable } from './clients-table'

type ClientWithQuoteCount = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    quotes: number
  }
}

type ClientsListProps = {
  initialData: {
    items: ClientWithQuoteCount[]
    limit: number
    page: number
    total: number
    totalPages: number
  }
  searchParams: {
    page?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

export function ClientsList({ initialData, searchParams }: ClientsListProps) {
  const utils = api.useUtils()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Delete mutation with optimistic UI
  const deleteMutation = api.admin.clients.delete.useMutation({
    onMutate: async (variables) => {
      await utils.admin.clients.list.cancel()

      const previousData = utils.admin.clients.list.getData()

      if (previousData) {
        utils.admin.clients.list.setData(
          {
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || 'createdAt') as
              | 'name'
              | 'company'
              | 'createdAt'
              | 'updatedAt',
            sortOrder: (searchParams.sortOrder || 'desc') as 'asc' | 'desc',
          },
          (old) => {
            if (!old) {
              return old
            }
            return {
              ...old,
              items: old.items.filter((item: ClientWithQuoteCount) => item.id !== variables.id),
              total: old.total - 1,
            }
          },
        )
      }

      toast.loading('Eliminando cliente...', { id: 'delete-client' })

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.admin.clients.list.setData(
          {
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || 'createdAt') as
              | 'name'
              | 'company'
              | 'createdAt'
              | 'updatedAt',
            sortOrder: (searchParams.sortOrder || 'desc') as 'asc' | 'desc',
          },
          context.previousData,
        )
      }
      toast.error('Error al eliminar cliente', {
        description: error.message,
        id: 'delete-client',
      })
    },
    onSettled: () => {
      utils.admin.clients.list.invalidate().catch(undefined)
      router.refresh()
    },
    onSuccess: () => {
      toast.success('Cliente eliminado correctamente', { id: 'delete-client' })
    },
  })

  // Handle edit action - navigate to edit page
  const handleEditAction = (id: string) => {
    router.push(`/admin/clients/${id}/edit`)
  }

  // Handle quote action - navigate to new quote page with client pre-selected
  const handleQuoteAction = (id: string) => {
    router.push(`/admin/quotes/new?clientId=${id}`)
  }

  // Handle delete action - show confirmation dialog
  const handleDeleteAction = (client: { id: string; name: string }) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  // Confirm delete - execute mutation
  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteMutation.mutate({ id: clientToDelete.id })
    }
    setDeleteDialogOpen(false)
    setClientToDelete(null)
  }

  // Cancel delete - close dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setClientToDelete(null)
  }

  // Empty state - no data found
  if (initialData.total === 0) {
    return <ClientsEmpty searchTerm={searchParams.search} />
  }

  // Build dependency info for delete dialog
  const clientBeingDeleted = initialData.items.find((c) => c.id === clientToDelete?.id)
  const quoteCount = clientBeingDeleted?._count.quotes ?? 0
  const dependencies =
    quoteCount > 0
      ? [
          {
            entity: 'Cotización',
            count: quoteCount,
            message: `${quoteCount} cotización(es) asociada(s)`,
          },
        ]
      : []

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        entityLabel={clientToDelete?.name ?? ''}
        entityName="cliente"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            handleDeleteCancel()
          }
        }}
        open={deleteDialogOpen}
        dependencies={dependencies}
      />

      {/* Clients Table */}
      <ClientsTable
        clients={initialData.items}
        onDeleteAction={handleDeleteAction}
        onEditAction={handleEditAction}
        onQuoteAction={handleQuoteAction}
      />

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <TablePagination
          currentPage={initialData.page}
          totalItems={initialData.total}
          totalPages={initialData.totalPages}
        />
      )}
    </>
  )
}
